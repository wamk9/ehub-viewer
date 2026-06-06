export default {
  title: 'Que ótimo! Obrigado por nos escolher para gerenciar {org_name}!',
  title_default: 'Nova Organização',
  subtitle: 'Após criar sua organização em nossa plataforma, você poderá criar eventos!',
  url_placeholder: 'identificacao',
  form: {
    org_name: 'Nome da sua organização (máximo 64 caracteres)',
    org_identifier: 'Um identificador único para sua organização (como um nome de usuário)',
    org_description: 'Uma pequena descrição sobre sua organização (máximo 180 caracteres)',
    org_submit: 'Enviar dados para criar sua organização no eHub'
  },
  tips: {
    image: 'Dica: O logo da organização é opcional, mas recomendamos uma imagem quadrada (proporção 1:1) com resolução de 500px ou mais'
  },
  loading: {
    creating: 'Criando sua organização...',
    created: '"{name}" criada! Redirecionando...',
    error: 'Falha ao criar a organização.'
  },
  validation: {
    route_min: 'O identificador precisa ter pelo menos 3 caracteres',
    route_available: 'Identificador disponível!'
  }
}
