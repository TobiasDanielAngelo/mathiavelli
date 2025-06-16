from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


class AmountField(models.DecimalField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("max_digits", 10)
        kwargs.setdefault("decimal_places", 2)
        super().__init__(*args, **kwargs)


class DecimalField(models.DecimalField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("max_digits", 10)
        kwargs.setdefault("decimal_places", 3)
        super().__init__(*args, **kwargs)


class LongCharField(models.CharField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("max_length", 1023)
        kwargs.setdefault("default", "")
        kwargs.setdefault("blank", True)
        super().__init__(*args, **kwargs)


class MediumCharField(models.CharField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("max_length", 255)
        kwargs.setdefault("default", "")
        kwargs.setdefault("blank", True)
        super().__init__(*args, **kwargs)


class ShortCharField(models.CharField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("max_length", 50)
        kwargs.setdefault("default", "")
        kwargs.setdefault("blank", True)
        super().__init__(*args, **kwargs)


class ColorField(models.CharField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("max_length", 7)
        kwargs.setdefault("help_text", "Hex color code, e.g. #FF5733")
        super().__init__(*args, **kwargs)


class AutoCreatedAtField(models.DateTimeField):
    """
    Automatically sets the datetime when the object is first created.
    Equivalent to auto_now_add=True. Not editable.
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("auto_now_add", True)
        super().__init__(*args, **kwargs)


class AutoUpdatedAtField(models.DateTimeField):
    """
    Automatically updates the datetime every time the object is saved.
    Equivalent to auto_now=True. Not editable.
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("auto_now", True)
        super().__init__(*args, **kwargs)


class DefaultNowField(models.DateTimeField):
    """
    Sets the default datetime to now, but allows manual editing.
    Useful for editable timestamps that default to current time.
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("default", timezone.now)
        kwargs.setdefault("null", True)
        kwargs.setdefault("blank", True)
        super().__init__(*args, **kwargs)


class OptionalDateTimeField(models.DateTimeField):
    """
    A fully optional DateTimeField with no default.
    Useful for fields that may be left empty (e.g. closed_at, due_at).
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("null", True)
        kwargs.setdefault("blank", True)
        super().__init__(*args, **kwargs)


class OptionalDateField(models.DateField):
    """
    A fully optional DateTimeField with no default.
    Useful for fields that may be left empty (e.g. closed_at, due_at).
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("null", True)
        kwargs.setdefault("blank", True)
        super().__init__(*args, **kwargs)


class ChoiceIntegerField(models.IntegerField):
    """
    IntegerField that accepts choices as first positional argument.
    Automatically sets default to 0. Safe for migrations.
    """

    def __init__(self, choices_list, *args, **kwargs):
        self._choices_list = choices_list  # store for deconstruction
        kwargs.setdefault("choices", choices_list)
        kwargs.setdefault("default", 0)
        super().__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        # Ensure first argument is the choices list
        args = [self._choices_list] + args
        # Remove choices/default if they're auto-set
        if kwargs.get("choices") == self._choices_list:
            del kwargs["choices"]
        if kwargs.get("default") == 0:
            del kwargs["default"]
        return name, path, args, kwargs


class DefaultBooleanField(models.BooleanField):
    """
    BooleanField where the first argument is treated as the default value.
    Usage:
        is_active = DefaultBooleanField(True)
    """

    def __init__(self, default_value, *args, **kwargs):
        self._default_value = default_value  # for deconstruction
        kwargs.setdefault("default", default_value)
        super().__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        args = [self._default_value] + args
        if kwargs.get("default") == self._default_value:
            del kwargs["default"]
        return name, path, args, kwargs


class ForeignKey(models.ForeignKey):
    """
    Base FK with auto related_name = <modelname>_<fieldname> (if not set).
    """

    def __init__(self, to, *args, **kwargs):
        self._to_model = to
        self._related_name_set = "related_name" in kwargs
        super().__init__(to, *args, **kwargs)

    def contribute_to_class(self, cls, name, **kwargs):
        if not self._related_name_set:
            self.remote_field.related_name = f"{cls.__name__.lower()}_{name}"
        super().contribute_to_class(cls, name, **kwargs)


class CascadeRequiredForeignKey(ForeignKey):
    """
    Required ForeignKey with CASCADE delete and auto related_name.
    """

    def __init__(self, to, *args, **kwargs):
        kwargs.setdefault("on_delete", models.CASCADE)
        super().__init__(to, *args, **kwargs)


class CascadeOptionalForeignKey(ForeignKey):
    """
    Optional ForeignKey with CASCADE delete and auto related_name.
    """

    def __init__(self, to, *args, **kwargs):
        kwargs.setdefault("on_delete", models.CASCADE)
        kwargs.setdefault("null", True)
        kwargs.setdefault("blank", True)
        super().__init__(to, *args, **kwargs)


class SetNullOptionalForeignKey(ForeignKey):
    """
    Optional ForeignKey with SET_NULL delete and auto related_name.
    """

    def __init__(self, to, *args, **kwargs):
        kwargs.setdefault("on_delete", models.SET_NULL)
        kwargs.setdefault("null", True)
        kwargs.setdefault("blank", True)
        super().__init__(to, *args, **kwargs)


class ManyToManyField(models.ManyToManyField):
    """
    ManyToManyField with auto related_name = <modelname>_<fieldname> if not set.
    """

    def __init__(self, to, *args, **kwargs):
        self._to_model = to
        self._related_name_set = "related_name" in kwargs
        super().__init__(to, *args, **kwargs)

    def contribute_to_class(self, cls, name, **kwargs):
        if not self._related_name_set:
            self.remote_field.related_name = f"{cls.__name__.lower()}_{name}"
        super().contribute_to_class(cls, name, **kwargs)


class OptionalManyToManyField(ManyToManyField):
    def __init__(self, to, *args, **kwargs):
        kwargs.setdefault("blank", True)
        super().__init__(to, *args, **kwargs)


class OneToOneField(models.OneToOneField):
    """
    OneToOneField with auto related_name = <modelname>_<fieldname> if not set.
    """

    def __init__(self, to, *args, **kwargs):
        self._to_model = to
        self._related_name_set = "related_name" in kwargs
        super().__init__(to, *args, **kwargs)

    def contribute_to_class(self, cls, name, **kwargs):
        if not self._related_name_set:
            self.remote_field.related_name = f"{cls.__name__.lower()}_{name}"
        super().contribute_to_class(cls, name, **kwargs)


class OptionalOneToOneField(OneToOneField):
    def __init__(self, to, *args, **kwargs):
        kwargs.setdefault("null", True)
        kwargs.setdefault("blank", True)
        kwargs.setdefault("on_delete", models.CASCADE)
        super().__init__(to, *args, **kwargs)


class OptionalEmailField(models.EmailField):
    """
    EmailField with null=True, blank=True by default.
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("null", True)
        kwargs.setdefault("blank", True)
        super().__init__(*args, **kwargs)


class OptionalURLField(models.URLField):
    """
    EmailField with null=True, blank=True by default.
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("null", True)
        kwargs.setdefault("blank", True)
        super().__init__(*args, **kwargs)


class LimitedDecimalField(models.DecimalField):
    """
    A DecimalField with optional min/max value constraints using positional arguments.

    Usage:
        LimitedDecimalField(0, 10)       # min=0, max=10
        LimitedDecimalField(None, 10)    # max=10 only
        LimitedDecimalField(5)           # min=5 only
        LimitedDecimalField()            # no limits

    Automatically adds MinValueValidator and MaxValueValidator based on arguments.
    Defaults to max_digits=10 and decimal_places=2 if not provided.
    """

    def __init__(self, *args, **kwargs):
        validators = kwargs.pop("validators", [])

        # Handle positional limits
        min_value = None
        max_value = None
        if len(args) == 1:
            min_value = args[0]
        elif len(args) == 2:
            min_value, max_value = args

        if min_value is not None:
            validators.append(MinValueValidator(min_value))
        if max_value is not None:
            validators.append(MaxValueValidator(max_value))

        kwargs["validators"] = validators

        # Sensible defaults for DecimalField
        kwargs.setdefault("max_digits", 10)
        kwargs.setdefault("decimal_places", 2)

        super().__init__(**kwargs)
