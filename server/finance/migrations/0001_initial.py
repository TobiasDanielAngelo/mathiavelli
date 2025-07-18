# Generated by Django 5.2.1 on 2025-07-01 02:47

import core.fields
import django.core.validators
import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', core.fields.ShortCharField(blank=True, default='', max_length=50)),
                ('datetime_added', core.fields.DefaultNowField(blank=True, default=django.utils.timezone.now, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='BuyListItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', core.fields.ShortCharField(blank=True, default='', max_length=50)),
                ('description', core.fields.MediumCharField(blank=True, default='', max_length=255)),
                ('estimated_price', core.fields.AmountField(decimal_places=2, max_digits=10)),
                ('added_at', core.fields.AutoCreatedAtField(auto_now_add=True)),
                ('planned_date', core.fields.OptionalDateField(blank=True, null=True)),
                ('priority', core.fields.ChoiceIntegerField([(0, 'Low'), (1, 'Medium'), (2, 'High')], 0)),
                ('status', core.fields.ChoiceIntegerField([(0, 'Pending'), (1, 'Bought'), (2, 'Canceled')], 0)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', core.fields.ShortCharField(blank=True, default='', max_length=50)),
                ('nature', core.fields.ChoiceIntegerField([(0, 'Expense'), (1, 'Income'), (2, 'Transfer'), (3, 'Payable'), (4, 'Receivable')], 0)),
                ('logo', core.fields.ShortCharField(blank=True, default='', max_length=50)),
            ],
            options={
                'verbose_name_plural': 'categories',
            },
        ),
        migrations.CreateModel(
            name='InventoryCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', core.fields.ShortCharField(blank=True, default='', max_length=50)),
            ],
            options={
                'verbose_name_plural': 'inventory categories',
            },
        ),
        migrations.CreateModel(
            name='PersonalItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', core.fields.ShortCharField(blank=True, default='', max_length=50)),
                ('location', core.fields.ShortCharField(blank=True, default='', max_length=50)),
                ('quantity', core.fields.LimitedDecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(1)])),
                ('acquired_date', core.fields.OptionalDateField(blank=True, null=True)),
                ('worth', core.fields.AmountField(decimal_places=2, max_digits=10)),
                ('notes', core.fields.LongCharField(blank=True, default='', max_length=1023)),
                ('is_important', core.fields.DefaultBooleanField(False)),
                ('category', core.fields.SetNullOptionalForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='finance.inventorycategory')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', core.fields.MediumCharField(blank=True, default='', max_length=255)),
                ('amount', core.fields.AmountField(decimal_places=2, max_digits=10)),
                ('datetime_transacted', core.fields.DefaultNowField(blank=True, default=django.utils.timezone.now, null=True)),
                ('category', core.fields.SetNullOptionalForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='finance.category')),
                ('receiver', core.fields.SetNullOptionalForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='finance.account')),
                ('transmitter', core.fields.SetNullOptionalForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='finance.account')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Receivable',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('borrower_name', core.fields.ShortCharField(blank=True, default='', max_length=50)),
                ('lent_amount', core.fields.AmountField(decimal_places=2, max_digits=10)),
                ('description', core.fields.MediumCharField(blank=True, default='', max_length=255)),
                ('datetime_opened', core.fields.DefaultNowField(blank=True, default=django.utils.timezone.now, null=True)),
                ('datetime_due', core.fields.OptionalDateTimeField(blank=True, null=True)),
                ('datetime_closed', core.fields.OptionalDateTimeField(blank=True, null=True)),
                ('is_active', core.fields.DefaultBooleanField(True)),
                ('payment', core.fields.OptionalManyToManyField(blank=True, to='finance.transaction')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Payable',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lender_name', core.fields.ShortCharField(blank=True, default='', max_length=50)),
                ('datetime_opened', core.fields.DefaultNowField(blank=True, default=django.utils.timezone.now, null=True)),
                ('datetime_due', core.fields.OptionalDateTimeField(blank=True, null=True)),
                ('description', core.fields.MediumCharField(blank=True, default='', max_length=255)),
                ('datetime_closed', core.fields.OptionalDateTimeField(blank=True, null=True)),
                ('borrowed_amount', core.fields.AmountField(decimal_places=2, max_digits=10)),
                ('is_active', core.fields.DefaultBooleanField(True)),
                ('payment', core.fields.OptionalManyToManyField(blank=True, to='finance.transaction')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
