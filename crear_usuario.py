import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'barberia.settings')
django.setup()

from seguridad_y_personal.models import Usuario
from django.contrib.auth.hashers import make_password

# Actualizar usuario existente
usuario = Usuario.objects.get(username='admin')
usuario.password = make_password('12345')
usuario.estado = True
usuario.save()

print(f"✅ Usuario actualizado: {usuario.username}")
print(f"Contraseña: 12345")
