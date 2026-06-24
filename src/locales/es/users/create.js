export default {
  title: '¡Bienvenido a eHub{name}!',
  description: 'Completa tus datos a continuación para crear tu cuenta en nuestra plataforma',
  form: {
    name: {
      label: 'Nombre',
      placeholder: 'Ingresa tu nombre',
      validation: { 'min-length': 'Ingresa al menos {length} carácter | Ingresa al menos {length} caracteres' }
    },
    surname: {
      label: 'Apellido',
      placeholder: 'Ingresa tu apellido',
      validation: { 'min-length': 'Ingresa al menos {length} carácter | Ingresa al menos {length} caracteres' }
    },
    mail: {
      label: 'Correo electrónico',
      placeholder: 'Ingresa tu dirección de correo',
      validation: { 'min-length': 'Ingresa al menos {length} carácter | Ingresa al menos {length} caracteres' },
      send_code: 'Enviar código',
      verify:    'Verificar',
      resend:    'Reenviar',
      verified:  '¡Correo verificado con éxito!',
      code_hint: 'Revisa tu bandeja de entrada y spam. El código vence en 10 minutos.',
    },
    phone: {
      label: 'Teléfono',
      placeholder: 'Número sin código de país',
      hint: 'Código seleccionado: {code}',
      validation: { 'min-length': 'Ingresa al menos {length} dígitos' }
    },
    username: {
      label: 'Nombre de usuario',
      placeholder: 'Elige un nombre de usuario para tu perfil en eHub',
      validation: { 'min-length': 'Ingresa al menos {length} carácter | Ingresa al menos {length} caracteres' }
    },
    password: {
      label: 'Contraseña',
      placeholder: 'Elige una contraseña para acceder a eHub',
      validation: { 'min-length': 'Ingresa al menos {length} carácter | Ingresa al menos {length} caracteres' }
    },
    'password-confirm': {
      label: 'Confirmar contraseña',
      placeholder: 'Repite tu contraseña',
      validation: { 'min-length': 'Ingresa al menos {length} carácter | Ingresa al menos {length} caracteres' }
    },
    image: {
      button:    'Haz clic para subir una foto de perfil',
      upload:    'Subir foto',
      drop:      'Suelta aquí',
      tip:       'Usa una imagen cuadrada (1:1) con al menos 400px.',
      tip_short: 'Consejo de foto',
    },
    submit: '¡Crear mi cuenta en eHub!'
  },
  steps: {
    identity:    'Identidad',
    contact:     'Contacto',
    credentials: 'Acceso',
    next:        'Siguiente',
    back:        'Volver',
  },
  tips: {
    step1: 'Foto opcional — usa imagen cuadrada (mín. 400×400px). Nombre y apellido se usan para identificarte en los eventos.',
    step2: 'Usa un correo válido para notificaciones. El nombre de usuario será público en tu perfil y no podrá cambiarse después.',
    step3: 'Usa una contraseña con al menos 8 caracteres. Confírmala exactamente igual para evitar errores.',
  },
  has_account: '¿Ya tienes una cuenta?',
  login_link:  'Iniciar sesión',
  loading: {
    creating: { title: 'Creando tu cuenta en eHub...' },
    created:  { title: '¡Cuenta creada! Redirigiendo...' },
    error:    { title: '¡Vaya, algo salió mal!' }
  }
}
