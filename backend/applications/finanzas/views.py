from decimal import Decimal

from django.db.models import Q, Sum

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import ValidationError


from applications.finanzas.models import (
    CategoriaFinanciera,
    CuentaFinanciera,
    GrupoFinanciero,
    MovimientoFinanciero,
  
)

from applications.finanzas.permissions import (
    EsFinanzas,
)

from applications.finanzas.serializers import (
    CategoriaFinancieraSerializer,
    CuentaFinancieraSerializer,
    GrupoFinancieroSerializer,
    MovimientoFinancieroSerializer,
    calcular_saldo_actual,
    CategoriaFinancieraSelectorSerializer,
    CuentaFinancieraSelectorSerializer,
)

from applications.finanzas.services import (
    calcular_saldos_movimientos,
)
from rest_framework.response import Response
from applications.finanzas.pagination import (
    MovimientosFinanzasPagination,
)
# ============================================================
# BASE
# ============================================================


class FinanzasBaseViewSet(
    ModelViewSet
):

    permission_classes = [
        IsAuthenticated,
        EsFinanzas,
    ]

    def perform_create(
        self,
        serializer,
    ):
        serializer.save(
            user_made=self.request.user,
            user_updated=self.request.user,
        )

    def perform_update(
        self,
        serializer,
    ):
        serializer.save(
            user_updated=self.request.user,
        )

    def perform_destroy(
        self,
        instance,
    ):
        instance.is_deleted = True
        instance.user_deleted = (
            self.request.user
        )

        instance.save()


# ============================================================
# GRUPOS
# ============================================================


class GrupoFinancieroViewSet(
    FinanzasBaseViewSet
):

    serializer_class = (
        GrupoFinancieroSerializer
    )

    def get_queryset(self):

        queryset = (
            GrupoFinanciero.objects
            .filter(
                is_deleted=False,
            )
            .order_by(
                "nombre",
            )
        )

        activo = (
            self.request.query_params
            .get("activo")
        )

        tipo = (
            self.request.query_params
            .get("tipo")
        )

        if activo is not None:

            if activo.lower() == "true":
                queryset = queryset.filter(
                    activo=True,
                )

            elif activo.lower() == "false":
                queryset = queryset.filter(
                    activo=False,
                )

        if tipo:
            queryset = queryset.filter(
                tipo=tipo,
            )

        return queryset


# ============================================================
# CATEGORIAS
# ============================================================


class CategoriaFinancieraViewSet(
    FinanzasBaseViewSet
):

    serializer_class = (
        CategoriaFinancieraSerializer
    )

    def get_queryset(self):

        queryset = (
            CategoriaFinanciera.objects
            .filter(
                is_deleted=False,
            )
            .select_related(
                "grupo",
            )
            .order_by(
                "grupo__nombre",
                "nombre",
            )
        )

        grupo = (
            self.request.query_params
            .get("grupo")
        )

        activo = (
            self.request.query_params
            .get("activo")
        )

        tipo = (
            self.request.query_params
            .get("tipo")
        )

        if grupo:
            queryset = queryset.filter(
                grupo_id=grupo,
            )

        if tipo:

            if (
                tipo
                == MovimientoFinanciero.Tipo.GASTO
            ):
                tipo_grupo = (
                    GrupoFinanciero.Tipo.EGRESO
                )

            elif (
                tipo
                == MovimientoFinanciero.Tipo.INGRESO
            ):
                tipo_grupo = (
                    GrupoFinanciero.Tipo.INGRESO
                )

            else:
                tipo_grupo = tipo

            queryset = queryset.filter(
                grupo__tipo__in=[
                    tipo_grupo,
                    GrupoFinanciero.Tipo.MIXTO,
                ]
            )

        if activo is not None:

            if activo.lower() == "true":
                queryset = queryset.filter(
                    activo=True,
                    grupo__activo=True,
                )

            elif activo.lower() == "false":
                queryset = queryset.filter(
                    activo=False,
                )

        return queryset
    @action(
        detail=False,
        methods=["get"],
        url_path="selector",
    )
    def selector(
        self,
        request,
    ):

        queryset = (
            CategoriaFinanciera.objects
            .filter(
                is_deleted=False,
                activo=True,
            )
            .select_related(
                "grupo",
            )
            .order_by(
                "nombre",
            )
        )

        tipo = (
            request.query_params
            .get("tipo")
        )

        if tipo == MovimientoFinanciero.Tipo.GASTO:

            queryset = queryset.filter(
                Q(
                    grupo__tipo=(
                        GrupoFinanciero
                        .Tipo
                        .EGRESO
                    )
                )
                |
                Q(
                    grupo__tipo=(
                        GrupoFinanciero
                        .Tipo
                        .MIXTO
                    )
                )
                |
                Q(
                    grupo__isnull=True
                )
            )

        elif tipo == MovimientoFinanciero.Tipo.INGRESO:

            queryset = queryset.filter(
                Q(
                    grupo__tipo=(
                        GrupoFinanciero
                        .Tipo
                        .INGRESO
                    )
                )
                |
                Q(
                    grupo__tipo=(
                        GrupoFinanciero
                        .Tipo
                        .MIXTO
                    )
                )
                |
                Q(
                    grupo__isnull=True
                )
            )

        serializer = (
            CategoriaFinancieraSelectorSerializer(
                queryset,
                many=True,
            )
        )

        return Response(
            serializer.data
        )


# ============================================================
# CUENTAS
# ============================================================


class CuentaFinancieraViewSet(
    FinanzasBaseViewSet
):

    serializer_class = (
        CuentaFinancieraSerializer
    )

    def get_queryset(self):

        queryset = (
            CuentaFinanciera.objects
            .filter(
                is_deleted=False,
            )
            .order_by(
                "nombre",
            )
        )

        activa = (
            self.request.query_params
            .get("activa")
        )

        tipo = (
            self.request.query_params
            .get("tipo")
        )

        if activa is not None:

            if activa.lower() == "true":
                queryset = queryset.filter(
                    activa=True,
                )

            elif activa.lower() == "false":
                queryset = queryset.filter(
                    activa=False,
                )

        if tipo:
            queryset = queryset.filter(
                tipo=tipo,
            )

        return queryset

    # --------------------------------------------------------
    # SALDO
    # --------------------------------------------------------

    @action(
        detail=True,
        methods=["get"],
        url_path="saldo",
    )
    def saldo(
        self,
        request,
        pk=None,
    ):

        cuenta = self.get_object()

        saldo = calcular_saldo_actual(
            cuenta
        )

        return Response({
            "cuenta": {
                "id": cuenta.id,
                "nombre": cuenta.nombre,
                "tipo": cuenta.tipo,
                "tipo_display": (
                    cuenta.get_tipo_display()
                ),
            },
            "saldo_inicial": (
                cuenta.saldo_inicial
            ),
            "saldo_actual": saldo,
        })

    # --------------------------------------------------------
    # MOVIMIENTOS DE LA CUENTA
    # --------------------------------------------------------
    @action(
        detail=True,
        methods=["get"],
        url_path="movimientos",
    )
    def movimientos(
        self,
        request,
        pk=None,
    ):

        cuenta = self.get_object()

        queryset = (
            MovimientoFinanciero.objects
            .filter(
                is_deleted=False,
            )
            .filter(
                Q(
                    cuenta_origen=cuenta
                )
                |
                Q(
                    cuenta_destino=cuenta
                )
            )
            .select_related(
                "categoria",
                "categoria__grupo",
                "cuenta_origen",
                "cuenta_destino",
            )
            .order_by(
                "-fecha",
                "-id",
            )
        )

        paginator = (
            MovimientosFinanzasPagination()
        )

        page = paginator.paginate_queryset(
            queryset,
            request,
            view=self,
        )

        movimientos = list(
            page
        )

        saldos = (
            calcular_saldos_movimientos(
                movimientos
            )
        )

        serializer = (
            MovimientoFinancieroSerializer(
                movimientos,
                many=True,
                context={
                    **self.get_serializer_context(),
                    "saldos_movimientos":
                        saldos,
                },
            )
        )

        return paginator.get_paginated_response({
            "cuenta": (
                CuentaFinancieraSerializer(
                    cuenta,
                    context=self.get_serializer_context(),
                ).data
            ),
            "movimientos": serializer.data,
        })
    @action(
        detail=False,
        methods=["get"],
        url_path="selector",
    )
    def selector(
        self,
        request,
    ):

        cuentas = (
            CuentaFinanciera.objects
            .filter(
                is_deleted=False,
                activa=True,
            )
            .order_by(
                "nombre",
            )
        )

        serializer = (
            CuentaFinancieraSelectorSerializer(
                cuentas,
                many=True,
            )
        )

        return Response(
            serializer.data
        )


# ============================================================
# MOVIMIENTOS
# ============================================================


class MovimientoFinancieroViewSet(
    FinanzasBaseViewSet
):  
    
    pagination_class = (
        MovimientosFinanzasPagination
    )
    serializer_class = (
        MovimientoFinancieroSerializer
    )

    def get_queryset(self):

        queryset = (
            MovimientoFinanciero.objects
            .filter(
                is_deleted=False,
            )
            .select_related(
                "categoria",
                "categoria__grupo",
                "cuenta_origen",
                "cuenta_destino",
            )
            .order_by(
                "-fecha",
                "-id",
            )
        )

        # ----------------------------------------------------
        # FILTROS
        # ----------------------------------------------------

        tipo = (
            self.request.query_params
            .get("tipo")
        )

        categoria = (
            self.request.query_params
            .get("categoria")
        )

        grupo = (
            self.request.query_params
            .get("grupo")
        )

        cuenta = (
            self.request.query_params
            .get("cuenta")
        )

        fecha_desde = (
            self.request.query_params
            .get("fecha_desde")
        )

        fecha_hasta = (
            self.request.query_params
            .get("fecha_hasta")
        )

        buscar = (
            self.request.query_params
            .get("buscar")
        )

        if tipo:
            queryset = queryset.filter(
                tipo=tipo,
            )

        if categoria:
            queryset = queryset.filter(
                categoria_id=categoria,
            )

        if grupo:
            queryset = queryset.filter(
                categoria__grupo_id=grupo,
            )

        if cuenta:
            queryset = queryset.filter(
                Q(
                    cuenta_origen_id=cuenta
                )
                |
                Q(
                    cuenta_destino_id=cuenta
                )
            )

        if fecha_desde:
            queryset = queryset.filter(
                fecha__gte=fecha_desde,
            )

        if fecha_hasta:
            queryset = queryset.filter(
                fecha__lte=fecha_hasta,
            )

        if buscar:
            queryset = queryset.filter(
                Q(
                    descripcion__icontains=buscar
                )
                |
                Q(
                    observacion__icontains=buscar
                )
            )

        return queryset

    def list(
        self,
        request,
        *args,
        **kwargs,
    ):

        queryset = self.filter_queryset(
            self.get_queryset()
        )

        page = self.paginate_queryset(
            queryset
        )

        if page is not None:

            movimientos = list(
                page
            )

            saldos = (
                calcular_saldos_movimientos(
                    movimientos
                )
            )

            serializer = self.get_serializer(
                movimientos,
                many=True,
                context={
                    **self.get_serializer_context(),

                    "saldos_movimientos":
                        saldos,
                },
            )

            return (
                self.get_paginated_response(
                    serializer.data
                )
            )


        movimientos = list(
            queryset
        )

        saldos = (
            calcular_saldos_movimientos(
                movimientos
            )
        )

        serializer = self.get_serializer(
            movimientos,
            many=True,
            context={
                **self.get_serializer_context(),

                "saldos_movimientos":
                    saldos,
            },
        )

        return Response(
            serializer.data
        )


    def perform_destroy(self, instance):
        if instance.origen_modulo:
            raise ValidationError({
                "movimiento": (
                    "Este movimiento fue generado automáticamente "
                    "desde otro módulo y no puede eliminarse."
                )
            })

        instance.is_deleted = True
        instance.user_deleted = self.request.user
        instance.save(
            update_fields=[
                "is_deleted",
                "user_deleted",
            ]
        )

    # --------------------------------------------------------
    # RESUMEN
    # --------------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="resumen",
    )
    def resumen(
        self,
        request,
    ):

        queryset = self.get_queryset()

        ingresos = (
            queryset
            .filter(
                tipo=(
                    MovimientoFinanciero
                    .Tipo
                    .INGRESO
                )
            )
            .aggregate(
                total=Sum("monto")
            )["total"]
            or Decimal("0.00")
        )

        gastos = (
            queryset
            .filter(
                tipo=(
                    MovimientoFinanciero
                    .Tipo
                    .GASTO
                )
            )
            .aggregate(
                total=Sum("monto")
            )["total"]
            or Decimal("0.00")
        )

        transferencias = (
            queryset
            .filter(
                tipo=(
                    MovimientoFinanciero
                    .Tipo
                    .TRANSFERENCIA
                )
            )
            .aggregate(
                total=Sum("monto")
            )["total"]
            or Decimal("0.00")
        )

        resultado = (
            ingresos
            - gastos
        )


        # ========================================================
        # INGRESOS POR GRUPO
        # ========================================================

        ingresos_por_grupo_query = (
            queryset
            .filter(
                tipo=(
                    MovimientoFinanciero
                    .Tipo
                    .INGRESO
                )
            )
            .values(
                "categoria__grupo__nombre"
            )
            .annotate(
                total=Sum("monto")
            )
            .order_by(
                "-total"
            )
        )

        ingresos_por_grupo = [
            {
                "nombre": (
                    item[
                        "categoria__grupo__nombre"
                    ]
                    or "Sin grupo"
                ),
                "total": item["total"],
            }
            for item
            in ingresos_por_grupo_query
        ]


        # ========================================================
        # GASTOS POR GRUPO
        # ========================================================

        gastos_por_grupo_query = (
            queryset
            .filter(
                tipo=(
                    MovimientoFinanciero
                    .Tipo
                    .GASTO
                )
            )
            .values(
                "categoria__grupo__nombre"
            )
            .annotate(
                total=Sum("monto")
            )
            .order_by(
                "-total"
            )
        )

        gastos_por_grupo = [
            {
                "nombre": (
                    item[
                        "categoria__grupo__nombre"
                    ]
                    or "Sin grupo"
                ),
                "total": item["total"],
            }
            for item
            in gastos_por_grupo_query
        ]


        return Response({

            "ingresos":
                ingresos,

            "gastos":
                gastos,

            "resultado":
                resultado,

            "transferencias":
                transferencias,

            "ingresos_por_grupo":
                ingresos_por_grupo,

            "gastos_por_grupo":
                gastos_por_grupo,

    })


