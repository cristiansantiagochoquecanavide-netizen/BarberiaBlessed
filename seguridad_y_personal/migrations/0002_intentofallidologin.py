# Generated migration for IntentoFallidoLogin model

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('seguridad_y_personal', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='IntentoFallidoLogin',
            fields=[
                ('id_intento', models.AutoField(primary_key=True, serialize=False)),
                ('fecha_intento', models.DateTimeField(default=django.utils.timezone.now)),
                ('bloqueado_hasta', models.DateTimeField(blank=True, null=True)),
                ('usuario', models.ForeignKey(db_column='id_usuario', on_delete=django.db.models.deletion.CASCADE, related_name='intentos_fallidos', to='seguridad_y_personal.usuario')),
            ],
            options={
                'db_table': 'intento_fallido_login',
            },
        ),
    ]
