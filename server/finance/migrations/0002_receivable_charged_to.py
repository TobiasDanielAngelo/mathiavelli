# Generated by Django 5.2.1 on 2025-07-13 04:28

import core.fields
import django.db.models.deletion
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='receivable',
            name='charged_to',
            field=core.fields.SetNullOptionalForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='finance.account'),
        ),
    ]
