from rest_framework import serializers

from .models import Peon, Tarja, HoraExtra, ValorJornal


class PeonSerializer(serializers.ModelSerializer):

    class Meta:
        model = Peon

        fields = [
            "id",
            "nombre",
            "activo",
            "created_at",
            "updated_at",
            "user_made",
            "user_updated",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "user_made",
            "user_updated",
        ]


class TarjaSerializer(serializers.ModelSerializer):

    peon_nombre = serializers.CharField(
        source="peon.nombre",
        read_only=True,
    )

    fraccion_display = serializers.CharField(
        source="get_fraccion_display",
        read_only=True,
    )

    tarea_display = serializers.CharField(
        source="get_tarea_display",
        read_only=True,
    )

    class Meta:
        model = Tarja

        fields = [
            "id",
            "peon",
            "peon_nombre",
            "fecha",
            "fraccion",
            "fraccion_display",
            "tarea",
            "tarea_display",
            "observacion",
        ]




class ValorJornalSerializer(serializers.ModelSerializer):

    class Meta:
        model = ValorJornal
        fields = [
            "id",
            "valor",
            "vigente_desde",
            "activo",
        ]


class HoraExtraSerializer(serializers.ModelSerializer):

    peon_nombre = serializers.CharField(
        source="peon.nombre",
        read_only=True,
    )

    motivo_display = serializers.CharField(
        source="get_motivo_display",
        read_only=True,
    )

    estado_display = serializers.CharField(
        source="get_estado_display",
        read_only=True,
    )

    class Meta:
        model = HoraExtra

        fields = [
            "id",
            "peon",
            "peon_nombre",
            "fecha",
            "cantidad_horas",
            "motivo",
            "motivo_display",
            "estado",
            "estado_display",
            "valor_jornal_aplicado",
            "valor_hora",
            "total",
        ]

        read_only_fields = [
            "estado",
            "valor_jornal_aplicado",
            "valor_hora",
            "total",
        ]