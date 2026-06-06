export default {
  title: 'Create event',
  publish_error: 'Failed to publish event. Check the data and try again.',
  breadcrumb: {
    step1: 'Category',
    step2: 'Details',
    step3: 'Specifics',
    step4: 'Registration',
  },
  step1: {
    description: 'Select the category, subcategory and mode of your event. We will use this to load the correct form.',
    error_required: 'Select a category and mode to continue.',
    form: {
      category: {
        label: 'Category',
        placeholder: 'Select the event category',
      },
      subcategory: {
        label: 'Subcategory',
        placeholder: 'No subcategory (optional)',
      },
      runmode: {
        label: 'Mode',
        placeholder: 'Where will the event take place?',
      },
    },
    next: 'Continue',
  },
  step2: {
    help: 'This information will be shown publicly on the event page and in platform listings.',
    sections: {
      identity:      'Identity',
      description:   'Full description',
      registrations: 'Registrations',
      images:        'Images',
    },
    form: {
      name: {
        label: 'Event name',
        error: 'Name must be at least 5 characters.',
      },
      route: {
        label: 'Event URL',
        help:  'Use only lowercase letters, numbers and hyphens. E.g. my-championship-2026',
        error: 'Invalid URL. Use 3–60 characters: lowercase letters, numbers and hyphens.',
      },
      short_description: {
        label: 'Short description',
        help:  'Summary up to 180 characters shown in cards and listings.',
      },
      description: {
        label:       'Full description',
        placeholder: 'Describe how the event works, rules, prizes...',
      },
      currency: {
        label: 'Registration type',
        options: {
          free: 'Free',
          brl:  'Paid — BRL (R$)',
          usd:  'Paid — USD (US$)',
          eur:  'Paid — EUR (€)',
        },
      },
      fee: {
        label: 'Registration fee',
        error: 'Enter a valid amount (zero or greater).',
      },
      max_registrations: {
        label: 'Maximum registrations',
        help:  'Leave blank for unlimited registrations.',
      },
      start_at: {
        label: 'Start date and time',
      },
      logo: {
        label: 'Event logo',
        help:  'Square image (1:1). Shown in cards and on the event profile. Saved as logo.webp.',
      },
      cover: {
        label: 'Cover image',
        help:  '16:9 ratio. Displayed as a banner on the event page. Saved as preview.webp.',
      },
    },
    back: 'Back',
    next: 'Continue',
  },
  step3: {
    description: 'Fill in the details specific to the chosen category and mode. This data will be saved with the event.',
    advice:     'Category form last updated on {date}.',
    load_error: 'Could not load the category form. Please try again.',
    back: 'Back',
    next: 'Continue',
  },
  step4: {
    description: 'Define the fields participants must fill in when registering. This step is optional — skip it if you do not need extra information.',
    empty:       'No fields added yet. Click "Add field" to build the registration form.',
    add_field:   'Add field',
    edit_field:  'Edit field',
    save_field:  'Save field',
    cancel:      'Cancel',
    back:        'Back',
    publish:     'Publish event',
    field: {
      type:           'Field type',
      label:          'Field label',
      required:       'Required field',
      values:         'Options (comma-separated)',
      label_required: 'Enter the field label.',
    },
    types: {
      text:     'Free text',
      number:   'Number',
      select:   'Select (list)',
      switch:   'On / Off',
      checkbox: 'Checkbox',
    },
  },
}
