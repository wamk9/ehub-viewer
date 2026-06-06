export default {
  title: '¡Genial! Gracias por elegirnos para gestionar {org_name}!',
  title_default: 'Nueva Organización',
  subtitle: '¡Después de crear tu organización en nuestra plataforma, podrás crear eventos!',
  url_placeholder: 'identificador',
  form: {
    org_name: 'Nombre de tu organización (máximo 64 caracteres)',
    org_identifier: 'Un identificador único para tu organización (como un nombre de usuario)',
    org_description: 'Una breve descripción de tu organización (máximo 180 caracteres)',
    org_submit: 'Enviar datos para crear tu organización en eHub'
  },
  tips: {
    image: 'Consejo: El logo de la organización es opcional, pero recomendamos una imagen cuadrada (proporción 1:1) con una resolución de 500px o más'
  },
  loading: {
    creating: 'Creando tu organización...',
    created: '"{name}" creada! Redirigiendo...',
    error: 'Error al crear la organización.'
  },
  validation: {
    route_min: 'El identificador debe tener al menos 3 caracteres',
    route_available: '¡Identificador disponible!'
  }
}
