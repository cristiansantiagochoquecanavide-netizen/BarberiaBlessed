"""
URL configuration for barberia project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from seguridad_y_personal import views as seguridad_views 
from clientes import views as clientes_views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', seguridad_views.home, name='home'),
    path('api/seguridad/', include('seguridad_y_personal.urls')),
    path('usuario/', seguridad_views.index, name='usuario_index'),
    path('usuario/crear/', seguridad_views.crear_usuario, name='crear_usuario_view'),
]
