# Generated by Django 5.1.3 on 2024-11-27 00:31

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finanzas', '0002_rename_pago_servicios'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='transferencia',
            name='cuenta',
        ),
        migrations.AddField(
            model_name='transferencia',
            name='cuenta_destino',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='transferencias_recibidas', to='finanzas.cuenta'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='transferencia',
            name='cuenta_origen',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='transferencias_realizadas', to='finanzas.cuenta'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='transferencia',
            name='fecha',
            field=models.DateField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='transferencia',
            name='descripcion',
            field=models.TextField(blank=True, null=True),
        ),
    ]
