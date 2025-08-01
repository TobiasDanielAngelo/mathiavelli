# Generated by Django 5.2.1 on 2025-08-02 01:57

import core.fields
import django.utils.timezone
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('personal', '0005_remove_document_created_at_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='credential',
            name='created_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='credential',
            name='updated_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='document',
            name='created_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='document',
            name='updated_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='dream',
            name='created_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='dream',
            name='updated_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='journal',
            name='created_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='journal',
            name='updated_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='platform',
            name='created_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='platform',
            name='updated_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
    ]
