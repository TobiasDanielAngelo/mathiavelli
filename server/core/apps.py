from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"

    def ready(self):
        from . import signals
        import sys

        if "runserver" in sys.argv:
            print("Welcome Daniel!")
