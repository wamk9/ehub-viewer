export default {
  step0: {
    title: 'Create your event',
    description: 'Select the mode and category of your event, and we will organize the required information for you to fill in.',
    form: {
      runmode: {
        placeholder: 'Where will your event take place?',
        validation: { 'min-length': 'Select your event mode to continue' }
      },
      category: {
        placeholder: 'What is the event category?',
        validation: { 'min-length': 'Select a category to continue' }
      }
    },
    suggestion: {
      title: "Didn't find the category you need?",
      description: "We know our list can grow, so we've created a space for you to suggest new categories to be added to eHub.",
      call_action: 'Suggest now!'
    },
    nextstep: 'Fetch information'
  },
  step1: {
    title: "You chose '{type}' on '{runMode}'!",
    description: 'Now fill in some basic information about your event before we move to the category-specific details.',
    form: {
      'event-name': {
        label: 'Name',
        placeholder: 'Event name',
        validation: { regex: 'At least {minLength} characters required' }
      },
      'event-endpoint': {
        label: 'Identifier',
        placeholder: 'Event identifier (used in the URL)',
        validation: {
          regex: 'At least {minLength} characters required',
          in_use: 'Identifier already in use by this organization, try a different one'
        }
      },
      'event-short-description': {
        label: 'Short description',
        placeholder: 'Brief event description (max {maxQtd} characters — editable later)'
      },
      'event-description': {
        label: 'Description',
        placeholder: 'Describe how your event will work (max {maxQtd} characters — editable later)'
      },
      'event-currency': {
        label: 'Currency',
        placeholder: 'Which currency will your event use',
        values: { free: 'Free event', brl: 'BRL (R$)', usd: 'USD (US$)' }
      },
      'event-register-fee': {
        label: 'Registration fee',
        placeholder: 'Enter the amount eHub should charge for registration'
      }
    },
    nextstep: 'Fetch category-specific information'
  },
  step2: {
    title: "Almost there! Now let's talk about the event...",
    description: 'Fill in the event-specific details. After this step, we will publish it on our platform!',
    previouspage: 'Previous page',
    nextpage: 'Next page',
    publish: 'Publish',
    updated_form_advice: 'eHub regularly updates category forms based on user suggestions. This form was last updated on {date}.'
  }
}
