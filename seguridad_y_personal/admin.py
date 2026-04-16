from django.contrib import admin
from .models import Persona, Usuario, Rol, UsuarioRol, Bitacora


@admin.register(Persona)
class PersonaAdmin(admin.ModelAdmin):
    list_display = ('id_persona', 'nombres', 'apellidos', 'correo', 'es_barbero', 'es_cliente')
    list_filter = ('es_barbero', 'es_cliente', 'estado_barbero')
    search_fields = ('nombres', 'apellidos', 'correo', 'ci')
    list_per_page = 20


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('id_usuario', 'username', 'persona', 'estado')
    list_filter = ('estado', 'persona__nombres')
    search_fields = ('username', 'persona__nombres', 'persona__apellidos')
    readonly_fields = ('id_usuario',)
    fieldsets = (
        ('Información de Autenticación', {
            'fields': ('id_usuario', 'persona', 'username', 'password', 'estado')
        }),
    )
    list_per_page = 20


@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ('id_rol', 'nombre', 'usuarios_asignados')
    search_fields = ('nombre',)
    readonly_fields = ('id_rol',)
    
    def usuarios_asignados(self, obj):
        return obj.rol_usuarios.count()
    usuarios_asignados.short_description = 'Usuarios asignados'


@admin.register(UsuarioRol)
class UsuarioRolAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'rol')
    list_filter = ('rol',)
    search_fields = ('usuario__username', 'rol__nombre')
    fieldsets = (
        ('Asignación de Rol', {
            'fields': ('usuario', 'rol')
        }),
    )


@admin.register(Bitacora)
class BitacoraAdmin(admin.ModelAdmin):
    list_display = ('id_bitacora', 'usuario', 'tabla_afectada', 'accion', 'fecha_hora')
    list_filter = ('accion', 'tabla_afectada', 'fecha_hora', 'usuario')
    search_fields = ('usuario__username', 'descripcion', 'accion')
    readonly_fields = ('id_bitacora', 'fecha_hora', 'usuario', 'tabla_afectada', 'accion', 'descripcion')
    ordering = ('-fecha_hora',)
    date_hierarchy = 'fecha_hora'
    
    def has_add_permission(self, request):
        # La bitácora se crea automáticamente, no se puede agregar manualmente
        return False
    
    def has_delete_permission(self, request, obj=None):
        # La bitácora es de solo lectura
        return False
    
    def has_change_permission(self, request, obj=None):
        # La bitácora es de solo lectura
        return False
