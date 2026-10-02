export default {
  legal: 'By creating an account you agree to the {terms} and the {privacy}.',
  legal_terms: 'Terms of use',
  legal_privacy: 'Privacy policy',
  verify: { send: 'Send code', verified: 'Verified', send_error: 'We could not send the code. Check the e-mail and try again.', too_many: 'Wait {seconds}s to ask for another code — the previous one still works.', wrong: 'Wrong code. Check the 6 digits in the e-mail.', expired: 'The code has expired. Click "Resend".', blocked: 'Too many wrong attempts. Click "Resend" to get a new code.', verify_error: 'We could not verify right now. Try again.' },
  phone_optional: 'Phone (optional)',
  coming_back: 'Free. When you finish, you go right back to where you were.',
  title: 'Welcome to eHub{name}!',
  description: 'Fill in your details below to create your account on our platform',
  form: {
    name: {
      label: 'First name',
      placeholder: 'Enter your first name',
      validation: { 'min-length': 'Enter at least {length} character | Enter at least {length} characters' }
    },
    surname: {
      label: 'Last name',
      placeholder: 'Enter your last name',
      validation: { 'min-length': 'Enter at least {length} character | Enter at least {length} characters' }
    },
    mail: {
      label: 'Email',
      placeholder: 'Enter your email address',
      validation: { 'min-length': 'Enter at least {length} character | Enter at least {length} characters' },
      send_code:  'Send code',
      verify:     'Verify',
      resend:     'Resend',
      verified:   'Email verified successfully!',
      code_hint:  'Check your inbox and spam folder. Code expires in 10 minutes.',
    },
    phone: {
      label: 'Phone',
      placeholder: 'Number without country code',
      hint: 'Selected code: {code}',
      validation: { 'min-length': 'Enter at least {length} digits' }
    },
    username: {
      label: 'Username',
      placeholder: 'Choose a username for your eHub profile',
      validation: { 'min-length': 'Enter at least {length} character | Enter at least {length} characters' }
    },
    password: {
      label: 'Password',
      placeholder: 'Choose a password to access eHub',
      validation: { 'min-length': 'Enter at least {length} character | Enter at least {length} characters' }
    },
    'password-confirm': {
      label: 'Confirm password',
      placeholder: 'Repeat your password',
      validation: { mismatch: 'The passwords do not match. Type the same password in both fields.', 'min-length': 'Enter at least {length} character | Enter at least {length} characters' }
    },
    image: {
      button: 'Click to upload a profile picture',
      upload: 'Upload photo',
      drop: 'Drop here',
      tip: 'Use a square image (1:1) with at least 400px.',
      tip_short: 'Photo tip',
    },
    submit: 'Create my eHub account!'
  },
  steps: {
    identity:    'Identity',
    contact:     'Contact',
    credentials: 'Access',
    next:        'Next',
    back:        'Back',
  },
  tips: {
    step1: 'Photo is optional — use a square image (min 400×400px). Your name and surname will identify you in events.',
    step2: 'Use an e-mail you check: the code goes there. Your username is part of your profile address (letters, numbers, "_" and "-" only).',
    step3: 'Use a password with at least 8 characters. Confirm it exactly the same to avoid errors.',
  },
  has_account: 'Already have an account?',
  login_link:  'Sign in',
  loading: {
    creating: { title: 'Creating your eHub account...' },
    created: { title: 'Account created! Redirecting...' },
    error: { title: 'Oops, something went wrong!' }
  }
}
