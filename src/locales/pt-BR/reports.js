// Organization and team reports (EhubReportBuilder).
export default {
  "title": "Relatórios",
  "sub_org": "Números da sua organização: inscrições, receita, eventos, resultados e equipe.",
  "sub_team": "Números da sua equipe: elenco, eventos, resultados e candidaturas.",
  "col_name": "Modelo",
  "col_data": "Dados",
  "col_last": "Última vez",
  "tab_ready": "Prontos",
  "tab_saved": "Meus modelos",
  "new": "Montar relatório",
  "generate": "Gerar",
  "edit": "Personalizar",
  "run": "Abrir",
  "delete": "Excluir",
  "back": "Voltar",
  "never": "Nunca gerado",
  "last_run": "Gerado {date}",
  "by": "por {name}",
  "saved_empty": "Você ainda não salvou nenhum modelo. Monte um relatório e clique em “Salvar modelo” para reaproveitar depois.",
  "delete_q": "Excluir o modelo “{name}”? Os dados não são apagados, só o modelo.",
  "deleted": "Modelo excluído.",
  "saved": "Modelo salvo!",
  "error": "Não foi possível gerar o relatório.",
  "builder": {
    "title": "Montar relatório",
    "name": "Nome do modelo",
    "name_ph": "ex.: Inscritos pendentes do mês",
    "dataset": "O que você quer ver?",
    "mode": "Formato",
    "mode_list": "Lista detalhada",
    "mode_group": "Resumo agrupado",
    "columns": "Colunas",
    "columns_hint": "Marque as colunas e use as setas para mudar a ordem.",
    "group_by": "Agrupar por",
    "filters": "Filtros",
    "period": "Período",
    "from": "De",
    "to": "Até",
    "event": "Evento",
    "all_events": "Todos os eventos",
    "status": "Situação",
    "all_status": "Todas",
    "sort": "Ordenar por",
    "sort_default": "Padrão",
    "asc": "Crescente",
    "desc": "Decrescente",
    "chart": "Gráfico",
    "chart_bar": "Barras",
    "chart_none": "Sem gráfico",
    "save": "Salvar modelo",
    "save_new": "Salvar como novo",
    "name_required": "Dê um nome ao modelo para salvar.",
    "sensitive": "E-mail e telefone só aparecem para quem pode ver os dados das inscrições. Use só para assuntos dos eventos (LGPD).",
    "move_up": "Subir coluna",
    "move_down": "Descer coluna"
  },
  "periods": {
    "all": "Todo o período",
    "7d": "Últimos 7 dias",
    "30d": "Últimos 30 dias",
    "90d": "Últimos 90 dias",
    "365d": "Últimos 12 meses",
    "month": "Este mês",
    "last_month": "Mês passado",
    "year": "Este ano",
    "custom": "Escolher datas"
  },
  "result": {
    "rows": "{n} linhas",
    "total": "Total",
    "count": "Quantidade",
    "sum": "Soma",
    "empty": "Nenhum dado para esses filtros.",
    "truncated": "Mostrando as primeiras 5.000 linhas. Use filtros para reduzir.",
    "csv": "Baixar planilha (CSV)",
    "print": "Imprimir / PDF",
    "generated_at": "Gerado em {date}",
    "group": "Grupo",
    "no_value": "(sem valor)"
  },
  "datasets": {
    "registrations": {
      "label": "Inscrições",
      "desc": "Quem se inscreveu, situação do pagamento, check-in e colocação."
    },
    "revenue": {
      "label": "Receita",
      "desc": "Inscrições pagas e confirmadas, com valor e forma de pagamento."
    },
    "refunds": {
      "label": "Reembolsos",
      "desc": "Pedidos de reembolso, valores e situação."
    },
    "events": {
      "label": "Eventos",
      "desc": "Cada evento com vagas, inscritos, check-ins e receita."
    },
    "results": {
      "label": "Resultados",
      "desc": "Colocações e pontos em cada etapa."
    },
    "members": {
      "label": "Membros",
      "desc": "Pessoas da equipe de gestão e seus cargos."
    },
    "followers": {
      "label": "Seguidores",
      "desc": "Quantos novos seguidores por período (sem nomes)."
    },
    "applications": {
      "label": "Candidaturas",
      "desc": "Pedidos para entrar na equipe e o que foi decidido."
    }
  },
  "team_datasets": {
    "members": {
      "label": "Elenco",
      "desc": "Integrantes, função e quantos eventos cada um disputou."
    },
    "events": {
      "label": "Eventos",
      "desc": "Eventos em que a equipe se inscreveu e a colocação final."
    },
    "results": {
      "label": "Resultados",
      "desc": "Colocações e pontos da equipe em cada etapa publicada."
    }
  },
  "presets": {
    "registrations_by_event": {
      "label": "Inscrições por evento",
      "desc": "Quantos inscritos e quanto entrou em cada evento."
    },
    "registrations_by_month": {
      "label": "Inscrições por mês",
      "desc": "Como as inscrições evoluem ao longo do tempo."
    },
    "revenue_by_month": {
      "label": "Receita por mês",
      "desc": "Quanto entrou de inscrições pagas a cada mês."
    },
    "revenue_by_event": {
      "label": "Receita por evento",
      "desc": "Quais eventos trouxeram mais receita."
    },
    "events_overview": {
      "label": "Visão geral dos eventos",
      "desc": "Vagas, inscritos, check-ins e receita de cada evento."
    },
    "checkin": {
      "label": "Presença (check-in)",
      "desc": "Quantos inscritos compareceram."
    },
    "refunds": {
      "label": "Reembolsos",
      "desc": "Todos os pedidos de reembolso e a situação de cada um."
    },
    "members": {
      "label": "Equipe de gestão",
      "desc": "Quantas pessoas por cargo na organização."
    },
    "followers": {
      "label": "Novos seguidores",
      "desc": "Seguidores ganhos por mês."
    },
    "results": {
      "label": "Resultados",
      "desc": "Todas as colocações publicadas e em rascunho."
    },
    "roster": {
      "label": "Elenco",
      "desc": "Integrantes, funções e participação em eventos."
    },
    "team_events": {
      "label": "Eventos disputados",
      "desc": "Eventos da equipe e colocação final."
    },
    "team_results": {
      "label": "Resultados",
      "desc": "Cada colocação da equipe em etapas publicadas."
    },
    "team_results_by_event": {
      "label": "Resultados por evento",
      "desc": "Quantas etapas a equipe disputou em cada evento."
    },
    "applications": {
      "label": "Candidaturas",
      "desc": "Pedidos por situação: pendentes, aceitos e recusados."
    }
  },
  "groups": {
    "event": "Evento",
    "status": "Situação",
    "month": "Mês",
    "gateway": "Forma de pagamento",
    "category": "Modalidade",
    "checked_in": "Fez check-in",
    "currency": "Moeda",
    "reason": "Motivo",
    "situation": "Andamento",
    "format": "Formato",
    "stage": "Etapa",
    "role": "Cargo/função",
    "position": "Colocação"
  },
  "cols": {
    "participant": "Participante",
    "username": "Usuário",
    "mail": "E-mail",
    "phone": "Telefone",
    "team": "Equipe",
    "event": "Evento",
    "category": "Modalidade",
    "status": "Situação",
    "gateway": "Pagamento via",
    "amount": "Valor",
    "currency": "Moeda",
    "checked_in": "Check-in",
    "final_position": "Colocação final",
    "registered_at": "Inscrito em",
    "confirmed_at": "Confirmado em",
    "requested_at": "Pedido em",
    "reason": "Motivo",
    "refunded_at": "Reembolsado em",
    "format": "Formato",
    "start_at": "Início",
    "publication": "Publicação",
    "situation": "Andamento",
    "spots": "Vagas",
    "registrations": "Inscritos",
    "confirmed": "Confirmados",
    "pending": "Pendentes",
    "waitlist": "Lista de espera",
    "stages": "Etapas",
    "fee": "Taxa de inscrição",
    "revenue": "Receita",
    "stage": "Etapa",
    "position": "Colocação",
    "score": "Pontos",
    "qualified": "Classificado",
    "published": "Publicado",
    "member": "Pessoa",
    "role": "Cargo/função",
    "joined_at": "Desde",
    "followed_at": "Seguiu em",
    "is_admin": "Administra",
    "events": "Eventos",
    "organization": "Organização",
    "date": "Data",
    "win": "Vitória",
    "podium": "Pódio",
    "applicant": "Candidato",
    "desired_role": "Função desejada",
    "applied_at": "Enviado em",
    "group": "Grupo",
    "count": "Quantidade",
    "total": "Valor total"
  },
  "v": {
    "yes": "Sim",
    "no": "Não",
    "status": {
      "free": "Gratuito",
      "confirmed": "Confirmado",
      "pending": "Pendente",
      "failed": "Falhou",
      "cancelled": "Cancelado",
      "refunded": "Reembolsado"
    },
    "gateway": {
      "stripe": "Cartão (Stripe)",
      "mercadopago": "Mercado Pago",
      "manual": "Combinado com a organização",
      "paypal": "PayPal"
    },
    "refund_status": {
      "awaiting_payment": "Aguardando pagamento",
      "pending": "Em andamento",
      "refunded": "Reembolsado",
      "failed": "Falhou"
    },
    "refund_reason": {
      "participant": "Pedido do participante",
      "organizer": "Removido pela organização",
      "late_payment": "Pagamento após o prazo"
    },
    "publication": {
      "draft": "Rascunho",
      "published": "Publicado",
      "unlisted": "Não listado",
      "private": "Privado"
    },
    "situation": {
      "open": "Inscrições/aguardando início",
      "running": "Em andamento",
      "finished": "Encerrado"
    },
    "format": {
      "points": "Pontos corridos",
      "bracket": "Eliminatória",
      "groups": "Grupos + final",
      "time": "Tempo"
    },
    "application_status": {
      "pending": "Pendente",
      "accepted": "Aceita",
      "rejected": "Recusada"
    }
  }
}
