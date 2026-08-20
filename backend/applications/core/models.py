from django.conf import settings
from django.db import models
from django.utils import timezone

from django_timestamps.softDeletion import SoftDeletionModel
from django_timestamps.timestamps import TimestampsModel


class BaseAbstractWithUser(SoftDeletionModel, TimestampsModel):
    """
    Modelo abstracto base con:
    - timestamps
    - baja lógica
    - auditoría de creación, modificación y eliminación
    """

    is_deleted = models.BooleanField(default=False)

    user_made = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="%(app_label)s_%(class)s_created",
        verbose_name="creado por",
    )

    user_updated = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="%(app_label)s_%(class)s_updated",
        verbose_name="actualizado por",
    )

    user_deleted = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="%(app_label)s_%(class)s_deleted",
        verbose_name="eliminado por",
    )

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False, user=None):
        self.is_deleted = True
        self.deleted_at = timezone.now()

        if user:
            self.user_deleted = user

        self.save(
            update_fields=[
                "is_deleted",
                "deleted_at",
                "user_deleted",
            ]
        )
