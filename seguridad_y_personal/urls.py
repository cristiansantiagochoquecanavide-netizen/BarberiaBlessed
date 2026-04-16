from django.urls import path
from . import views

urlpatterns = [
    # Vistas auxiliares
    path('', views.home, name='home'),
    path('index/', views.index, name='index'),
    
    # CU1. Iniciar sesión
    path('login/', views.iniciar_sesion, name='iniciar_sesion'),
    
    # CU2. Cerrar sesión
    path('logout/', views.cerrar_sesion, name='cerrar_sesion'),
    
    # CU3. Gestionar usuarios
    path('usuarios/', views.listar_usuarios, name='listar_usuarios'),
    path('usuarios/crear/', views.crear_usuario, name='crear_usuario'),
    path('usuarios/<int:usuario_id>/', views.detalle_usuario, name='detalle_usuario'),
    
    # CU4. Gestionar roles
    path('roles/', views.listar_roles, name='listar_roles'),
    path('roles/crear/', views.crear_rol, name='crear_rol'),
    path('roles/<int:rol_id>/', views.detalle_rol, name='detalle_rol'),
    
    # CU5. Gestionar barberos
    path('barberos/', views.listar_barberos, name='listar_barberos'),
    path('barberos/crear/', views.crear_barbero, name='crear_barbero'),
    path('barberos/<int:barbero_id>/', views.detalle_barbero, name='detalle_barbero'),
    
    # CU6. Consultar bitácora
    path('bitacora/', views.consultar_bitacora, name='consultar_bitacora'),
    
    # CU7. Cambiar contraseña
    path('cambiar-contrasena/', views.cambiar_contrasena, name='cambiar_contrasena'),
]
