# Generated by Django 5.2.1 on 2025-07-01 02:47

import core.fields
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', core.fields.LongCharField(blank=True, default='', max_length=1023, unique=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', core.fields.MediumCharField(blank=True, default='', max_length=255)),
                ('description', core.fields.LongCharField(blank=True, default='', max_length=1023)),
                ('status', core.fields.ChoiceIntegerField([(0, 'Open'), (1, 'In Progress'), (2, 'Closed')], 0)),
                ('priority', core.fields.ChoiceIntegerField([(0, 'Low'), (1, 'Medium'), (2, 'High')], 0)),
                ('created_at', core.fields.AutoCreatedAtField(auto_now_add=True)),
                ('updated_at', core.fields.DefaultNowField(blank=True, default=django.utils.timezone.now, null=True)),
                ('assigned_to', core.fields.SetNullOptionalForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('tags', core.fields.ManyToManyField(to='issues.tag')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', core.fields.LongCharField(blank=True, default='', max_length=1023)),
                ('created_at', core.fields.AutoCreatedAtField(auto_now_add=True)),
                ('user', core.fields.CascadeRequiredForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('ticket', core.fields.CascadeRequiredForeignKey(on_delete=django.db.models.deletion.CASCADE, to='issues.ticket')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
