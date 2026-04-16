from django.db import models

# Create your models here.

from django.utils import timezone # Agregado para manejar la fecha y hora en la bitácora no olvidar 


class Venta(models.Model):
    id_venta = models.AutoField(primary_key=True)
    cliente = models.ForeignKey(
        'seguridad_y_personal.Persona',
        on_delete=models.PROTECT,
        db_column='id_cliente',
        related_name='ventas'
    )
    metodo_pago = models.ForeignKey(
        'configuracion_catalagos.MetodoPago',
        on_delete=models.PROTECT,
        db_column='id_metodo_pago',
        related_name='ventas'
    )
    fecha_hora = models.DateTimeField(default=timezone.now)
    monto_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        db_table = 'venta'

    def __str__(self):
        return f"Venta {self.id_venta}"


class DetalleServicio(models.Model):
    id_detalle = models.AutoField(primary_key=True)
    venta = models.ForeignKey(
        'ventas_caja.Venta',
        on_delete=models.CASCADE,
        db_column='id_venta',
        related_name='detalles_servicio'
    )
    cita = models.ForeignKey(
        'agenda_operacion.Cita',
        on_delete=models.PROTECT,
        db_column='id_cita',
        related_name='detalles_servicio',
        null=True,
        blank=True
    )
    monto_base = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    monto_recargo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    monto_descuento = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    monto_total_cobrado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    comision_barbero = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'detalle_servicio'

    def __str__(self):
        return f"DetalleServicio {self.id_detalle}"


class DetalleProducto(models.Model):
    id_detalle = models.AutoField(primary_key=True)
    venta = models.ForeignKey(
        'ventas_caja.Venta',
        on_delete=models.CASCADE,
        db_column='id_venta',
        related_name='detalles_producto'
    )
    producto = models.ForeignKey(
        'servicios_productos_promociones.Producto',
        on_delete=models.PROTECT,
        db_column='id_producto',
        related_name='detalles_producto'
    )
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'detalle_producto'

    def __str__(self):
        return f"DetalleProducto {self.id_detalle}"


class Caja(models.Model):
    id_caja = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(
        'seguridad_y_personal.Usuario',
        on_delete=models.PROTECT,
        db_column='id_usuario',
        related_name='cajas'
    )
    fecha_apertura = models.DateTimeField(default=timezone.now)
    monto_apertura = models.DecimalField(max_digits=10, decimal_places=2)
    monto_cierre = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    estado = models.BooleanField(default=True)

    class Meta:
        db_table = 'caja'

    def __str__(self):
        return f"Caja {self.id_caja}"


class MovimientoCaja(models.Model):
    TIPOS = [
        ('INGRESO', 'INGRESO'),
        ('EGRESO', 'EGRESO'),
    ]

    id_movimiento = models.AutoField(primary_key=True)
    caja = models.ForeignKey(
        'ventas_caja.Caja',
        on_delete=models.PROTECT,
        db_column='id_caja',
        related_name='movimientos'
    )
    tipo = models.CharField(max_length=10, choices=TIPOS)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.TextField(null=True, blank=True)
    fecha_hora = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'movimiento_caja'

    def __str__(self):
        return f"{self.tipo} - {self.monto}"