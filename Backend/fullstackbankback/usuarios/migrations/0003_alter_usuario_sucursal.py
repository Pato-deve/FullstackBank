# Generated by Django 5.1.3 on 2024-12-05 19:43

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sucursales', '0001_initial'),
        ('usuarios', '0002_usuario_es_empleado_usuario_sucursal'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usuario',
            name='sucursal',
            field=models.ForeignKey(blank=True, default=1, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='empleados', to='sucursales.sucursal'),
        ),
    ]
