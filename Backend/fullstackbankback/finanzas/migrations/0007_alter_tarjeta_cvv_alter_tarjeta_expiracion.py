# Generated by Django 5.1.3 on 2024-11-27 07:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finanzas', '0006_alter_tarjeta_numero_tarjeta_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tarjeta',
            name='cvv',
            field=models.CharField(editable=False, max_length=3),
        ),
        migrations.AlterField(
            model_name='tarjeta',
            name='expiracion',
            field=models.DateField(editable=False),
        ),
    ]
