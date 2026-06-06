export default {
  title: 'Crear evento',
  publish_error: 'Error al publicar el evento. Verifica los datos e inténtalo de nuevo.',
  breadcrumb: {
    step1: 'Categoría',
    step2: 'Información',
    step3: 'Detalles',
    step4: 'Inscripción',
  },
  step1: {
    description: 'Selecciona la categoría, subcategoría y modo de tu evento. Usaremos esta información para mostrar el formulario correcto.',
    error_required: 'Selecciona una categoría y un modo para continuar.',
    form: {
      category: {
        label: 'Categoría',
        placeholder: 'Selecciona la categoría del evento',
      },
      subcategory: {
        label: 'Subcategoría',
        placeholder: 'Sin subcategoría (opcional)',
        none: 'Sin subcategoría disponible',
      },
      runmode: {
        label: 'Modo',
        placeholder: '¿Dónde se realizará el evento?',
      },
    },
    next: 'Continuar',
  },
  step2: {
    help: 'Esta información se mostrará públicamente en la página del evento y en los listados de la plataforma.',
    sections: {
      identity:      'Identificación',
      description:   'Descripción completa',
      registrations: 'Inscripciones',
      images:        'Imágenes',
    },
    form: {
      name: {
        label: 'Nombre del evento',
        error: 'El nombre debe tener al menos 5 caracteres.',
      },
      route: {
        label: 'URL del evento',
        help:  'Usa solo letras minúsculas, números y guiones. Ej: mi-campeonato-2026',
        error: 'URL inválida. Usa 3–60 caracteres: minúsculas, números y guiones.',
      },
      short_description: {
        label: 'Descripción corta',
        help:  'Resumen de hasta 180 caracteres que aparece en las tarjetas y listados.',
      },
      description: {
        label:       'Descripción completa',
        placeholder: 'Explica cómo funciona el evento, reglas, premios...',
      },
      currency: {
        label: 'Tipo de inscripción',
        options: {
          free: 'Gratuito',
          brl:  'De pago — BRL (R$)',
          usd:  'De pago — USD (US$)',
          eur:  'De pago — EUR (€)',
        },
      },
      fee: {
        label: 'Precio de inscripción',
        error: 'Ingresa un valor válido (cero o mayor).',
      },
      max_registrations: {
        label: 'Máximo de inscritos',
        help:  'Deja en blanco para inscripciones ilimitadas.',
      },
      start_at: {
        label: 'Fecha de inicio estimada',
        help:  'Fecha aproximada de inicio. Cuando se cree la primera etapa, la fecha real será definida por esa etapa.',
      },
      logo: {
        label: 'Logo del evento',
        help:  'Imagen cuadrada (1:1). Se muestra en tarjetas y en el perfil del evento. Se guardará como logo.webp.',
      },
      cover: {
        label: 'Imagen de portada',
        help:  'Proporción 16:9. Se muestra como banner en la página del evento. Se guardará como preview.webp.',
      },
    },
    back: 'Volver',
    next: 'Continuar',
  },
  step3: {
    description: 'Completa los detalles específicos de la categoría y modo seleccionados. Estos datos se guardarán junto al evento.',
    advice:     'Formulario de categoría actualizado el {date}.',
    no_schema:  'No hay formulario específico registrado para esta categoría y modo.',
    load_error: 'No se pudo cargar el formulario de categoría. Inténtalo de nuevo.',
    back: 'Volver',
    next: 'Continuar',
  },
  step4: {
    description: 'Define los campos que los participantes deberán completar al inscribirse. Este paso es opcional — omítelo si no necesitas información adicional.',
    empty:       'Aún no hay campos. Haz clic en "Agregar campo" para crear el formulario de inscripción.',
    add_field:   'Agregar campo',
    edit_field:  'Editar campo',
    save_field:  'Guardar campo',
    cancel:      'Cancelar',
    back:        'Volver',
    publish:     'Publicar evento',
    field: {
      type:           'Tipo de campo',
      label:          'Etiqueta del campo',
      required:       'Campo obligatorio',
      values:         'Opciones (separadas por coma)',
      label_required: 'Ingresa el nombre del campo.',
    },
    types: {
      text:     'Texto libre',
      number:   'Número',
      select:   'Selección (lista)',
      switch:   'Activar / Desactivar',
      checkbox: 'Casilla de verificación',
    },
  },
}
