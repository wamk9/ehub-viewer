export default {
  title: 'Gerenciamento de eventos',
  description: 'Gerencie os eventos da sua organização!',
  message: 'Escolha uma opção para ver e gerenciar as informações de {eventName}.',
  general: {
    title: 'Informações gerais',
    description: 'Aqui você pode ver todas as informações sobre o seu evento.'
  },
  stages: {
    title: 'Etapas do evento',
    description: 'Trabalhe com pontos, chaves ou ambos. Após o evento iniciado, as etapas não podem mais ser modificadas!'
  },
  notifications: {
    title: 'Notificações do evento',
    description: 'Veja toda a atividade relacionada ao seu evento.'
  },
  news: {
    title: 'Notícias do evento',
    description: 'Publique informações e atualizações para os inscritos no evento.',
    manage: {
      title: 'Notícias do evento',
      back: 'Voltar',
      back_to_articles: 'Voltar para artigos',
      new_article: 'Novo artigo',
      edit_article: 'Editar artigo',
      article_plural: 'artigos',
      article_singular: 'artigo',
      empty: 'Nenhum artigo publicado.',
      create_first: 'Criar primeiro artigo',
      no_permission: 'Você não tem permissão para publicar artigos.',
      published: 'Publicado',
      draft: 'Rascunho',
      by: 'Por',
      cover_label: 'Imagem de capa',
      cover_hint: 'Clique para selecionar uma imagem',
      title_placeholder: 'Título do artigo',
      excerpt_placeholder: 'Resumo curto (opcional)',
      excerpt_chars: 'caracteres',
      title_required: 'O título é obrigatório.',
      save_draft: 'Salvar rascunho',
      publish: 'Publicar',
      cancel: 'Cancelar',
      save_error: 'Erro ao salvar. Tente novamente.',
      delete: {
        title: 'Remover artigo',
        confirm: 'será removido permanentemente.',
        cancel: 'Cancelar',
        btn: 'Remover',
      },
    },
  },
  participants: {
    title: 'Participantes do evento',
    description: 'Aqui você verá todas as informações sobre os participantes confirmados do seu evento.',
    manage: {
      total: '{n} inscrição(ões)',
      confirmed: 'Confirmado',
      free: 'Gratuito',
      pending: 'Aguardando pagamento',
      empty: 'Nenhum inscrito ainda.',
      registered_at: 'Inscrito em',
      gateway_label: 'Gateway',
      form_data_label: 'Dados adicionais',
    },
  },
  remove: {
    title: 'Remover evento',
    description: 'Criou e quer remover? Sem problemas! Mas lembre-se: após removido, não será possível recuperar as informações do evento.'
  },
  create: {
    title: 'Crie seu evento',
    description: 'Configure o modo e a categoria do seu evento — nós organizaremos as informações necessárias para você.',
    stage1: {
      title: 'Ótimo! Você escolheu {type} no modo {runMode}!',
      description: 'Agora preencha o formulário com base nestas informações...',
      updated_form_advice: 'O eHub normalmente realiza atualizações dos formulários de categoria baseado na sugestão dos usuários. A última atualização deste formulário foi em {date}.'
    }
  }
}
