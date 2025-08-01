# Generated by Django 5.2.1 on 2025-07-22 04:58

import core.fields
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('productivity', '0003_alter_schedule_start_date'),
    ]

    operations = [
        migrations.CreateModel(
            name='RedeemPoint',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', core.fields.DecimalField(decimal_places=3, max_digits=10)),
                ('log', core.fields.SetNullOptionalForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='productivity.habitlog')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
