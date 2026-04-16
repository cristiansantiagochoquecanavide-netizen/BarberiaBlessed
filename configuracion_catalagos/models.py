from django.db import models

# Create your models here.




class Categoria(models.Model):
    id_categoria = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)

    class Meta:
        db_table = 'categoria'

    def __str__(self):
        return self.nombre


class MetodoPago(models.Model):
    id_metodo_pago = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)

    class Meta:
        db_table = 'metodo_pago'

    def __str__(self):
        return self.nombre


class ComisionConfig(models.Model):
    id_comision = models.AutoField(primary_key=True)
    nombre_plan = models.CharField(max_length=100)
    porcentaje_barbero = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    porcentaje_club = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'comision_config'

    def __str__(self):
        return self.nombre_plan