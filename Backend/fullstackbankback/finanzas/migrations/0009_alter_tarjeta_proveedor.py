# Generated by Django 5.1.3 on 2024-11-30 18:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finanzas', '0008_tarjeta_proveedor'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tarjeta',
            name='proveedor',
            field=models.CharField(blank=True, choices=[('visa', 'Visa'), ('mastercard', 'MasterCard')], max_length=50, null=True),
        ),
    ]
