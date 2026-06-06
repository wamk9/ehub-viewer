export default {
  title: 'Mi Perfil',
  tabs: {
    personal: 'Datos Personales',
    password: 'Contraseña',
    account:  'Cuenta',
  },
  personal: {
    title:   'Información Personal',
    tip:     'Tu foto y nombre serán visibles en los eventos y en tu perfil público.',
    success: '¡Perfil actualizado con éxito!',
    submit:  'Guardar Cambios',
    form: {
      name:     { label: 'Nombre' },
      surname:  { label: 'Apellido' },
      phone:    { label: 'Teléfono' },
      username: { label: 'Nombre de usuario' },
      image:    { upload: 'Cambiar foto', drop: 'Suelta aquí' },
    },
  },
  password: {
    title:   'Cambiar Contraseña',
    tip:     'Al guardar, todos los demás dispositivos serán desconectados.',
    success: '¡Contraseña cambiada con éxito!',
    submit:  'Cambiar Contraseña',
    form: {
      current:  { label: 'Contraseña actual',          placeholder: 'Ingresa tu contraseña actual' },
      new:      { label: 'Nueva contraseña',            placeholder: 'Mínimo 8 caracteres' },
      confirm:  { label: 'Confirmar nueva contraseña',  placeholder: 'Repite la nueva contraseña' },
    },
    error: {
      mismatch: 'Las contraseñas no coinciden.',
      wrong:    'Contraseña actual incorrecta.',
    },
  },
  account: {
    title:    'Información de la Cuenta',
    mail:     'Correo electrónico',
    since:    'Miembro desde',
    verified: 'Correo verificado',
    danger: {
      title:       'Zona de Peligro',
      description: 'La eliminación de la cuenta es permanente e irreversible. Todos tus datos serán eliminados.',
      placeholder: 'Ingresa tu contraseña para confirmar',
      submit:      'Eliminar mi cuenta',
      confirm:     '¿Estás seguro? Esta acción no se puede deshacer.',
    },
  },
  loading: {
    fetch:    'Cargando perfil...',
    saving:   'Guardando...',
    deleting: 'Eliminando cuenta...',
  },
  error: {
    generic: 'Algo salió mal. Inténtalo de nuevo.',
    fetch:   'No se pudo cargar el perfil.',
  },
}
