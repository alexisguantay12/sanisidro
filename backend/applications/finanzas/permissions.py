from rest_framework.permissions import BasePermission


class EsFinanzas(BasePermission):

    message = (
        "No tiene permisos para acceder "
        "al módulo de Finanzas."
    )

    def has_permission(
        self,
        request,
        view,
    ):
        user = request.user

        if (
            not user
            or not user.is_authenticated
        ):
            return False

        if user.is_superuser:
            return True

        return user.groups.filter(
            name="FINANZAS"
        ).exists()