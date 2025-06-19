from django.apps import AppConfig


class MyappConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "myapp"

    def ready(self):
        from . import signals
        import sys

        if "runserver" in sys.argv:
            print("Welcome Daniel!")
