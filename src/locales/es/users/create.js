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
      validation: { 'min-length': 'Ingresa al menos {length} carácter | Ingresa al menos {length} caracteres' }
    },
    phone: {
      label: 'Teléfono',
      placeholder: 'Ingresa tu número de teléfono (con código de área)',
      validation: { 'min-length': 'Ingresa al menos {length} carácter | Ingresa al menos {length} caracteres' }
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
      button: 'Haz clic para subir una foto de perfil',
      drop: 'Suelta para subir esta foto de perfil',
      tip: 'Consejo: Usa una imagen cuadrada (proporción 1:1) con al menos 400px de ancho y alto.'
    },
    submit: '¡Crear mi cuenta en eHub!'
  },
  loading: {
    creating: { title: 'Creando tu cuenta en eHub...' },
    created: { title: '¡Cuenta creada! Redirigiendo...' },
    error: { title: '¡Vaya, algo salió mal!' }
  }
}
