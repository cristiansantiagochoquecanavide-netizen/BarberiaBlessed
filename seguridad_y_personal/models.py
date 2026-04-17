from django.db import models

# Create your models here.

from django.utils import timezone # Agregado para manejar la fecha y hora en la bitácora no olvidar


class Persona(models.Model):
    id_persona = models.AutoField(primary_key=True)
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20, null=True, blank=True)
    correo = models.CharField(max_length=100, unique=True, null=True, blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)

    es_barbero = models.BooleanField(default=False)
    es_cliente = models.BooleanField(default=False)

    ci = models.CharField(max_length=20, null=True, blank=True)
    direccion = models.CharField(max_length=200, null=True, blank=True)
    especialidad = models.CharField(max_length=100, null=True, blank=True)
    calificacion_promedio = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    comision = models.ForeignKey(
        'configuracion_catalagos.ComisionConfig',
        on_delete=models.PROTECT,
        db_column='id_comision',
        null=True,
        blank=True,
        related_name='personas_comision'
    )
    estado_barbero = models.BooleanField(default=True)

    fecha_ultima_visita = models.DateField(null=True, blank=True)
    barbero_preferido = models.ForeignKey(
        'self',
        on_delete=models.PROTECT,
        db_column='id_barbero_preferido',
        null=True,
        blank=True,
        related_name='clientes_preferidos'
    )

    class Meta:
        db_table = 'persona'

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"


class Rol(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)

    class Meta:
        db_table = 'rol'

    def __str__(self):
        return self.nombre


class Usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    persona = models.OneToOneField(
        'seguridad_y_personal.Persona',
        on_delete=models.CASCADE,
        db_column='id_persona',
        related_name='usuario'
    )
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=100)
    estado = models.BooleanField(default=True)

    class Meta:
        db_table = 'usuario'

    def __str__(self):
        return self.username


class UsuarioRol(models.Model):
    usuario = models.ForeignKey(
        'seguridad_y_personal.Usuario',
        on_delete=models.PROTECT,
        db_column='id_usuario',
        related_name='usuario_roles'
    )
    rol = models.ForeignKey(
        'seguridad_y_personal.Rol',
        on_delete=models.PROTECT,
        db_column='id_rol',
        related_name='rol_usuarios'
    )

    class Meta:
        db_table = 'usuario_rol'
        constraints = [
            models.UniqueConstraint(fields=['usuario', 'rol'], name='uq_usuario_rol')
        ]

    def __str__(self):
        return f"{self.usuario} - {self.rol}"


class Bitacora(models.Model):
    id_bitacora = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(
        'seguridad_y_personal.Usuario',
        on_delete=models.PROTECT,
        db_column='id_usuario',
        related_name='bitacoras'
    )
    fecha_hora = models.DateTimeField(default=timezone.now)
    tabla_afectada = models.CharField(max_length=50, null=True, blank=True)
    accion = models.CharField(max_length=50, null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'bitacora'

    def __str__(self):
        return f"{self.accion} - {self.tabla_afectada}"


class IntentoFallidoLogin(models.Model):
    """
    Modelo para rastrear intentos fallidos de login
    Permite bloquear una cuenta después de 3 intentos fallidos durante 5 minutos
    """
    id_intento = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(
        'seguridad_y_personal.Usuario',
        on_delete=models.CASCADE,
        db_column='id_usuario',
        related_name='intentos_fallidos'
    )
    fecha_intento = models.DateTimeField(default=timezone.now)  # Fecha y hora del intento fallido
    bloqueado_hasta = models.DateTimeField(null=True, blank=True)  # Hasta cuándo estará bloqueado
    
    class Meta:
        db_table = 'intento_fallido_login'
    
    def __str__(self):
        return f"Intento fallido - {self.usuario.username} - {self.fecha_intento}"
    
    @property
    def esta_bloqueado(self):
        """
        Verifica si el usuario aún está bloqueado
        Retorna True si está bloqueado, False si ya pasó el tiempo
        """
        if self.bloqueado_hasta is None:
            return False
        return timezone.now() < self.bloqueado_hasta
