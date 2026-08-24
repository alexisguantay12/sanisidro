from rest_framework.permissions import BasePermission


class EsOperaciones(BasePermission):
    message = "No tiene permisos para acceder a este módulo."

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        return user.groups.filter(
            name="OPERACIONES"
        ).exists()


class EsAdministracion(BasePermission):
    message = "No tiene permisos para acceder a Administración."

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        return user.groups.filter(
            name="ADMINISTRACION"
        ).exists()