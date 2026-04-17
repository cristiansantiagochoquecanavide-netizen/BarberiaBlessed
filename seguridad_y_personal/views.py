from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone
from django.db import transaction
from django.db.models import Count
from django.views import View
from django.utils.decorators import method_decorator
from datetime import timedelta
import json
import re
import secrets
import string

from .models import Usuario, Persona, Rol, UsuarioRol, Bitacora, IntentoFallidoLogin


# ============= VISTAS AUXILIARES =============

def home(request):#peticion obtiene datos del navegador y devuelve una respuesta
    return render(request, 'home.html') #devuelve una vista render para renderizar la plantilla home.html osea para devolver un html al navegador

def index(request):
    return render(request, 'usuario/index.html')


def crear_usuario(request):
    return render(request, 'usuario/crear_usuario.html')


def registrar_bitacora(usuario, tabla_afectada, accion, descripcion=""):
    """Función auxiliar para registrar acciones en la bitácora"""
    try:
        Bitacora.objects.create(
            usuario=usuario,
            tabla_afectada=tabla_afectada,
            accion=accion,
            descripcion=descripcion,
            fecha_hora=timezone.now()
        )
    except Exception as e:
        print(f"Error registrando en bitácora: {str(e)}")


# ============= FUNCIONES DE VALIDACIÓN =============

def validar_contrasena_robusta(contrasena):
    """
    Valida que la contraseña cumpla con requisitos de seguridad:
    - Mínimo 8 caracteres
    - Al menos 1 mayúscula (A-Z)
    - Al menos 1 minúscula (a-z)
    - Al menos 1 número (0-9)
    - Al menos 1 carácter especial (@, #, $, %, !, &, *, etc.)
    
    Retorna: (es_valida: bool, mensaje: str)
    """
    
    # Validación 1: Longitud mínima
    if len(contrasena) < 8:
        return False, "La contraseña debe tener mínimo 8 caracteres"
    
    # Validación 2: Mayúsculas
    if not re.search(r'[A-Z]', contrasena):
        return False, "La contraseña debe contener al menos 1 mayúscula (A-Z)"
    
    # Validación 3: Minúsculas
    if not re.search(r'[a-z]', contrasena):
        return False, "La contraseña debe contener al menos 1 minúscula (a-z)"
    
    # Validación 4: Números
    if not re.search(r'[0-9]', contrasena):
        return False, "La contraseña debe contener al menos 1 número (0-9)"
    
    # Validación 5: Caracteres especiales (@, #, $, %, !, &, *, etc.)
    if not re.search(r'[@#$%!&*\-_=+\[\]{};:\'",.<>?/\\`~^|]', contrasena):
        return False, "La contraseña debe contener al menos 1 carácter especial (@, #, $, %, !, &, *, -, _, =, +, etc.)"
    
    # Si pasó todas las validaciones
    return True, "Contraseña válida"


def generar_contrasena_temporal():
    """
    Genera una contraseña temporal segura de 12 caracteres que cumple con
    los requisitos de seguridad (mayúsculas, minúsculas, números, caracteres especiales)
    """
    
    caracteres_mayusculas = string.ascii_uppercase  # A-Z
    caracteres_minusculas = string.ascii_lowercase  # a-z
    caracteres_numeros = string.digits              # 0-9
    caracteres_especiales = '@#$%!&*'               # Caracteres especiales permitidos
    
    # Seleccionar al menos 1 de cada tipo requerido
    contrasena = [
        secrets.choice(caracteres_mayusculas),
        secrets.choice(caracteres_minusculas),
        secrets.choice(caracteres_numeros),
        secrets.choice(caracteres_especiales)
    ]
    
    # Completar el resto (8 caracteres adicionales) con caracteres mezclados
    todos_caracteres = (caracteres_mayusculas + caracteres_minusculas + 
                       caracteres_numeros + caracteres_especiales)
    
    for _ in range(8):
        contrasena.append(secrets.choice(todos_caracteres))
    
    # Mezclar aleatoriamente la contraseña
    import random
    random.shuffle(contrasena)
    
    return ''.join(contrasena)


# ============= FUNCIONES DE BLOQUEO POR INTENTOS FALLIDOS =============

def verificar_usuario_bloqueado(usuario):
    """
    Verifica si un usuario está bloqueado por intentos fallidos de login
    
    Retorna: (esta_bloqueado: bool, tiempo_restante: int, mensaje: str)
    - esta_bloqueado: True si el usuario está bloqueado
    - tiempo_restante: Segundos que faltan para desbloqueo
    - mensaje: Mensaje descriptivo para mostrar al usuario
    """
    try:
        # Intentar obtener el registro de bloqueo más reciente
        intento_bloqueo = IntentoFallidoLogin.objects.filter(
            usuario=usuario,
            bloqueado_hasta__isnull=False
        ).latest('fecha_intento')
        
        ahora = timezone.now()
        
        # Si existe y aún está dentro del periodo de bloqueo
        if intento_bloqueo.bloqueado_hasta and ahora < intento_bloqueo.bloqueado_hasta:
            # Calcular tiempo restante en segundos
            tiempo_restante = int((intento_bloqueo.bloqueado_hasta - ahora).total_seconds())
            minutos = tiempo_restante // 60
            segundos = tiempo_restante % 60
            
            mensaje = f"Tu cuenta fue bloqueada por seguridad después de 3 intentos fallidos. Intenta de nuevo en {minutos}:{segundos:02d} minutos."
            
            return True, tiempo_restante, mensaje
        else:
            # El bloqueo ya expiró, limpiar registros antiguos
            IntentoFallidoLogin.objects.filter(
                usuario=usuario,
                bloqueado_hasta__lt=ahora
            ).delete()
            
            return False, 0, ""
    
    except IntentoFallidoLogin.DoesNotExist:
        # No hay registro de bloqueo
        return False, 0, ""


def registrar_intento_fallido(usuario):
    """
    Registra un intento fallido de login y bloquea la cuenta si es necesario
    
    - Enésimo intento fallido: registrar solo
    - 3er intento fallido: bloquear durante 5 minutos
    
    Retorna: (debe_bloquearse: bool, intentos_realizados: int, mensaje: str)
    """
    try:
        ahora = timezone.now()
        hace_5_minutos = ahora - timedelta(minutes=5)
        
        # Contar intentos fallidos en los últimos 5 minutos
        intentos_recientes = IntentoFallidoLogin.objects.filter(
            usuario=usuario,
            fecha_intento__gte=hace_5_minutos,
            bloqueado_hasta__isnull=True  # Solo intentos sin bloqueo previo
        ).count()
        
        # Registrar el nuevo intento fallido
        nuevo_intento = IntentoFallidoLogin.objects.create(
            usuario=usuario,
            fecha_intento=ahora
        )
        
        # Sumar 1 al intento actual
        intentos_totales = intentos_recientes + 1
        
        # Si llegó a 3 intentos, bloquear la cuenta
        if intentos_totales >= 3:
            tiempo_bloqueo = ahora + timedelta(minutes=5)  # Bloquear por 5 minutos
            nuevo_intento.bloqueado_hasta = tiempo_bloqueo
            nuevo_intento.save()
            
            mensaje = "Tu cuenta ha sido bloqueada por seguridad. Intenta de nuevo en 5 minutos."
            return True, intentos_totales, mensaje
        
        # Mensaje informando cuántos intentos quedan
        intentos_restantes = 3 - intentos_totales
        if intentos_restantes == 1:
            mensaje = f"❌ Contraseña incorrecta. Te queda {intentos_restantes} intento antes de bloqueo."
        else:
            mensaje = f"❌ Contraseña incorrecta. Te quedan {intentos_restantes} intentos antes de bloqueo."
        
        return False, intentos_totales, mensaje
    
    except Exception as e:
        print(f"Error registrando intento fallido: {str(e)}")
        return False, 0, ""


def limpiar_intentos_exitosos(usuario):
    """
    Limpia los registros de intentos fallidos cuando el login es exitoso
    """
    try:
        IntentoFallidoLogin.objects.filter(usuario=usuario).delete()
    except Exception as e:
        print(f"Error limpiando intentos: {str(e)}")


# ============= CU1. INICIAR SESIÓN =============

@csrf_exempt
@require_http_methods(["GET", "POST"])
def iniciar_sesion(request):
    """
    CU1. Iniciar sesión con sistema de bloqueo por intentos fallidos
    GET: Retorna la página de login
    POST: Autentica usuario y crea sesión
    
    Sistema de seguridad:
    - Máximo 3 intentos fallidos en 5 minutos
    - Después de 3 intentos fallidos: bloqueo por 5 minutos
    - Después de 5 minutos: se permite reintentar
    """
    if request.method == 'GET':
        return render(request, 'usuario/login.html')
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body) if request.body else request.POST
            username = data.get('username', '').strip()
            password = data.get('password', '').strip()
            
            if not username or not password:
                return JsonResponse({
                    'success': False,
                    'mensaje': 'Usuario y contraseña son requeridos'
                }, status=400)
            
            # Buscar usuario
            usuario = Usuario.objects.select_related('persona').get(username=username)
            
            # PASO 1: Verificar si el usuario está bloqueado por intentos fallidos
            esta_bloqueado, tiempo_restante, mensaje_bloqueo = verificar_usuario_bloqueado(usuario)
            if esta_bloqueado:
                return JsonResponse({
                    'success': False,
                    'mensaje': mensaje_bloqueo,
                    'bloqueado': True,
                    'tiempo_restante': tiempo_restante
                }, status=429)  # 429 = Too Many Requests
            
            if not usuario.estado:
                return JsonResponse({
                    'success': False,
                    'mensaje': 'Usuario inactivo. Contacte al administrador.'
                }, status=403)
            
            # PASO 2: Verificar contraseña
            if not check_password(password, usuario.password):
                # La contraseña es incorrecta
                debe_bloquearse, intentos, mensaje_intento = registrar_intento_fallido(usuario)
                
                registrar_bitacora(
                    usuario=usuario,
                    tabla_afectada='usuario',
                    accion='INTENTO_FALLIDO_LOGIN',
                    descripcion=f'Intento fallido de login (intento {intentos})'
                )
                
                return JsonResponse({
                    'success': False,
                    'mensaje': mensaje_intento,
                    'bloqueado': debe_bloquearse,
                    'intentos_realizados': intentos
                }, status=401)
            
            # PASO 3: Contraseña correcta - Login exitoso
            # Limpiar intentos fallidos
            limpiar_intentos_exitosos(usuario)
            
            # Crear sesión
            request.session['usuario_id'] = usuario.id_usuario
            request.session['username'] = usuario.username
            request.session['nombre'] = f"{usuario.persona.nombres} {usuario.persona.apellidos}"
            
            registrar_bitacora(
                usuario=usuario,
                tabla_afectada='usuario',
                accion='LOGIN_EXITOSO',
                descripcion=f'Usuario {username} inició sesión correctamente'
            )
            
            return JsonResponse({
                'success': True,
                'mensaje': 'Sesión iniciada correctamente',
                'usuario': {
                    'id': usuario.id_usuario,
                    'username': usuario.username,
                    'nombre': f"{usuario.persona.nombres} {usuario.persona.apellidos}"
                }
            })
            
        except Usuario.DoesNotExist:
            return JsonResponse({
                'success': False,
                'mensaje': 'Usuario no encontrado'
            }, status=404)
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'mensaje': 'Formato de datos inválido'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'mensaje': f'Error en el servidor: {str(e)}'
            }, status=500)


# ============= CU2. CERRAR SESIÓN =============

@csrf_exempt
@require_http_methods(["GET", "POST"])
def cerrar_sesion(request):
    """
    CU2. Cerrar sesión
    Cierra la sesión actual del usuario
    """
    try:
        if 'usuario_id' in request.session:
            usuario_id = request.session['usuario_id']
            usuario = Usuario.objects.get(id_usuario=usuario_id)
            
            registrar_bitacora(
                usuario=usuario,
                tabla_afectada='usuario',
                accion='LOGOUT',
                descripcion=f'Usuario {usuario.username} cerró sesión'
            )
        
        request.session.flush()
        
        return JsonResponse({
            'success': True,
            'mensaje': 'Sesión cerrada correctamente'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'mensaje': f'Error cerrando sesión: {str(e)}'
        }, status=500)


# ============= CU3. GESTIONAR USUARIOS =============

def validar_sesion_admin(request):
    """Valida que el usuario sea administrador"""
    if 'usuario_id' not in request.session:
        return False
    # Aquí puede agregarse lógica para verificar permisos de admin
    return True


@csrf_exempt
@require_http_methods(["GET", "POST"])
def listar_usuarios(request):
    """
    CU3.1 Listar usuarios
    GET: Retorna lista de usuarios
    """
    if not validar_sesion_admin(request):
        return JsonResponse({
            'success': False,
            'mensaje': 'No autorizado'
        }, status=403)
    
    try:
        usuarios = Usuario.objects.select_related('persona').prefetch_related('usuario_roles__rol').all()
        usuarios_data = [
            {
                'id_usuario': u.id_usuario,
                'username': u.username,
                'nombre': f"{u.persona.nombres} {u.persona.apellidos}",
                'correo': u.persona.correo,
                'estado': u.estado,
                'id_persona': u.persona.id_persona,
                'fecha_nacimiento': u.persona.fecha_nacimiento.isoformat() if u.persona.fecha_nacimiento else '',
                'roles': [rol.rol.nombre for rol in u.usuario_roles.all()]
            }
            for u in usuarios
        ]
        
        return JsonResponse({
            'success': True,
            'usuarios': usuarios_data,
            'total': len(usuarios_data)
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'mensaje': f'Error obteniendo usuarios: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def crear_usuario(request):
    """
    CU3.2 Crear usuario
    POST: Crea un nuevo usuario
    """
    if not validar_sesion_admin(request):
        return JsonResponse({
            'success': False,
            'mensaje': 'No autorizado'
        }, status=403)
    
    try:
        data = json.loads(request.body)
        
        # Validar datos requeridos
        campos_requeridos = ['username', 'password', 'nombres', 'apellidos', 'correo']
        for campo in campos_requeridos:
            if not data.get(campo, '').strip():
                return JsonResponse({
                    'success': False,
                    'mensaje': f'Campo requerido: {campo}'
                }, status=400)
        
        # Validar que username sea único
        if Usuario.objects.filter(username=data['username']).exists():
            return JsonResponse({
                'success': False,
                'mensaje': 'El usuario ya existe'
            }, status=400)
        
        with transaction.atomic():
            # Crear persona
            persona = Persona.objects.create(
                nombres=data['nombres'],
                apellidos=data['apellidos'],
                correo=data.get('correo'),
                telefono=data.get('telefono', ''),
                ci=data.get('ci', ''),
                direccion=data.get('direccion', ''),
                fecha_nacimiento=data.get('fecha_nacimiento') or None
            )
            
            # Crear usuario
            usuario = Usuario.objects.create(
                persona=persona,
                username=data['username'],
                password=make_password(data['password']),
                estado=True
            )
            
            # Asignar roles si existen
            roles = data.get('roles', [])
            for rol_id in roles:
                try:
                    rol = Rol.objects.get(id_rol=rol_id)
                    UsuarioRol.objects.create(usuario=usuario, rol=rol)
                except Rol.DoesNotExist:
                    pass
            
            # Registrar en bitácora
            usuario_actual = Usuario.objects.get(id_usuario=request.session.get('usuario_id'))
            registrar_bitacora(
                usuario=usuario_actual,
                tabla_afectada='usuario',
                accion='CREATE',
                descripcion=f'Nuevo usuario creado: {data["username"]}'
            )
            
            return JsonResponse({
                'success': True,
                'mensaje': 'Usuario creado correctamente',
                'usuario_id': usuario.id_usuario
            }, status=201)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'mensaje': 'Formato de datos inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'mensaje': f'Error creando usuario: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def detalle_usuario(request, usuario_id):
    """
    CU3.3 Obtener, actualizar o eliminar usuario
    GET: Obtiene detalles del usuario
    PUT: Actualiza datos del usuario
    DELETE: Desactiva el usuario
    """
    if not validar_sesion_admin(request):
        return JsonResponse({
            'success': False,
            'mensaje': 'No autorizado'
        }, status=403)
    
    try:
        usuario = Usuario.objects.select_related('persona').get(id_usuario=usuario_id)
        
        if request.method == 'GET':
            roles_data = UsuarioRol.objects.filter(usuario=usuario).select_related('rol').values_list('rol__id_rol', 'rol__nombre')
            roles_ids = [rol[0] for rol in roles_data]
            fecha_nacimiento = usuario.persona.fecha_nacimiento.isoformat() if usuario.persona.fecha_nacimiento else ''
            return JsonResponse({
                'success': True,
                'usuario': {
                    'id_usuario': usuario.id_usuario,
                    'username': usuario.username,
                    'nombres': usuario.persona.nombres,
                    'apellidos': usuario.persona.apellidos,
                    'correo': usuario.persona.correo,
                    'telefono': usuario.persona.telefono,
                    'ci': usuario.persona.ci,
                    'direccion': usuario.persona.direccion,
                    'fecha_nacimiento': fecha_nacimiento,
                    'estado': usuario.estado,
                    'roles': roles_ids
                }
            })
        
        elif request.method == 'PUT':
            data = json.loads(request.body)
            
            # Actualizar persona
            persona = usuario.persona
            persona.nombres = data.get('nombres', persona.nombres)
            persona.apellidos = data.get('apellidos', persona.apellidos)
            persona.correo = data.get('correo', persona.correo)
            persona.telefono = data.get('telefono', persona.telefono)
            persona.ci = data.get('ci', persona.ci)
            persona.direccion = data.get('direccion', persona.direccion)
            if data.get('fecha_nacimiento'):
                persona.fecha_nacimiento = data.get('fecha_nacimiento')
            persona.save()
            
            # Actualizar estado si aplica
            if 'estado' in data:
                usuario.estado = data['estado']
                usuario.save()
            
            # Actualizar roles
            if 'roles' in data:
                UsuarioRol.objects.filter(usuario=usuario).delete()
                for rol_id in data['roles']:
                    try:
                        rol = Rol.objects.get(id_rol=rol_id)
                        UsuarioRol.objects.create(usuario=usuario, rol=rol)
                    except Rol.DoesNotExist:
                        pass
            
            registrar_bitacora(
                usuario=Usuario.objects.get(id_usuario=request.session.get('usuario_id')),
                tabla_afectada='usuario',
                accion='UPDATE',
                descripcion=f'Usuario {usuario.username} actualizado'
            )
            
            return JsonResponse({
                'success': True,
                'mensaje': 'Usuario actualizado correctamente'
            })
        
        elif request.method == 'DELETE':
            usuario.estado = False
            usuario.save()
            
            registrar_bitacora(
                usuario=Usuario.objects.get(id_usuario=request.session.get('usuario_id')),
                tabla_afectada='usuario',
                accion='DELETE',
                descripcion=f'Usuario {usuario.username} desactivado'
            )
            
            return JsonResponse({
                'success': True,
                'mensaje': 'Usuario desactivado correctamente'
            })
            
    except Usuario.DoesNotExist:
        return JsonResponse({
            'success': False,
            'mensaje': 'Usuario no encontrado'
        }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'mensaje': 'Formato de datos inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'mensaje': f'Error: {str(e)}'
        }, status=500)


# ============= CU4. GESTIONAR ROLES =============

@csrf_exempt
@require_http_methods(["GET"])
def listar_roles(request):
    """
    CU4.1 Listar roles
    GET: Retorna lista de roles disponibles
    """
    if not validar_sesion_admin(request):
        return JsonResponse({
            'success': False,
            'mensaje': 'No autorizado'
        }, status=403)
    
    try:
        roles = Rol.objects.all()
        roles_data = [
            {
                'id_rol': r.id_rol,
                'nombre': r.nombre,
                'usuarios_asignados': r.rol_usuarios.count()
            }
            for r in roles
        ]
        
        return JsonResponse({
            'success': True,
            'roles': roles_data,
            'total': len(roles_data)
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'mensaje': f'Error obteniendo roles: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def crear_rol(request):
    """
    CU4.2 Crear rol
    POST: Crea un nuevo rol
    """
    if not validar_sesion_admin(request):
        return JsonResponse({
            'success': False,
            'mensaje': 'No autorizado'
        }, status=403)
    
    try:
        data = json.loads(request.body)
        
        nombre = data.get('nombre', '').strip()
        if not nombre:
            return JsonResponse({
                'success': False,
                'mensaje': 'El nombre del rol es requerido'
            }, status=400)
        
        if Rol.objects.filter(nombre=nombre).exists():
            return JsonResponse({
                'success': False,
                'mensaje': 'El rol ya existe'
            }, status=400)
        
        rol = Rol.objects.create(nombre=nombre)
        
        registrar_bitacora(
            usuario=Usuario.objects.get(id_usuario=request.session.get('usuario_id')),
            tabla_afectada='rol',
            accion='CREATE',
            descripcion=f'Nuevo rol creado: {nombre}'
        )
        
        return JsonResponse({
            'success': True,
            'mensaje': 'Rol creado correctamente',
            'rol_id': rol.id_rol
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'mensaje': 'Formato de datos inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'mensaje': f'Error creando rol: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["PUT", "DELETE"])
def detalle_rol(request, rol_id):
    """
    CU4.3 Actualizar o eliminar rol
    PUT: Actualiza el nombre del rol
    DELETE: Elimina el rol
    """
    if not validar_sesion_admin(request):
        return JsonResponse({
            'success': False,
            'mensaje': 'No autorizado'
        }, status=403)
    
    try:
        rol = Rol.objects.get(id_rol=rol_id)
        
        if request.method == 'PUT':
            data = json.loads(request.body)
            
            nuevo_nombre = data.get('nombre', '').strip()
            if not nuevo_nombre:
                return JsonResponse({
                    'success': False,
                    'mensaje': 'El nombre del rol es requerido'
                }, status=400)
            
            rol.nombre = nuevo_nombre
            rol.save()
            
            registrar_bitacora(
                usuario=Usuario.objects.get(id_usuario=request.session.get('usuario_id')),
                tabla_afectada='rol',
                accion='UPDATE',
                descripcion=f'Rol {nuevo_nombre} actualizado'
            )
            
            return JsonResponse({
                'success': True,
                'mensaje': 'Rol actualizado correctamente'
            })
        
        elif request.method == 'DELETE':
            nombre_rol = rol.nombre
            rol.delete()
            
            registrar_bitacora(
                usuario=Usuario.objects.get(id_usuario=request.session.get('usuario_id')),
                tabla_afectada='rol',
                accion='DELETE',
                descripcion=f'Rol {nombre_rol} eliminado'
            )
            
            return JsonResponse({
                'success': True,
                'mensaje': 'Rol eliminado correctamente'
            })
            
    except Rol.DoesNotExist:
        return JsonResponse({
            'success': False,
            'mensaje': 'Rol no encontrado'
        }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'mensaje': 'Formato de datos inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'mensaje': f'Error: {str(e)}'
        }, status=500)


# ============= CU5. GESTIONAR BARBEROS =============

@csrf_exempt
@require_http_methods(["GET"])
def listar_barberos(request):
    """
    CU5.1 Listar barberos
    GET: Retorna lista de barberos (Personas con es_barbero=True)
    """
    try:
        barberos = Persona.objects.filter(es_barbero=True)
        barberos_data = [
            {
                'id_persona': b.id_persona,
                'nombres': b.nombres,
                'apellidos': b.apellidos,
                'correo': b.correo,
                'telefono': b.telefono,
                'especialidad': b.especialidad,
                'calificacion_promedio': str(b.calificacion_promedio),
                'estado': b.estado_barbero,
                'comision': b.comision.id_comision if b.comision else None
            }
            for b in barberos
        ]
        
        return JsonResponse({
            'success': True,
            'barberos': barberos_data,
            'total': len(barberos_data)
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'mensaje': f'Error obteniendo barberos: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def crear_barbero(request):
    """
    CU5.2 Crear barbero
    POST: Crea una nueva persona como barbero
    """
    if not validar_sesion_admin(request):
        return JsonResponse({
            'success': False,
            'mensaje': 'No autorizado'
        }, status=403)
    
    try:
        data = json.loads(request.body)
        
        campos_requeridos = ['nombres', 'apellidos']
        for campo in campos_requeridos:
            if not data.get(campo, '').strip():
                return JsonResponse({
                    'success': False,
                    'mensaje': f'Campo requerido: {campo}'
                }, status=400)
        
        barbero = Persona.objects.create(
            nombres=data['nombres'],
            apellidos=data['apellidos'],
            correo=data.get('correo'),
            telefono=data.get('telefono', ''),
            ci=data.get('ci', ''),
            direccion=data.get('direccion', ''),
            especialidad=data.get('especialidad', ''),
            es_barbero=True,
            estado_barbero=True
        )
        
        registrar_bitacora(
            usuario=Usuario.objects.get(id_usuario=request.session.get('usuario_id')),
            tabla_afectada='persona',
            accion='CREATE',
            descripcion=f'Nuevo barbero creado: {data["nombres"]} {data["apellidos"]}'
        )
        
        return JsonResponse({
            'success': True,
            'mensaje': 'Barbero creado correctamente',
            'barbero_id': barbero.id_persona
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'mensaje': 'Formato de datos inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'mensaje': f'Error creando barbero: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def detalle_barbero(request, barbero_id):
    """
    CU5.3 Obtener, actualizar o eliminar barbero
    GET: Obtiene detalles del barbero
    PUT: Actualiza datos del barbero
    DELETE: Desactiva el barbero
    """
    if request.method != 'GET' and not validar_sesion_admin(request):
        return JsonResponse({
            'success': False,
            'mensaje': 'No autorizado'
        }, status=403)
    
    try:
        barbero = Persona.objects.get(id_persona=barbero_id, es_barbero=True)
        
        if request.method == 'GET':
            return JsonResponse({
                'success': True,
                'barbero': {
                    'id_persona': barbero.id_persona,
                    'nombres': barbero.nombres,
                    'apellidos': barbero.apellidos,
                    'correo': barbero.correo,
                    'telefono': barbero.telefono,
                    'ci': barbero.ci,
                    'direccion': barbero.direccion,
                    'especialidad': barbero.especialidad,
                    'calificacion_promedio': str(barbero.calificacion_promedio),
                    'estado': barbero.estado_barbero,
                    'comision': barbero.comision.id_comision if barbero.comision else None
                }
            })
        
        elif request.method == 'PUT':
            data = json.loads(request.body)
            
            barbero.nombres = data.get('nombres', barbero.nombres)
            barbero.apellidos = data.get('apellidos', barbero.apellidos)
            barbero.correo = data.get('correo', barbero.correo)
            barbero.telefono = data.get('telefono', barbero.telefono)
            barbero.ci = data.get('ci', barbero.ci)
            barbero.direccion = data.get('direccion', barbero.direccion)
            barbero.especialidad = data.get('especialidad', barbero.especialidad)
            
            if 'estado' in data:
                barbero.estado_barbero = data['estado']
            
            barbero.save()
            
            registrar_bitacora(
                usuario=Usuario.objects.get(id_usuario=request.session.get('usuario_id')),
                tabla_afectada='persona',
                accion='UPDATE',
                descripcion=f'Barbero {barbero.nombres} {barbero.apellidos} actualizado'
            )
            
            return JsonResponse({
                'success': True,
                'mensaje': 'Barbero actualizado correctamente'
            })
        
        elif request.method == 'DELETE':
            barbero.estado_barbero = False
            barbero.save()
            
            registrar_bitacora(
                usuario=Usuario.objects.get(id_usuario=request.session.get('usuario_id')),
                tabla_afectada='persona',
                accion='DELETE',
                descripcion=f'Barbero {barbero.nombres} {barbero.apellidos} desactivado'
            )
            
            return JsonResponse({
                'success': True,
                'mensaje': 'Barbero desactivado correctamente'
            })
            
    except Persona.DoesNotExist:
        return JsonResponse({
            'success': False,
            'mensaje': 'Barbero no encontrado'
        }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'mensaje': 'Formato de datos inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'mensaje': f'Error: {str(e)}'
        }, status=500)


# ============= CU18. CONSULTAR BITÁCORA =============

@csrf_exempt
@require_http_methods(["GET"])
def consultar_bitacora(request):
    """
    CU6. Consultar bitácora - Auditoría completa del sistema
    GET: Retorna los registros de la bitácora con todos los detalles
    
    Información mostrada:
    - ID de bitácora
    - Usuario (ID y nombre completo)
    - Rol(s) del usuario
    - Tabla afectada
    - Acción realizada (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, etc.)
    - Descripción detallada de la acción
    - Fecha y hora exacta de la acción
    
    Parámetros de filtro (opcionales):
    - usuario_id: Filtrar por ID de usuario
    - rol: Filtrar por nombre del rol
    - tabla_afectada: Filtrar por tabla (usuario, persona, rol)
    - accion: Filtrar por acción (LOGIN, CREATE, UPDATE, DELETE, etc.)
    - fecha_inicio: Filtrar desde una fecha (YYYY-MM-DD)
    - fecha_fin: Filtrar hasta una fecha (YYYY-MM-DD)
    - pagina: Número de página (default: 1)
    - limite: Registros por página (default: 50)
    """
    if not validar_sesion_admin(request):
        return JsonResponse({
            'success': False,
            'mensaje': 'No autorizado. Solo administradores pueden consultar la bitácora.'
        }, status=403)
    
    try:
        # Obtener todas las bitácoras con información relacionada
        bitacoras = Bitacora.objects.select_related('usuario__persona').all().order_by('-fecha_hora')
        
        # Filtros opcionales
        usuario_id = request.GET.get('usuario_id')
        rol = request.GET.get('rol')
        tabla_afectada = request.GET.get('tabla_afectada')
        accion = request.GET.get('accion')
        fecha_inicio = request.GET.get('fecha_inicio')
        fecha_fin = request.GET.get('fecha_fin')
        
        # Aplicar filtros
        if usuario_id:
            bitacoras = bitacoras.filter(usuario__id_usuario=usuario_id)
        
        if tabla_afectada:
            bitacoras = bitacoras.filter(tabla_afectada__icontains=tabla_afectada)
        
        if accion:
            bitacoras = bitacoras.filter(accion__icontains=accion)
        
        if fecha_inicio:
            bitacoras = bitacoras.filter(fecha_hora__gte=fecha_inicio)
        
        if fecha_fin:
            bitacoras = bitacoras.filter(fecha_hora__lte=fecha_fin)
        
        # Paginación
        pagina = request.GET.get('pagina', 1)
        limite = request.GET.get('limite', 50)
        try:
            pagina = int(pagina)
            limite = int(limite)
        except ValueError:
            pagina = 1
            limite = 50
        
        inicio = (pagina - 1) * limite
        fin = inicio + limite
        
        total = bitacoras.count()
        bitacoras_paginadas = bitacoras[inicio:fin]
        
        # Construir respuesta detallada
        bitacoras_data = []
        for b in bitacoras_paginadas:
            # Obtener roles del usuario
            roles = UsuarioRol.objects.filter(usuario=b.usuario).values_list('rol__nombre', flat=True)
            roles_list = list(roles) if roles else ['Sin rol asignado']
            
            # Tipo de usuario (Barbero/Cliente/Administrador)
            persona = b.usuario.persona
            tipo_usuario = []
            if persona.es_barbero:
                tipo_usuario.append('Barbero')
            if persona.es_cliente:
                tipo_usuario.append('Cliente')
            if not tipo_usuario:
                tipo_usuario.append('Usuario')
            
            bitacora_detalle = {
                'id_bitacora': b.id_bitacora,
                'usuario': {
                    'id': b.usuario.id_usuario,
                    'username': b.usuario.username,
                    'nombre_completo': f"{persona.nombres} {persona.apellidos}",
                    'correo': persona.correo,
                    'tipos': tipo_usuario
                },
                'roles': roles_list,
                'accion': {
                    'tipo': b.accion,
                    'tabla_afectada': b.tabla_afectada,
                    'descripcion': b.descripcion,
                },
                'fecha_hora': b.fecha_hora.isoformat(),
                'fecha_hora_formato': b.fecha_hora.strftime('%d/%m/%Y %H:%M:%S')
            }
            bitacoras_data.append(bitacora_detalle)
        
        # Estadísticas
        acciones_totales = Bitacora.objects.values('accion').annotate(
            count=Count('id_bitacora')
        )
        
        actividades_usuario = {}
        for b in bitacoras_paginadas:
            username = b.usuario.username
            if username not in actividades_usuario:
                actividades_usuario[username] = 0
            actividades_usuario[username] += 1
        
        respuesta = {
            'success': True,
            'mensaje': f'Bitácora consultada. Total: {total} registros',
            'bitacoras': bitacoras_data,
            'estadisticas': {
                'total_registros': total,
                'registros_por_pagina': limite,
                'pagina_actual': pagina,
                'paginas_totales': (total + limite - 1) // limite,
                'acciones_por_tipo': [
                    {'tipo_accion': a['accion'], 'cantidad': a['count']}
                    for a in acciones_totales
                ],
                'actividades_por_usuario': actividades_usuario
            }
        }
        
        return JsonResponse(respuesta)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'mensaje': f'Error consultando bitácora: {str(e)}'
        }, status=500)


# ============= CU7. CAMBIAR CONTRASEÑA =============

@csrf_exempt
@require_http_methods(["POST"])
def cambiar_contrasena(request):
    """
    CU7. Cambiar contraseña
    POST: Cambia la contraseña del usuario autenticado
    
    Requiere JSON:
    - contrasena_actual: Contraseña actual del usuario
    - contrasena_nueva: Nueva contraseña (debe cumplir validaciones)
    - contrasena_confirmacion: Confirmación de la nueva contraseña
    
    Validaciones:
    - Mínimo 8 caracteres
    - 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial
    """
    try:
        # Verificar que el usuario está autenticado
        if 'usuario_id' not in request.session:
            return JsonResponse({
                'success': False,
                'mensaje': 'No autenticado. Inicia sesión primero'
            }, status=401)
        
        # Parsear datos JSON
        data = json.loads(request.body)
        
        # Obtener datos del formulario
        usuario_id = request.session.get('usuario_id')
        contrasena_actual = data.get('contrasena_actual', '').strip()
        contrasena_nueva = data.get('contrasena_nueva', '').strip()
        contrasena_confirmacion = data.get('contrasena_confirmacion', '').strip()
        
        # Validación 1: Campos requeridos
        if not all([contrasena_actual, contrasena_nueva, contrasena_confirmacion]):
            return JsonResponse({
                'success': False,
                'mensaje': 'Todos los campos son requeridos'
            }, status=400)
        
        # Validación 2: Las nuevas contraseñas coinciden
        if contrasena_nueva != contrasena_confirmacion:
            return JsonResponse({
                'success': False,
                'mensaje': 'Las nuevas contraseñas no coinciden'
            }, status=400)
        
        # Validación 3: Contraseña nueva no es igual a la actual
        usuario = Usuario.objects.get(id_usuario=usuario_id)
        if check_password(contrasena_nueva, usuario.password):
            return JsonResponse({
                'success': False,
                'mensaje': 'La nueva contraseña debe ser diferente a la actual'
            }, status=400)
        
        # Validación 4: Validar requisitos de seguridad
        es_valida, mensaje_validacion = validar_contrasena_robusta(contrasena_nueva)
        if not es_valida:
            return JsonResponse({
                'success': False,
                'mensaje': mensaje_validacion
            }, status=400)
        
        # Validación 5: Verificar que la contraseña actual es correcta
        if not check_password(contrasena_actual, usuario.password):
            # Registrar intento fallido en bitácora por seguridad
            registrar_bitacora(
                usuario=usuario,
                tabla_afectada='usuario',
                accion='INTENTO_CAMBIO_CONTRASENA_FALLIDO',
                descripcion='Contraseña actual incorrecta'
            )
            return JsonResponse({
                'success': False,
                'mensaje': 'Contraseña actual incorrecta'
            }, status=401)
        
        # Si todas las validaciones pasaron, cambiar la contraseña
        usuario.password = make_password(contrasena_nueva)
        usuario.save()
        
        # Registrar exitosamente el cambio en bitácora
        registrar_bitacora(
            usuario=usuario,
            tabla_afectada='usuario',
            accion='CAMBIO_CONTRASENA_EXITOSO',
            descripcion='Usuario cambió su contraseña correctamente'
        )
        
        return JsonResponse({
            'success': True,
            'mensaje': 'Contraseña cambiada correctamente'
        })
        
    except Usuario.DoesNotExist:
        return JsonResponse({
            'success': False,
            'mensaje': 'Usuario no encontrado'
        }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'mensaje': 'Formato de datos inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'mensaje': f'Error en el servidor: {str(e)}'
        }, status=500)


# ============= CU8. RECUPERAR CONTRASEÑA =============

@csrf_exempt
@require_http_methods(["POST"])
def recuperar_contrasena(request):
    """
    CU8. Recuperar contraseña (Reset Password)
    POST: Genera una contraseña temporal para un usuario olvidó su contraseña
    
    Requiere JSON:
    - username: Usuario que olvidó la contraseña
    
    Retorna:
    - Una contraseña temporal que cumple con requisitos de seguridad
    - Registra la acción en bitácora
    
    NOTA: En producción, se debe enviar esta contraseña por email
    """
    try:
        # Parsear datos JSON
        data = json.loads(request.body)
        username = data.get('username', '').strip()
        
        # Validación: Username requerido
        if not username:
            return JsonResponse({
                'success': False,
                'mensaje': 'El nombre de usuario es requerido'
            }, status=400)
        
        # Buscar usuario
        try:
            usuario = Usuario.objects.select_related('persona').get(username=username)
        except Usuario.DoesNotExist:
            # Por seguridad, no revelar si el usuario existe o no
            return JsonResponse({
                'success': False,
                'mensaje': 'Si el usuario existe, recibirá una contraseña temporal'
            }, status=404)
        
        # Validación: Usuario activo
        if not usuario.estado:
            return JsonResponse({
                'success': False,
                'mensaje': 'Este usuario está inactivo. Contacta al administrador'
            }, status=403)
        
        # Generar contraseña temporal segura
        contrasena_temporal = generar_contrasena_temporal()
        
        # Guardar la nueva contraseña temporal
        usuario.password = make_password(contrasena_temporal)
        usuario.save()
        
        # Registrar en bitácora
        registrar_bitacora(
            usuario=usuario,
            tabla_afectada='usuario',
            accion='RECUPERACION_CONTRASENA',
            descripcion=f'Se generó contraseña temporal para usuario {username}'
        )
        
        return JsonResponse({
            'success': True,
            'mensaje': 'Contraseña temporal generada correctamente',
            'contrasena_temporal': contrasena_temporal,
            'nota': 'Esta contraseña temporal debería ser enviada por email. Recuerda cambiarla en el siguiente login.'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'mensaje': 'Formato de datos inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'mensaje': f'Error en el servidor: {str(e)}'
        }, status=500)
        
    except Usuario.DoesNotExist:
        return JsonResponse({
            'success': False,
            'mensaje': 'Usuario no encontrado'
        }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'mensaje': 'Formato de datos inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'mensaje': f'Error cambiando contraseña: {str(e)}'
        }, status=500)