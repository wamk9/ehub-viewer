export default {
  title: 'Gestión de eventos',
  description: '¡Gestiona los eventos de tu organización!',
  message: 'Elige una opción para ver y gestionar la información de {eventName}.',
  general: {
    title: 'Información general',
    description: 'Aquí puedes ver toda la información de tu evento.'
  },
  stages: {
    title: 'Etapas del evento',
    description: '¡Trabaja con puntos, brackets o ambos. Las etapas no se pueden modificar una vez iniciado el evento!'
  },
  notifications: {
    title: 'Notificaciones del evento',
    description: 'Ve toda la actividad relacionada con tu evento.'
  },
  news: {
    title: 'Noticias del evento',
    description: 'Publica información y actualizaciones para los inscritos al evento.',
    manage: {
      title: 'Noticias del evento',
      back: 'Volver',
      back_to_articles: 'Volver a artículos',
      new_article: 'Nuevo artículo',
      edit_article: 'Editar artículo',
      article_plural: 'artículos',
      article_singular: 'artículo',
      empty: 'Aún no hay artículos publicados.',
      create_first: 'Crear primer artículo',
      no_permission: 'No tienes permiso para publicar artículos.',
      published: 'Publicado',
      draft: 'Borrador',
      by: 'Por',
      cover_label: 'Imagen de portada',
      cover_hint: 'Haz clic para seleccionar una imagen',
      title_placeholder: 'Título del artículo',
      excerpt_placeholder: 'Resumen corto (opcional)',
      excerpt_chars: 'caracteres',
      title_required: 'El título es obligatorio.',
      save_draft: 'Guardar borrador',
      publish: 'Publicar',
      cancel: 'Cancelar',
      save_error: 'Error al guardar. Inténtalo de nuevo.',
      delete: {
        title: 'Eliminar artículo',
        confirm: 'será eliminado permanentemente.',
        cancel: 'Cancelar',
        btn: 'Eliminar',
      },
    },
  },
  participants: {
    title: 'Participantes del evento',
    description: 'Aquí verás toda la información sobre los participantes confirmados de tu evento.'
  },
  remove: {
    title: 'Eliminar evento',
    description: '¿Quieres eliminarlo? ¡Sin problema! Pero recuerda: una vez eliminado, los datos del evento no se pueden recuperar.'
  },
  create: {
    title: 'Crea tu evento',
    description: 'Configura el modo y categoría de tu evento — organizaremos la información requerida para ti.',
    stage1: {
      title: '¡Genial! Elegiste {type} en {runMode}!',
      description: 'Ahora completa el formulario basado en esta información...',
      updated_form_advice: 'eHub actualiza regularmente los formularios de categoría según las sugerencias de los usuarios. Este formulario fue actualizado por última vez el {date}.'
    }
  }
}
