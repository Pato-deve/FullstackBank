# Generated by Django 5.1.3 on 2024-11-27 05:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finanzas', '0004_prestamo_fecha_inicio_prestamo_meses_duracion'),
    ]

    operations = [
        migrations.AddField(
            model_name='prestamo',
            name='estado',
            field=models.CharField(choices=[('activo', 'Activo'), ('pagado', 'Pagado')], default='activo', max_length=10),
        ),
    ]
