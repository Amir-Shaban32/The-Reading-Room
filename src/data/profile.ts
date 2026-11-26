/** Everything personal on the site lives here. */

export const profile = {
  name: 'Amir Shaban',
  firstName: 'Amir',

  portrait: '/my_photo/Amir.jpeg',

  role: 'Software engineer · Cairo, Egypt',

  bio: [
    'A software engineer who loves to learn, understand, and write code. I build backend and DevOps systems, and I like knowing how things work underneath.',
  ],

  why: "This is my reading shelf: a record of the books I've finished and the ones keeping me company now. If a story here speaks to you, or you have one I should read next, I'd love to hear about it.",

  // Delete this array to hide the "How I read" section.
  habits: [
    { title: 'Slow finisher', body: 'I would rather finish one book properly than start five. I sit with the last pages for a while.' },
    { title: 'Looking for a voice', body: 'I keep reading a book when it feels like someone is talking to me, not teaching me.' },
    {
      title: 'Following my curiosity',
      body: 'I don’t stick to one kind of book. I enjoy exploring different subjects and picking up whatever catches my attention.',
    },
  ],
}

export const contact = {
  email: 'amirshaban973@gmail.com',
  phone: '+201140124012',
  xUsername: 'AmirShaban32',
}

export const elsewhere = [
  { label: 'X', href: `https://x.com/${contact.xUsername}`, handle: `@${contact.xUsername}` },
  { label: 'Email', href: `mailto:${contact.email}`, handle: contact.email },
  { label: 'GitHub', href: 'https://github.com/Amir-Shaban32', handle: 'Amir ShabaNode' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/as-amir-shaban/', handle: 'Amir Shaban' },
  { label: 'CodeForces', href: 'https://codeforces.com/profile/AmirShaban', handle: 'AmirShaban' },
]

