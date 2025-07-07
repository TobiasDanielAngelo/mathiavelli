from django.db import models
from . import fields
from decimal import Decimal
from django.core.exceptions import ValidationError


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

    def clean(self):
        if self.key not in ["UGW", "GW4", "GW3", "GW2", "GW1"]:
            return  # skip non-goal settings
        if self.value is None:
            return

        keys_order = ["UGW", "GW4", "GW3", "GW2", "GW1"]
        settings = {s.key: s.value for s in Setting.objects.filter(key__in=keys_order)}

        # include this instance’s current value
        settings[self.key] = self.value

        last_value = None
        for k in keys_order:
            val = settings.get(k)
            if val is None:
                continue  # skip if no value
            if last_value is not None and Decimal(val) <= Decimal(last_value):
                raise ValidationError(
                    f"{k} must be greater than previous non-empty goal."
                )
            last_value = val
