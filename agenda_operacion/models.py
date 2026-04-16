from django.db import models

# Create your models here.

from django.utils import timezone # Agregado para manejar la fecha y hora en la bitácora no olvidar


class Cita(models.Model):
    id_cita = models.AutoField(primary_key=True)
    cliente = models.ForeignKey(
        'seguridad_y_personal.Persona',
        on_delete=models.PROTECT,
        db_column='id_cliente',
        related_name='citas_como_cliente'
    )
    barbero = models.ForeignKey(
        'seguridad_y_personal.Persona',
        on_delete=models.PROTECT,
        db_column='id_barbero',
        related_name='citas_como_barbero'
    )
    servicio = models.ForeignKey(
        'servicios_productos_promociones.Servicio',
        on_delete=models.PROTECT,
        db_column='id_servicio',
        related_name='citas'
    )
    fecha_programada = models.DateTimeField()
    minutos_retraso = models.IntegerField(default=0)
    aplica_recargo = models.BooleanField(default=False)
    estado_cita = models.CharField(max_length=50, default='Pendiente')

    class Meta:
        db_table = 'cita'

    def __str__(self):
        return f"Cita {self.id_cita}"


class HorarioLaboral(models.Model):
    id_horario = models.AutoField(primary_key=True)
    dia = models.IntegerField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()

    class Meta:
        db_table = 'horario_laboral'

    def __str__(self):
        return f"Dia {self.dia}"


class HorarioBarbero(models.Model):
    horario = models.ForeignKey(
        'agenda_operacion.HorarioLaboral',
        on_delete=models.PROTECT,
        db_column='id_horario',
        related_name='horarios_barbero'
    )
    barbero = models.ForeignKey(
        'seguridad_y_personal.Persona',
        on_delete=models.PROTECT,
        db_column='id_barbero',
        related_name='barbero_horarios'
    )

    class Meta:
        db_table = 'horario_barbero'
        constraints = [
            models.UniqueConstraint(fields=['horario', 'barbero'], name='uq_horario_barbero')
        ]

    def __str__(self):
        return f"{self.barbero} - {self.horario}"


class Asistencia(models.Model):
    id_asistencia = models.AutoField(primary_key=True)
    barbero = models.ForeignKey(
        'seguridad_y_personal.Persona',
        on_delete=models.PROTECT,
        db_column='id_barbero',
        related_name='asistencias'
    )
    fecha = models.DateField(default=timezone.localdate)
    hora_entrada = models.TimeField(null=True, blank=True)
    hora_salida = models.TimeField(null=True, blank=True)

    class Meta:
        db_table = 'asistencia'

    def __str__(self):
        return f"{self.barbero} - {self.fecha}"