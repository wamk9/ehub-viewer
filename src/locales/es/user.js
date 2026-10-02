export default {
  name: {
    required: 'El nombre es obligatorio.',
  },
  surname: {
    required: 'El apellido es obligatorio.',
  },
  mail: {
    required: 'El correo es obligatorio.',
    email:    'Ingresa un correo válido.',
    unique:   'Este correo ya está en uso.',
  },
  phone: {
    invalid:  'Teléfono inválido. Usa solo números con el código de área.',
    required: 'El teléfono es obligatorio.',
    unique:   'Este teléfono ya está en uso.',
  },
  username: {
    invalid:  'Usa de 5 a 60 caracteres: letras, números, "_" o "-" (sin espacios ni acentos).',
    required: 'El nombre de usuario es obligatorio.',
    unique:   'Este nombre de usuario ya está en uso.',
  },
  password: {
    required: 'La contraseña es obligatoria.',
    min: 'La contraseña debe tener al menos 8 caracteres.',
  },
}
