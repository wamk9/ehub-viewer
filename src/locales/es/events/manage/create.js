export default {
  step0: {
    title: 'Crea tu evento',
    description: 'Selecciona el modo y categoría de tu evento, y organizaremos la información necesaria para que la completes.',
    form: {
      runmode: {
        placeholder: '¿Dónde se realizará tu evento?',
        validation: { 'min-length': 'Selecciona el modo de tu evento para continuar' }
      },
      category: {
        placeholder: '¿Cuál es la categoría del evento?',
        validation: { 'min-length': 'Selecciona una categoría para continuar' }
      }
    },
    suggestion: {
      title: '¿No encontraste la categoría que necesitas?',
      description: 'Sabemos que nuestra lista puede crecer, así que hemos creado un espacio para que sugieras nuevas categorías para agregar a eHub.',
      call_action: '¡Sugerir ahora!'
    },
    nextstep: 'Obtener información'
  },
  step1: {
    title: "¡Elegiste '{type}' en '{runMode}'!",
    description: 'Ahora completa información básica sobre tu evento antes de pasar a los detalles específicos de la categoría.',
    form: {
      'event-name': {
        label: 'Nombre',
        placeholder: 'Nombre del evento',
        validation: { regex: 'Se requieren al menos {minLength} caracteres' }
      },
      'event-endpoint': {
        label: 'Identificador',
        placeholder: 'Identificador del evento (usado en la URL)',
        validation: {
          regex: 'Se requieren al menos {minLength} caracteres',
          in_use: 'Identificador ya en uso por esta organización, prueba con otro'
        }
      },
      'event-short-description': {
        label: 'Descripción corta',
        placeholder: 'Breve descripción del evento (máx. {maxQtd} caracteres — editable después)'
      },
      'event-description': {
        label: 'Descripción',
        placeholder: 'Describe cómo funcionará tu evento (máx. {maxQtd} caracteres — editable después)'
      },
      'event-currency': {
        label: 'Moneda',
        placeholder: '¿Qué moneda usará tu evento?',
        values: { free: 'Evento gratuito', brl: 'BRL (R$)', usd: 'USD (US$)' }
      },
      'event-register-fee': {
        label: 'Tarifa de registro',
        placeholder: 'Ingresa el monto que eHub cobrará por el registro'
      }
    },
    nextstep: 'Obtener información específica de categoría'
  },
  step2: {
    title: '¡Casi listo! Ahora hablemos del evento...',
    description: 'Completa los detalles específicos del evento. ¡Después de este paso, lo publicaremos en nuestra plataforma!',
    previouspage: 'Página anterior',
    nextpage: 'Página siguiente',
    publish: 'Publicar',
    updated_form_advice: 'eHub actualiza regularmente los formularios de categoría según las sugerencias de los usuarios. Este formulario fue actualizado por última vez el {date}.'
  }
}
