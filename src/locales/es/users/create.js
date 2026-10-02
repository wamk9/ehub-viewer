export default {
  legal: 'Al crear la cuenta aceptas los {terms} y la {privacy}.',
  legal_terms: 'Términos de uso',
  legal_privacy: 'Política de privacidad',
  verify: { send: 'Enviar código', verified: 'Verificado', send_error: 'No pudimos enviar el código. Revisa el e-mail e inténtalo de nuevo.', too_many: 'Espera {seconds}s para pedir otro código — el anterior sigue valiendo.', wrong: 'Código incorrecto. Revisa los 6 números del e-mail.', expired: 'El código expiró. Haz clic en "Reenviar".', blocked: 'Demasiados intentos incorrectos. Haz clic en "Reenviar" para recibir otro código.', verify_error: 'No pudimos verificar ahora. Inténtalo de nuevo.' },
  phone_optional: 'Teléfono (opcional)',
  coming_back: 'Gratis. Al terminar, vuelves directo a donde estabas.',
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
      validation: { mismatch: 'Las contraseñas no coinciden. Escribe la misma contraseña en ambos campos.', 'min-length': 'Ingresa al menos {length} carácter | Ingresa al menos {length} caracteres' }
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
    step2: 'Usa un e-mail que revises: el código llega ahí. El nombre de usuario forma parte de la dirección de tu perfil (solo letras, números, "_" y "-").',
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
