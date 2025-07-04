from django.apps import AppConfig


class ProductivityConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "productivity"

    def ready(self):
        import productivity.signals
