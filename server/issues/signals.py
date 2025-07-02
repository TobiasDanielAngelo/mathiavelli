from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from .models import Note


@receiver(post_delete, sender=Note)
def delete_file_on_delete(sender, instance, **kwargs):
    if instance.file:
        instance.file.delete(False)


@receiver(pre_save, sender=Note)
def delete_file_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old_file = sender.objects.get(pk=instance.pk).file
    except sender.DoesNotExist:
        return

    new_file = instance.file
    if old_file and old_file != new_file:
        old_file.delete(False)
