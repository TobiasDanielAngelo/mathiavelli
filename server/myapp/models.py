from django.db import models


class Journal(models.Model):
    """Represents a user-submitted journal entry with optional status tracking."""

    text = models.CharField(max_length=255, blank=True, default="")
    datetime_created = models.DateTimeField(auto_now_add=True)
