// Organization and team reports (EhubReportBuilder).
export default {
  "title": "Informes",
  "sub_org": "Tu organización en números: inscripciones, ingresos, eventos, resultados y equipo.",
  "sub_team": "Tu equipo en números: plantilla, eventos, resultados y solicitudes.",
  "col_name": "Modelo",
  "col_data": "Datos",
  "col_last": "Última vez",
  "tab_ready": "Listos",
  "tab_saved": "Mis modelos",
  "new": "Armar informe",
  "generate": "Generar",
  "edit": "Personalizar",
  "run": "Abrir",
  "delete": "Eliminar",
  "back": "Volver",
  "never": "Nunca generado",
  "last_run": "Generado {date}",
  "by": "por {name}",
  "saved_empty": "Aún no guardaste ningún modelo. Arma un informe y haz clic en “Guardar modelo” para reutilizarlo.",
  "delete_q": "¿Eliminar el modelo “{name}”? No se borran datos, solo el modelo.",
  "deleted": "Modelo eliminado.",
  "saved": "¡Modelo guardado!",
  "error": "No se pudo generar el informe.",
  "builder": {
    "title": "Armar informe",
    "name": "Nombre del modelo",
    "name_ph": "ej.: Inscritos pendientes del mes",
    "dataset": "¿Qué quieres ver?",
    "mode": "Formato",
    "mode_list": "Lista detallada",
    "mode_group": "Resumen agrupado",
    "columns": "Columnas",
    "columns_hint": "Marca las columnas y usa las flechas para cambiar el orden.",
    "group_by": "Agrupar por",
    "filters": "Filtros",
    "period": "Período",
    "from": "Desde",
    "to": "Hasta",
    "event": "Evento",
    "all_events": "Todos los eventos",
    "status": "Situación",
    "all_status": "Todas",
    "sort": "Ordenar por",
    "sort_default": "Predeterminado",
    "asc": "Ascendente",
    "desc": "Descendente",
    "chart": "Gráfico",
    "chart_bar": "Barras",
    "chart_none": "Sin gráfico",
    "save": "Guardar modelo",
    "save_new": "Guardar como nuevo",
    "name_required": "Ponle un nombre al modelo para guardarlo.",
    "sensitive": "E-mail y teléfono solo aparecen para quien puede ver los datos de inscripción. Úsalos solo para asuntos del evento.",
    "move_up": "Subir columna",
    "move_down": "Bajar columna"
  },
  "periods": {
    "all": "Todo el período",
    "7d": "Últimos 7 días",
    "30d": "Últimos 30 días",
    "90d": "Últimos 90 días",
    "365d": "Últimos 12 meses",
    "month": "Este mes",
    "last_month": "Mes pasado",
    "year": "Este año",
    "custom": "Elegir fechas"
  },
  "result": {
    "rows": "{n} filas",
    "total": "Total",
    "count": "Cantidad",
    "sum": "Suma",
    "empty": "No hay datos para estos filtros.",
    "truncated": "Mostrando las primeras 5.000 filas. Usa filtros para reducir.",
    "csv": "Descargar planilla (CSV)",
    "print": "Imprimir / PDF",
    "generated_at": "Generado el {date}",
    "group": "Grupo",
    "no_value": "(sin valor)"
  },
  "datasets": {
    "registrations": {
      "label": "Inscripciones",
      "desc": "Quién se inscribió, situación del pago, check-in y posición."
    },
    "revenue": {
      "label": "Ingresos",
      "desc": "Inscripciones pagadas y confirmadas, con valor y forma de pago."
    },
    "refunds": {
      "label": "Reembolsos",
      "desc": "Pedidos de reembolso, valores y situación."
    },
    "events": {
      "label": "Eventos",
      "desc": "Cada evento con plazas, inscritos, check-ins e ingresos."
    },
    "results": {
      "label": "Resultados",
      "desc": "Posiciones y puntos en cada etapa."
    },
    "members": {
      "label": "Miembros",
      "desc": "Personas del equipo de gestión y sus cargos."
    },
    "followers": {
      "label": "Seguidores",
      "desc": "Nuevos seguidores por período (sin nombres)."
    },
    "applications": {
      "label": "Solicitudes",
      "desc": "Pedidos para entrar al equipo y lo que se decidió."
    }
  },
  "team_datasets": {
    "members": {
      "label": "Plantilla",
      "desc": "Integrantes, función y cuántos eventos jugó cada uno."
    },
    "events": {
      "label": "Eventos",
      "desc": "Eventos en que el equipo se inscribió y su posición final."
    },
    "results": {
      "label": "Resultados",
      "desc": "Posiciones y puntos del equipo en cada etapa publicada."
    }
  },
  "presets": {
    "registrations_by_event": {
      "label": "Inscripciones por evento",
      "desc": "Cuántos inscritos y cuánto ingresó en cada evento."
    },
    "registrations_by_month": {
      "label": "Inscripciones por mes",
      "desc": "Cómo evolucionan las inscripciones."
    },
    "revenue_by_month": {
      "label": "Ingresos por mes",
      "desc": "Ingresos de inscripciones pagadas cada mes."
    },
    "revenue_by_event": {
      "label": "Ingresos por evento",
      "desc": "Qué eventos generaron más ingresos."
    },
    "events_overview": {
      "label": "Resumen de eventos",
      "desc": "Plazas, inscritos, check-ins e ingresos por evento."
    },
    "checkin": {
      "label": "Asistencia (check-in)",
      "desc": "Cuántos inscritos asistieron."
    },
    "refunds": {
      "label": "Reembolsos",
      "desc": "Todos los pedidos de reembolso y su situación."
    },
    "members": {
      "label": "Equipo de gestión",
      "desc": "Personas por cargo en la organización."
    },
    "followers": {
      "label": "Nuevos seguidores",
      "desc": "Seguidores ganados por mes."
    },
    "results": {
      "label": "Resultados",
      "desc": "Todas las posiciones, publicadas y en borrador."
    },
    "roster": {
      "label": "Plantilla",
      "desc": "Integrantes, funciones y participación en eventos."
    },
    "team_events": {
      "label": "Eventos disputados",
      "desc": "Eventos del equipo y posición final."
    },
    "team_results": {
      "label": "Resultados",
      "desc": "Cada posición del equipo en etapas publicadas."
    },
    "team_results_by_event": {
      "label": "Resultados por evento",
      "desc": "Cuántas etapas jugó el equipo en cada evento."
    },
    "applications": {
      "label": "Solicitudes",
      "desc": "Pedidos por situación: pendientes, aceptados y rechazados."
    }
  },
  "groups": {
    "event": "Evento",
    "status": "Situación",
    "month": "Mes",
    "gateway": "Forma de pago",
    "category": "Modalidad",
    "checked_in": "Hizo check-in",
    "currency": "Moneda",
    "reason": "Motivo",
    "situation": "Avance",
    "format": "Formato",
    "stage": "Etapa",
    "role": "Cargo/función",
    "position": "Posición"
  },
  "cols": {
    "participant": "Participante",
    "username": "Usuario",
    "mail": "E-mail",
    "phone": "Teléfono",
    "team": "Equipo",
    "event": "Evento",
    "category": "Modalidad",
    "status": "Situación",
    "gateway": "Pago vía",
    "amount": "Valor",
    "currency": "Moneda",
    "checked_in": "Check-in",
    "final_position": "Posición final",
    "registered_at": "Inscrito el",
    "confirmed_at": "Confirmado el",
    "requested_at": "Pedido el",
    "reason": "Motivo",
    "refunded_at": "Reembolsado el",
    "format": "Formato",
    "start_at": "Inicio",
    "publication": "Publicación",
    "situation": "Avance",
    "spots": "Plazas",
    "registrations": "Inscritos",
    "confirmed": "Confirmados",
    "pending": "Pendientes",
    "waitlist": "Lista de espera",
    "stages": "Etapas",
    "fee": "Cuota de inscripción",
    "revenue": "Ingresos",
    "stage": "Etapa",
    "position": "Posición",
    "score": "Puntos",
    "qualified": "Clasificado",
    "published": "Publicado",
    "member": "Persona",
    "role": "Cargo/función",
    "joined_at": "Desde",
    "followed_at": "Siguió el",
    "is_admin": "Administra",
    "events": "Eventos",
    "organization": "Organización",
    "date": "Fecha",
    "win": "Victoria",
    "podium": "Podio",
    "applicant": "Candidato",
    "desired_role": "Función deseada",
    "applied_at": "Enviado el",
    "group": "Grupo",
    "count": "Cantidad",
    "total": "Valor total"
  },
  "v": {
    "yes": "Sí",
    "no": "No",
    "status": {
      "free": "Gratuito",
      "confirmed": "Confirmado",
      "pending": "Pendiente",
      "failed": "Falló",
      "cancelled": "Cancelado",
      "refunded": "Reembolsado"
    },
    "gateway": {
      "stripe": "Tarjeta (Stripe)",
      "mercadopago": "Mercado Pago",
      "manual": "Acordado con la organización",
      "paypal": "PayPal"
    },
    "refund_status": {
      "awaiting_payment": "Esperando pago",
      "pending": "En curso",
      "refunded": "Reembolsado",
      "failed": "Falló"
    },
    "refund_reason": {
      "participant": "Pedido del participante",
      "organizer": "Quitado por la organización",
      "late_payment": "Pago fuera de plazo"
    },
    "publication": {
      "draft": "Borrador",
      "published": "Publicado",
      "unlisted": "No listado",
      "private": "Privado"
    },
    "situation": {
      "open": "Inscripciones / sin iniciar",
      "running": "En curso",
      "finished": "Terminado"
    },
    "format": {
      "points": "Puntos",
      "bracket": "Eliminatoria",
      "groups": "Grupos + final",
      "time": "Tiempo"
    },
    "application_status": {
      "pending": "Pendiente",
      "accepted": "Aceptada",
      "rejected": "Rechazada"
    }
  }
}
