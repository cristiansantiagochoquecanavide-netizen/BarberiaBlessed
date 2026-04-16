from django.db import models

# Create your models here.



class Servicio(models.Model):
    id_servicio = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    precio_base = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.ForeignKey(
        'configuracion_catalagos.Categoria',
        on_delete=models.PROTECT,
        db_column='id_categoria',
        related_name='servicios'
    )

    class Meta:
        db_table = 'servicio'

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    id_producto = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2)
    stock_actual = models.IntegerField(default=0)
    es_insumo = models.BooleanField(default=False)
    categoria = models.ForeignKey(
        'configuracion_catalagos.Categoria',
        on_delete=models.PROTECT,
        db_column='id_categoria',
        related_name='productos'
    )

    class Meta:
        db_table = 'producto'

    def __str__(self):
        return self.nombre


class Promocion(models.Model):
    id_promo = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    valor_descuento = models.DecimalField(max_digits=10, decimal_places=2)
    es_porcentaje = models.BooleanField(default=True)
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)

    es_lunes = models.BooleanField(default=False)
    es_martes = models.BooleanField(default=False)
    es_miercoles = models.BooleanField(default=False)
    es_jueves = models.BooleanField(default=False)
    es_viernes = models.BooleanField(default=False)
    es_sabado = models.BooleanField(default=False)
    es_domingo = models.BooleanField(default=False)

    class Meta:
        db_table = 'promocion'

    def __str__(self):
        return self.nombre


class PromoServicio(models.Model):
    promo = models.ForeignKey(
        'servicios_productos_promociones.Promocion',
        on_delete=models.PROTECT,
        db_column='id_promo',
        related_name='promo_servicios'
    )
    servicio = models.ForeignKey(
        'servicios_productos_promociones.Servicio',
        on_delete=models.PROTECT,
        db_column='id_servicio',
        related_name='servicio_promos'
    )

    class Meta:
        db_table = 'promo_servicio'
        constraints = [
            models.UniqueConstraint(fields=['promo', 'servicio'], name='uq_promo_servicio')
        ]

    def __str__(self):
        return f"{self.promo} - {self.servicio}"


class PromoProducto(models.Model):
    promo = models.ForeignKey(
        'servicios_productos_promociones.Promocion',
        on_delete=models.PROTECT,
        db_column='id_promo',
        related_name='promo_productos'
    )
    producto = models.ForeignKey(
        'servicios_productos_promociones.Producto',
        on_delete=models.PROTECT,
        db_column='id_producto',
        related_name='producto_promos'
    )

    class Meta:
        db_table = 'promo_producto'
        constraints = [
            models.UniqueConstraint(fields=['promo', 'producto'], name='uq_promo_producto')
        ]

    def __str__(self):
        return f"{self.promo} - {self.producto}"