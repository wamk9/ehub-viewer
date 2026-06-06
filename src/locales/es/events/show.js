export default {
  in_progress: 'En progreso',
  tabs: {
    info: 'Información',
    stages: 'Etapas',
    participants: 'Participantes',
  },
  info: {
    description: 'Descripción',
    details: 'Detalles',
    max_registrations: 'Hasta {n} participantes',
    start_at: 'Inicio',
    start_at_preview: 'Inicio estimado',
  },
  stages: {
    empty: 'Aún no hay etapas configuradas.',
    rounds: 'Rondas',
    no_results: 'No hay resultados registrados.',
    qualification: 'Clasificación',
    status: {
      pending: 'No iniciada',
      initialized: 'Inicializada',
      in_progress: 'En progreso',
      finished: 'Finalizada',
    },
    results: {
      participant: 'Participante',
      score: 'Puntuación',
      qualified: 'C',
    },
  },
  participants: {
    empty: 'Aún no hay participantes inscritos.',
    title: '{n} participantes',
  },
  registration: {
    register: 'Inscribirse',
    pending: 'Pago pendiente',
    confirmed: 'Inscrito',
    check_payment: 'Verificar pago',
    retry_payment: 'Nuevo enlace de pago',
    payment_now_confirmed: '¡Pago confirmado!',
    payment_still_pending: 'Pago aún no identificado.',
    modal: {
      title: 'Inscripción al evento',
      fee_warning: 'Este evento requiere un pago de {fee} tras la inscripción.',
      confirm_text: '¿Deseas inscribirte en este evento?',
      confirm: 'Confirmar inscripción',
      cancel: 'Cancelar',
      field_required: 'Este campo es obligatorio.',
    },
    choose_gateway: {
      title: 'Elige el método de pago',
      mercadopago: 'MercadoPago',
      stripe_connect: 'Tarjeta de crédito (Stripe)',
    },
  },
}
