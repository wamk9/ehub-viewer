export default {
  title: 'Event management',
  description: "Manage your organization's events!",
  message: 'Choose an option to see and manage information for {eventName}.',
  general: {
    title: 'General information',
    description: 'See all info about your event.'
  },
  stages: {
    title: 'Event stages',
    description: 'Work with points, bracket, or both. Stages cannot be modified after the event starts!'
  },
  notifications: {
    title: 'Event notifications',
    description: 'See all activity related to your event.'
  },
  participants: {
    title: 'Event participants',
    description: 'See all confirmed participants for your event.'
  },
  remove: {
    title: 'Remove event',
    description: 'Want to remove it? No problem! But remember: once removed, event data cannot be recovered.'
  },
  create: {
    title: 'Create your event',
    description: 'Set your event mode and category — we will organize the required information for you.',
    stage1: {
      title: 'Great! You chose {type} on {runMode}!',
      description: 'Now fill in the form based on this information...',
      updated_form_advice: 'eHub regularly updates category forms based on user suggestions. This form was last updated on {date}.'
    }
  }
}
