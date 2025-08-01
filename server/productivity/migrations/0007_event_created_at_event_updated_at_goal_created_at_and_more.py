# Generated by Django 5.2.1 on 2025-08-02 01:57

import core.fields
import django.utils.timezone
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('productivity', '0006_habit_points'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='created_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='event',
            name='updated_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='goal',
            name='created_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='goal',
            name='updated_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='habit',
            name='created_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='habit',
            name='updated_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='habitlog',
            name='created_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='habitlog',
            name='updated_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='redeempoint',
            name='created_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='redeempoint',
            name='updated_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='schedule',
            name='created_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='schedule',
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
            model_name='task',
            name='created_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='task',
            name='updated_at',
            field=core.fields.OptionalDateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
    ]
