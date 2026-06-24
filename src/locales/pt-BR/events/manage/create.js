export default {
  title: 'Criar evento',
  publish_error: 'Erro ao publicar evento. Verifique os dados e tente novamente.',
  breadcrumb: {
    step1: 'Categoria',
    step2: 'Informações',
    step3: 'Detalhes',
    step4: 'Inscrição',
  },
  step1: {
    description: 'Selecione a categoria, subcategoria e o modo do seu evento. Usaremos essas informações para montar o formulário correto.',
    error_required: 'Selecione a categoria e o modo do evento para continuar.',
    form: {
      category: {
        label: 'Categoria',
        placeholder: 'Selecione a categoria do evento',
      },
      subcategory: {
        label: 'Subcategoria',
        placeholder: 'Sem subcategoria (opcional)',
        none: 'Sem subcategoria disponível',
      },
      runmode: {
        label: 'Modo',
        placeholder: 'Onde o evento será realizado?',
      },
    },
    next: 'Continuar',
  },
  step2: {
    help: 'Estas informações serão exibidas publicamente na página do evento e nas listagens da plataforma.',
    sections: {
      identity:      'Identificação',
      description:   'Descrição completa',
      registrations: 'Inscrições',
      images:        'Imagens',
    },
    form: {
      name: {
        label: 'Nome do evento',
        error: 'O nome deve ter ao menos 5 caracteres.',
      },
      route: {
        label: 'URL do evento',
        help:  'Use apenas letras minúsculas, números e hífens. Ex: meu-campeonato-2026',
        error: 'URL inválida. Use 3–60 caracteres: letras minúsculas, números e hífens.',
      },
      short_description: {
        label: 'Descrição curta',
        help:  'Resumo de até 180 caracteres exibido nos cards e listagens.',
      },
      description: {
        label:       'Descrição completa',
        placeholder: 'Conte como o evento vai funcionar, regras, premiações...',
      },
      currency: {
        label: 'Tipo de inscrição',
        options: {
          free: 'Gratuito',
          brl:  'Pago — BRL (R$)',
          usd:  'Pago — USD (US$)',
          eur:  'Pago — EUR (€)',
        },
      },
      fee: {
        label: 'Valor da inscrição',
        error: 'Informe um valor válido (maior ou igual a zero).',
      },
      max_registrations: {
        label: 'Máximo de inscritos',
        help:  'Deixe em branco para inscrições ilimitadas.',
      },
      start_at: {
        label: 'Previsão de início',
        help:  'Data estimada de início. Quando a primeira etapa for criada, a data real será definida pela etapa.',
      },
      logo: {
        label: 'Logo do evento',
        help:  'Imagem quadrada (1:1). Aparece nos cards e no perfil do evento. Será salva como logo.webp.',
      },
      cover: {
        label: 'Imagem de capa',
        help:  'Proporção 16:9. Exibida como banner na página do evento. Será salva como cover.webp.',
      },
      color: {
        label: 'Cor de destaque',
        help:  'Cor usada no hero e no logotipo do evento. Deixe em branco para usar a cor da categoria.',
        auto:  'Cor automática (categoria)',
        reset: 'Remover',
      },
    },
    back: 'Voltar',
    next: 'Continuar',
  },
  step3: {
    description: 'Preencha os detalhes específicos da categoria e modo escolhidos. Esses dados serão salvos junto ao evento.',
    advice:     'Formulário da categoria atualizado em {date}.',
    no_schema:  'Nenhum formulário específico cadastrado para esta categoria e modo.',
    load_error: 'Não foi possível carregar o formulário da categoria. Tente novamente.',
    back: 'Voltar',
    next: 'Continuar',
  },
  step4: {
    description: 'Defina os campos que os participantes precisarão preencher ao se inscrever. Esta etapa é opcional — pule se não precisar coletar informações adicionais.',
    empty:       'Nenhum campo adicionado. Clique em "Adicionar campo" para criar o formulário de inscrição.',
    add_field:   'Adicionar campo',
    edit_field:  'Editar campo',
    save_field:  'Salvar campo',
    cancel:      'Cancelar',
    back:        'Voltar',
    publish:     'Publicar evento',
    field: {
      type:           'Tipo do campo',
      label:          'Nome do campo (label)',
      required:       'Campo obrigatório',
      values:         'Opções (separadas por vírgula)',
      label_required: 'Informe o nome do campo.',
    },
    types: {
      text:     'Texto livre',
      number:   'Número',
      select:   'Seleção (lista)',
      switch:   'Liga / Desliga',
      checkbox: 'Caixa de seleção',
    },
  },
}
