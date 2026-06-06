export default {
  name: {
    required: 'Name is required.',
  },
  surname: {
    required: 'Last name is required.',
  },
  mail: {
    required: 'Email is required.',
    email:    'Enter a valid email address.',
    unique:   'This email is already in use.',
  },
  phone: {
    required: 'Phone is required.',
    unique:   'This phone number is already in use.',
  },
  username: {
    required: 'Username is required.',
    unique:   'This username is already taken.',
  },
  password: {
    required: 'Password is required.',
  },
}
