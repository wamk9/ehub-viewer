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
    invalid:  'Telefone inválido. Use só números com DDD, ex.: 11999990000.',
    required: 'O telefone é obrigatório.',
    unique:   'Este telefone já está em uso.',
  },
  username: {
    invalid:  'Use de 5 a 60 caracteres: letras, números, "_" ou "-" (sem espaços nem acentos).',
    required: 'O nome de usuário é obrigatório.',
    unique:   'Este nome de usuário já está em uso.',
  },
  password: {
    required: 'A senha é obrigatória.',
    min: 'A senha precisa ter pelo menos 8 caracteres.',
  },
}
