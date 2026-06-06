export default {
  step0: {
    title: 'Crie seu evento',
    description: 'Informe o modo e categoria de seu evento, nós iremos organizar as informações necessárias para você preencher.',
    form: {
      runmode: {
        placeholder: 'Onde você deseja aplicar este evento?',
        validation: { 'min-length': 'Selecione o modo do seu evento para continuar a criação' }
      },
      category: {
        placeholder: 'Qual a categoria do seu evento?',
        validation: { 'min-length': 'Selecione a categoria do seu evento para continuar a criação' }
      }
    },
    suggestion: {
      title: 'Não encontrou a categoria que gostaria de utilizar?',
      description: 'Nós sabemos que nossa lista pode ficar melhor, por isso criamos um espaço no qual você poderá sugerir categorias para serem adicionadas no eHub.',
      call_action: 'Sugira agora!'
    },
    nextstep: 'Buscar informações'
  },
  step1: {
    title: "A categoria escolhida foi '{type}' no modo '{runMode}'!",
    description: 'Agora precisaremos que você informe algumas informações básicas sobre seu evento antes de irmos para as informações específicas da categoria e modo escolhidos.',
    form: {
      'event-name': {
        label: 'Nome',
        placeholder: 'Nome do evento',
        validation: { regex: 'É necessário ao menos {minLength} caracteres neste campo' }
      },
      'event-endpoint': {
        label: 'Identificador',
        placeholder: 'Identificador do evento (usado comumente na URL)',
        validation: {
          regex: 'É necessário ao menos {minLength} caracteres neste campo',
          in_use: 'Identificador já utilizado anteriormente pela organização, tente outra variação'
        }
      },
      'event-short-description': {
        label: 'Descrição curta',
        placeholder: 'Descrição curta do evento (máximo de {maxQtd} caracteres - pode ser editado futuramente)'
      },
      'event-description': {
        label: 'Descrição',
        placeholder: 'Diga como o seu evento irá funcionar (máximo de {maxQtd} caracteres - pode ser editado futuramente)'
      },
      'event-currency': {
        label: 'Moeda',
        placeholder: 'Qual será a moeda utilizada no seu evento',
        values: { free: 'Evento gratuito', brl: 'BRL (R$)', usd: 'USD (US$)' }
      },
      'event-register-fee': {
        label: 'Taxa de registro',
        placeholder: 'Preencha o valor que deseja que o eHub cobre no registro'
      }
    },
    nextstep: 'Buscar informações específicas'
  },
  step2: {
    title: 'Ok! Agora vamos falar sobre o evento...',
    description: 'Aqui você irá preencher informações específicas do seu evento, após essa etapa iremos publicá-lo na nossa plataforma!',
    previouspage: 'Página anterior',
    nextpage: 'Próxima página',
    publish: 'Publicar',
    updated_form_advice: 'O eHub normalmente realiza atualizações dos formulários de categoria baseado na sugestão dos usuários. A última atualização deste formulário foi em {date}.'
  }
}
