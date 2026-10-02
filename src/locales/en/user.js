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
    invalid:  'Invalid phone. Use digits only with area code.',
    required: 'Phone is required.',
    unique:   'This phone number is already in use.',
  },
  username: {
    invalid:  'Use 5 to 60 characters: letters, numbers, "_" or "-" (no spaces or accents).',
    required: 'Username is required.',
    unique:   'This username is already taken.',
  },
  password: {
    required: 'Password is required.',
    min: 'Password must have at least 8 characters.',
  },
}
