from django.db import transaction

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Peon, Tarja
from .serializers import TarjaSerializer,PeonSerializer

class PeonViewSet(viewsets.ModelViewSet):
    serializer_class = PeonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Peon.objects.filter(
            is_deleted=False
        ).order_by("nombre")

    def perform_create(self, serializer):
        serializer.save(
            user_made=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save(
            user_updated=self.request.user
        )

    def perform_destroy(self, instance):
        instance.delete(
            user=self.request.user
        )





class TarjaViewSet(viewsets.ModelViewSet):
    serializer_class = TarjaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Tarja.objects
            .filter(is_deleted=False)
            .select_related("peon")
        )

        peon = self.request.query_params.get("peon")
        year = self.request.query_params.get("year")
        month = self.request.query_params.get("month")

        if peon:
            queryset = queryset.filter(
                peon_id=peon
            )

        if year:
            queryset = queryset.filter(
                fecha__year=year
            )

        if month:
            queryset = queryset.filter(
                fecha__month=month
            )

        return queryset.order_by("fecha")

    def perform_create(self, serializer):
        serializer.save(
            user_made=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save(
            user_updated=self.request.user
        )

    def perform_destroy(self, instance):
        instance.delete(
            user=self.request.user
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="carga-mensual",
    )
    def carga_mensual(self, request):
        peon_id = request.data.get("peon")
        registros = request.data.get("registros", [])

        if not peon_id:
            return Response(
                {
                    "detail": "Debe seleccionar un peón."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(registros, list):
            return Response(
                {
                    "detail": "Los registros deben ser una lista."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            peon = Peon.objects.get(
                id=peon_id,
                is_deleted=False,
                activo=True,
            )
        except Peon.DoesNotExist:
            return Response(
                {
                    "detail": "El peón seleccionado no existe o no está activo."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        creados = 0
        actualizados = 0
        eliminados = 0

        with transaction.atomic():
            for registro in registros:
                fecha = registro.get("fecha")
                fraccion = registro.get("fraccion")
                tarea = registro.get("tarea", "")
                observacion = registro.get(
                    "observacion",
                    ""
                )

                if not fecha:
                    return Response(
                        {
                            "detail": "Todos los registros deben tener fecha."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                tarja = (
                    Tarja._base_manager
                    .filter(
                        peon=peon,
                        fecha=fecha,
                    )
                    .order_by("-id")
                    .first()
                )

                # Si viene fraccion = null,
                # interpretamos que hay que quitar ese día.
                if fraccion is None:
                    if tarja and not tarja.is_deleted:
                        tarja.delete(
                            user=request.user
                        )
                        eliminados += 1

                    continue

                if fraccion not in {
                    Tarja.Fraccion.COMPLETO,
                    Tarja.Fraccion.MEDIO,
                }:
                    return Response(
                        {
                            "detail": (
                                f"La fracción '{fraccion}' "
                                f"no es válida para {fecha}."
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if tarja:
                    tarja.fraccion = fraccion
                    tarja.tarea = tarea
                    tarja.observacion = observacion

                    # Si existía pero estaba dado de baja,
                    # lo restauramos.
                    tarja.is_deleted = False
                    tarja.deleted_at = None
                    tarja.user_deleted = None

                    tarja.user_updated = request.user

                    tarja.save()

                    actualizados += 1

                else:
                    Tarja.objects.create(
                        peon=peon,
                        fecha=fecha,
                        fraccion=fraccion,
                        tarea=tarea,
                        observacion=observacion,
                        user_made=request.user,
                    )

                    creados += 1

        return Response(
            {
                "detail": "Tarjas guardadas correctamente.",
                "creados": creados,
                "actualizados": actualizados,
                "eliminados": eliminados,
            },
            status=status.HTTP_200_OK,
        )

from decimal import Decimal

from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import HoraExtra, ValorJornal
from .serializers import HoraExtraSerializer



class HoraExtraViewSet(viewsets.ModelViewSet):
    serializer_class = HoraExtraSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            HoraExtra.objects
            .filter(is_deleted=False)
            .select_related("peon")
            .order_by("-fecha", "-id")
        )

    def perform_create(self, serializer):

        fecha = serializer.validated_data["fecha"]

        valor_jornal = (
            ValorJornal.objects
            .filter(
                is_deleted=False,
                activo=True,
                vigente_desde__lte=fecha,
            )
            .order_by("-vigente_desde")
            .first()
        )

        if not valor_jornal:
            raise serializers.ValidationError({
                "detail": (
                    "No existe un valor de jornal "
                    "vigente para esa fecha."
                )
            })

        cantidad_horas = serializer.validated_data[
            "cantidad_horas"
        ]

        valor_hora = (
            valor_jornal.valor / Decimal("8")
        )

        total = (
            valor_hora *
            Decimal(cantidad_horas)
        )

        serializer.save(
            estado=HoraExtra.Estado.PENDIENTE,
            valor_jornal_aplicado=valor_jornal.valor,
            valor_hora=valor_hora,
            total=total,
            user_made=self.request.user,
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.estado != HoraExtra.Estado.PENDIENTE:
            raise serializers.ValidationError({
                "detail": (
                    "No se puede modificar una hora extra liquidada."
                )
            })

        campos_permitidos = {
            "cantidad_horas"
        }

        campos_recibidos = set(request.data.keys())

        if not campos_recibidos.issubset(campos_permitidos):
            raise serializers.ValidationError({
                "detail": (
                    "Solo se puede modificar la cantidad de horas."
                )
            })

        return super().update(
            request,
            *args,
            **kwargs
        )

    def perform_update(self, serializer):

        instance = self.get_object()

        cantidad_horas = serializer.validated_data.get(
            "cantidad_horas",
            instance.cantidad_horas,
        )

        total = (
            instance.valor_hora *
            Decimal(cantidad_horas)
        )

        serializer.save(
            total=total,
            user_updated=self.request.user,
        )

    def perform_destroy(self, instance):

        if instance.estado != HoraExtra.Estado.PENDIENTE:
            raise serializers.ValidationError({
                "detail": (
                    "No se puede eliminar una hora extra liquidada."
                )
            })

        instance.delete(
            user=self.request.user
        )