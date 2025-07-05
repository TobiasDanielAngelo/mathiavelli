from django.db import models
from . import fields


class CustomModel(models.Model):
    def __str__(self):
        display_fields = [
            str(getattr(self, field.name))
            for field in self._meta.fields
            if getattr(field, "display", False)
        ]
        return " - ".join(display_fields) if display_fields else super().__str__()

    class Meta:
        abstract = True

    def delete(self, *args, **kwargs):
        if self.pk > 1000000:
            raise Exception("This item is read-only and cannot be deleted.")
        super().delete(*args, **kwargs)


class Setting(CustomModel):
    key = fields.ShortCharField(unique=True, display=True)
    value = fields.LongCharField()
    description = fields.MediumCharField()
