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
    required: 'El teléfono es obligatorio.',
    unique:   'Este teléfono ya está en uso.',
  },
  username: {
    required: 'El nombre de usuario es obligatorio.',
    unique:   'Este nombre de usuario ya está en uso.',
  },
  password: {
    required: 'La contraseña es obligatoria.',
  },
}
