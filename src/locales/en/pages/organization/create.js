export default {
  title: 'Cool! Thanks for choosing us to manage {org_name}!',
  title_default: 'New Organization',
  subtitle: 'After creating your organization in our platform, you will be able to create events!',
  url_placeholder: 'identifier',
  form: {
    org_name: 'Your organization name (64 characters max)',
    org_identifier: 'A unique identifier for your organization (like a username)',
    org_description: 'A small description about your organization (180 characters max)',
    org_submit: 'Send data to create your organization at eHub'
  },
  tips: {
    image: 'Tip: An organization logo is optional, but we recommend a square image (1:1 aspect ratio) with a resolution of 500px or more'
  },
  loading: {
    creating: 'Creating your organization...',
    created: '"{name}" created! Redirecting...',
    error: 'Failed to create organization.'
  },
  validation: {
    route_min: 'Identifier must have at least 3 characters',
    route_available: 'Identifier available!'
  }
}
