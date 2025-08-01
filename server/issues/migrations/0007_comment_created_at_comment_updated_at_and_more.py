# Generated by Django 5.2.1 on 2025-08-02 01:57

import core.fields
import django.utils.timezone
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('issues', '0006_remove_comment_created_at_remove_note_created_at_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='created_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='comment',
            name='updated_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='note',
            name='created_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='note',
            name='updated_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='tag',
            name='created_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='tag',
            name='updated_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='ticket',
            name='created_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='ticket',
            name='updated_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
    ]
