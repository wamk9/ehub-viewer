export default {
  updated: 'Last updated: {date}',
  contact: 'Questions or requests about your data:',
  privacy: {
    title: 'Privacy policy',
    intro: 'eHub is run by JohnJohn 3D (CNPJ 27.140.814/0001-88), the data controller. In plain language: which data eHub uses, why, who it is shared with and how to exercise your rights under the Brazilian General Data Protection Law (LGPD, Law 13,709/2018). Contact: {contact}.',
    sections: [
      {
        title: 'What we collect',
        items: [
          'Account: first and last name, e-mail, username, password (stored only as a secure hash) and, if you want, phone and photo.',
          'Profile (optional): bio, city, birth date, social links, profile colour and notification preferences.',
          'Registrations: the events you join, your answers to the organizer\'s form, payment status and your results.',
          'Teams and organizations you belong to, follow or applied to.',
          'Technical usage: IP address and access records kept by the server for security and to comply with Brazilian law (Marco Civil da Internet).',
          'We do not collect card data: payments happen directly at Stripe or Mercado Pago.',
        ],
      },
      {
        title: 'Why we use it',
        items: [
          'To create and keep your account, sign you in and recover your password (performance of contract).',
          'To register you for events, process payments and show standings and results (performance of contract).',
          'To send notices about your registrations, teams and organizations (performance of contract; choose them in your profile).',
          'To prevent fraud and abuse, such as limiting login attempts (legitimate interest).',
          'To meet legal and tax obligations, such as invoices issued to organizations.',
          'We do not sell your data and we do not use advertising or tracking tools.',
        ],
      },
      {
        title: 'What is public and what organizers see',
        items: [
          'Your profile is public by default. Change it to "Followers" or "Private" in Profile > Privacy. People\'s profiles are not shown on Google.',
          'In events, other people see your name, username and results in the participant list and standings.',
          'The event organizer sees your registration, your answers to their form and payment status. They do not see your e-mail, phone or password.',
          'Event, organization, team and news pages are public and may appear in search engines.',
        ],
      },
      {
        title: 'Who we share it with',
        items: [
          'Stripe and Mercado Pago: to process registration payments and refunds.',
          'Google: only if you choose to sign in with Google (we receive name, e-mail and photo).',
          'Mailtrap: delivers eHub e-mails (codes, notices and invitations).',
          'Umbler: hosting of servers and database, in Brazil.',
          'Bling: invoices for organization subscriptions (organization tax data).',
          'Some of these services may process data outside Brazil; we use providers that offer protection compatible with the LGPD.',
        ],
      },
      {
        title: 'Cookies and browser storage',
        items: [
          'We only use necessary cookies: login session, request-forgery protection (CSRF) and "remember me".',
          'Your browser keeps your language, light/dark theme and form drafts for convenience.',
          'Fonts and libraries are loaded from public services (Google Fonts, jsDelivr and jQuery CDN), which receive your browser IP address.',
        ],
      },
      {
        title: 'How long we keep it',
        items: [
          'Account data: while the account exists. When you delete it we erase your profile, photos, registration answers, notifications and teams where you were the only member. Your registrations and results become anonymous ("Removed participant") so other people\'s standings do not change.',
          'Payment and organization billing records: for the period required by tax law.',
          'Access records: 6 months, as required by the Marco Civil da Internet.',
          'Codes sent by e-mail: 10 to 15 minutes.',
        ],
      },
      {
        title: 'Your rights and how to use them',
        items: [
          'See and download your data: Profile > Privacy > "Download my data".',
          'Correct your data: edit your profile at any time.',
          'Delete your account: Profile > Account > "Delete account". If you are the only owner of an organization or the only manager of a team with other members, transfer it first.',
          'Change your choices: profile visibility and notifications at any time.',
          'For the other rights (sharing information, objection, review), write to {contact}. You may also complain to the ANPD (Brazilian data protection authority).',
        ],
      },
      {
        title: 'Security',
        items: [
          'Always encrypted connection (HTTPS), strongly hashed passwords, login attempt limits and role-based access in organizations.',
          'If an incident could put you at risk, we will tell you and the ANPD.',
        ],
      },
      {
        title: 'Minors',
        items: [
          'People under 18 must use eHub with permission and supervision of a legal guardian. Children under 12 may only have accounts created and managed by the guardian.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of use',
    intro: 'These rules apply to everyone who uses eHub to organize or take part in competitions. By creating an account you agree to them. Contact: {contact}.',
    sections: [
      {
        title: 'What eHub is',
        items: [
          'A platform for organizations to create events and championships, take registrations (free or paid) and publish results, and for participants to sign up and follow them.',
          'eHub provides the tool; each event is the responsibility of the organization that created it (rules, prizes, running it and support).',
        ],
      },
      {
        title: 'Your account',
        items: [
          'Use true information and keep your password secret. You are responsible for what is done with your account.',
          'One person per account. People under 18 need a guardian\'s permission.',
          'We may suspend accounts used for fraud, harassment, spam or that break the law.',
        ],
      },
      {
        title: 'Registrations and payments',
        items: [
          'The price, deadline and rules of each registration are set by the organizer and shown before you confirm.',
          'Payments are processed by Stripe or Mercado Pago, into the organizer\'s account.',
          'Cancellation: if the organizer allows it, you can cancel until the event starts and the money goes back to the same payment method. After that, the organizer\'s policy applies.',
          'If the organizer cancels the event, they are responsible for refunding what was paid.',
        ],
      },
      {
        title: 'For organizations',
        items: [
          'You must be authorized to represent the organization and to run the events you publish.',
          'Use participants\' data only to run the event. Do not copy it for other purposes or share it.',
          'eHub fees and plan are on the Pricing page. The monthly charge goes to the saved card; without payment, new registrations may be blocked.',
          'You are responsible for the content you publish (descriptions, news, rules, images).',
        ],
      },
      {
        title: 'Content and conduct',
        items: [
          'Do not publish illegal, offensive, discriminatory or misleading content, or content that violates other people\'s rights.',
          'When you publish texts and images, you allow eHub to display them on the platform and in share previews.',
          'Do not try to bypass security, access other people\'s data or overload the service.',
        ],
      },
      {
        title: 'Liability and changes',
        items: [
          'We work to keep eHub available, but there may be interruptions for maintenance or third-party failures.',
          'We may update these terms; important changes will be announced on the site or by e-mail.',
          'Brazilian law applies.',
        ],
      },
    ],
  },
}
