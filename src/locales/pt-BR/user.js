export default {
  name: {
    required: 'O nome é obrigatório.',
  },
  surname: {
    required: 'O sobrenome é obrigatório.',
  },
  mail: {
    required: 'O e-mail é obrigatório.',
    email:    'Informe um e-mail válido.',
    unique:   'Este e-mail já está em uso.',
  },
  phone: {
    required: 'O telefone é obrigatório.',
    unique:   'Este telefone já está em uso.',
  },
  username: {
    required: 'O nome de usuário é obrigatório.',
    unique:   'Este nome de usuário já está em uso.',
  },
  password: {
    required: 'A senha é obrigatória.',
  },
}
