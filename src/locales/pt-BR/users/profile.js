export default {
  title: 'Meu Perfil',
  tabs: {
    personal: 'Dados Pessoais',
    password: 'Senha',
    account:  'Conta',
  },
  personal: {
    title:   'Informações Pessoais',
    tip:     'Sua foto e nome serão exibidos nos eventos e no seu perfil público.',
    success: 'Perfil atualizado com sucesso!',
    submit:  'Salvar Alterações',
    form: {
      name:     { label: 'Nome' },
      surname:  { label: 'Sobrenome' },
      phone:    { label: 'Telefone' },
      username: { label: 'Nome de usuário' },
      image:    { upload: 'Alterar foto', drop: 'Solte aqui' },
    },
  },
  password: {
    title:   'Alterar Senha',
    tip:     'Após salvar, todos os outros dispositivos serão desconectados.',
    success: 'Senha alterada com sucesso!',
    submit:  'Alterar Senha',
    form: {
      current:  { label: 'Senha atual',          placeholder: 'Insira sua senha atual' },
      new:      { label: 'Nova senha',            placeholder: 'Mínimo 8 caracteres' },
      confirm:  { label: 'Confirmar nova senha',  placeholder: 'Repita a nova senha' },
    },
    error: {
      mismatch: 'As senhas não coincidem.',
      wrong:    'Senha atual incorreta.',
    },
  },
  account: {
    title:    'Informações da Conta',
    mail:     'E-mail',
    since:    'Membro desde',
    verified: 'E-mail verificado',
    danger: {
      title:       'Zona de Perigo',
      description: 'A exclusão da conta é permanente e irreversível. Todos os seus dados serão removidos.',
      placeholder: 'Insira sua senha para confirmar',
      submit:      'Excluir minha conta',
      confirm:     'Tem certeza? Esta ação não pode ser desfeita.',
    },
  },
  loading: {
    fetch:   'Carregando perfil...',
    saving:  'Salvando...',
    deleting:'Excluindo conta...',
  },
  error: {
    generic: 'Algo deu errado. Tente novamente.',
    fetch:   'Não foi possível carregar o perfil.',
  },
}
