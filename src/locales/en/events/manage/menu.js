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
  news: {
    title: 'Event news',
    description: 'Publish information and updates for event participants.',
    manage: {
      title: 'Event news',
      back: 'Back',
      back_to_articles: 'Back to articles',
      new_article: 'New article',
      edit_article: 'Edit article',
      article_plural: 'articles',
      article_singular: 'article',
      empty: 'No articles published yet.',
      create_first: 'Create first article',
      no_permission: 'You do not have permission to publish articles.',
      published: 'Published',
      draft: 'Draft',
      by: 'By',
      cover_label: 'Cover image',
      cover_hint: 'Click to select an image',
      title_placeholder: 'Article title',
      excerpt_placeholder: 'Short summary (optional)',
      excerpt_chars: 'characters',
      title_required: 'Title is required.',
      save_draft: 'Save draft',
      publish: 'Publish',
      cancel: 'Cancel',
      save_error: 'Error saving. Please try again.',
      delete: {
        title: 'Delete article',
        confirm: 'will be permanently deleted.',
        cancel: 'Cancel',
        btn: 'Delete',
      },
    },
  },
  participants: {
    title: 'Event participants',
    description: 'See all confirmed participants for your event.',
    manage: {
      total: '{n} registration(s)',
      confirmed: 'Confirmed',
      free: 'Free',
      pending: 'Awaiting payment',
      empty: 'No registrations yet.',
      registered_at: 'Registered at',
      gateway_label: 'Gateway',
      form_data_label: 'Additional data',
    },
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
