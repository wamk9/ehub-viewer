export default {
  title: 'Saudações da equipe do eHub{name}!',
  description: 'Insira seus dados nos campos abaixo para podermos criar o seu cadastro na nossa plataforma',
  form: {
    name: {
      label: 'Nome',
      placeholder: 'Seu nome',
      validation: { 'min-length': 'Insira ao menos {length} caractere neste campo | Insira ao menos {length} caracteres neste campo' }
    },
    surname: {
      label: 'Sobrenome',
      placeholder: 'Seu sobrenome',
      validation: { 'min-length': 'Insira ao menos {length} caractere neste campo | Insira ao menos {length} caracteres neste campo' }
    },
    mail: {
      label: 'E-mail',
      placeholder: 'Insira o e-mail que você costuma utilizar',
      validation: { 'min-length': 'Insira ao menos {length} caractere neste campo | Insira ao menos {length} caracteres neste campo' },
      send_code:  'Enviar código',
      verify:     'Verificar',
      resend:     'Reenviar',
      verified:   'E-mail verificado com sucesso!',
      code_hint:  'Verifique sua caixa de entrada e spam. O código expira em 10 minutos.',
    },
    phone: {
      label: 'Telefone',
      placeholder: 'Insira o seu número de telefone (com DDD) para os organizadores entrarem em contato caso necessário',
      validation: { 'min-length': 'Insira ao menos {length} caractere neste campo | Insira ao menos {length} caracteres neste campo' }
    },
    username: {
      label: 'Nome de usuário',
      placeholder: 'Com qual usuário você gostaria permanecer? Usaremos para criar sua página de perfil no eHub',
      validation: { 'min-length': 'Insira ao menos {length} caractere neste campo | Insira ao menos {length} caracteres neste campo' }
    },
    password: {
      label: 'Senha de acesso',
      placeholder: 'Insira a senha que você gostaria de utilizar para acessar o eHub',
      validation: { 'min-length': 'Insira ao menos {length} caractere neste campo | Insira ao menos {length} caracteres neste campo' }
    },
    'password-confirm': {
      label: 'Confirmação da senha de acesso',
      placeholder: 'Repita a senha que você gostaria de utilizar para acessar o eHub',
      validation: { 'min-length': 'Insira ao menos {length} caractere neste campo | Insira ao menos {length} caracteres neste campo' }
    },
    image: {
      button: 'Clique para enviar uma imagem de perfil',
      upload: 'Enviar foto',
      drop: 'Solte aqui',
      tip: 'Use imagem quadrada (1:1) com no mínimo 400px.',
      tip_short: 'Dica de foto',
    },
    phone: {
      label: 'Telefone',
      placeholder: 'Número sem código do país',
      hint: 'Código selecionado: {code}',
      validation: { 'min-length': 'Insira ao menos {length} dígitos' }
    },
    submit: 'Cadastre-me no eHub!'
  },
  steps: {
    identity:    'Identidade',
    contact:     'Contato',
    credentials: 'Acesso',
    next:        'Próximo',
    back:        'Voltar',
  },
  tips: {
    step1: 'Foto opcional — use imagem quadrada (mínimo 400×400px). Nome e sobrenome serão usados para identificá-lo nos eventos.',
    step2: 'Use um e-mail válido para notificações. O nome de usuário será público no seu perfil e não pode ser alterado depois.',
    step3: 'Use uma senha com pelo menos 8 caracteres. Confirme exatamente igual para evitar erros.',
  },
  has_account: 'Já tem uma conta?',
  login_link:  'Entrar',
  loading: {
    creating: { title: 'Criando sua conta no eHub...' },
    created: { title: 'Conta criada! Redirecionando...' },
    error: { title: 'Ops, algo deu errado!' }
  }
}
