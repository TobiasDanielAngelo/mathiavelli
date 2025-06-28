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


class Setting(CustomModel):
    key = fields.ShortCharField(unique=True, display=True)
    value = fields.MediumCharField()
    description = fields.MediumCharField()
