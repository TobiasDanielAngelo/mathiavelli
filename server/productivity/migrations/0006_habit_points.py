# Generated by Django 5.2.1 on 2025-07-22 05:06

import core.fields
import django.core.validators
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('productivity', '0005_alter_redeempoint_log'),
    ]

    operations = [
        migrations.AddField(
            model_name='habit',
            name='points',
            field=core.fields.LimitedDecimalField(decimal_places=2, default=1, max_digits=10, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(3)]),
        ),
    ]
