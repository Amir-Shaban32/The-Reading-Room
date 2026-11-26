import { books } from '@/data/books'
import { elsewhere, profile } from '@/data/profile'
import { useRecommend } from './recommend-sheet'

export function About() {
  const recommend = useRecommend()
  const read = books.filter((book) => book.status === 'Read')
  const reading = books.filter((book) => book.status === 'Currently reading')
  const pagesRead = read.reduce((sum, book) => sum + book.pages, 0)

  const stats = [
    { value: books.length, label: 'Books on the shelf' },
    { value: read.length, label: 'Finished' },
    { value: reading.length, label: 'Reading now' },
    { value: pagesRead.toLocaleString(), label: 'Pages finished' },
  ]

  return (
    <article className="about">
      <header className="about-hero reveal">
        <div className="portrait">
          <img src={profile.portrait} alt={`Portrait of ${profile.name}`} width={160} height={160} />
        </div>
        <h1>{profile.name}</h1>
        <p className="about-role">{profile.role}</p>
      </header>

      <section className="about-intro reveal" aria-label="Introduction">
        {profile.bio.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <section className="stats reveal" aria-label="The shelf in numbers">
        {stats.map((stat) => (
          <div key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      {reading.length > 0 && (
        <section className="nightstand reveal" aria-labelledby="nightstand-title">
          <h2 id="nightstand-title">On the nightstand</h2>
          <ul>
            {reading.map((book) => (
              <li key={book.id}>
                <div className="nightstand-cover">
                  {book.coverImage && (
                    <img
                      src={book.coverImage}
                      alt=""
                      loading="lazy"
                      style={{ aspectRatio: book.coverRatio }}
                    />
                  )}
                </div>
                <strong>{book.title}</strong>
                <span>{book.author}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="about-why reveal" aria-labelledby="why-title">
        <h2 id="why-title">Why I share what I read</h2>
        <p>{profile.why}</p>
      </section>

      {profile.habits.length > 0 && (
        <section className="habits reveal" aria-labelledby="habits-title">
          <h2 id="habits-title">How I read</h2>
          <ol>
            {profile.habits.map((habit, index) => (
              <li key={index}>
                <span className="habit-number">{String(index + 1).padStart(2, '0')}</span>
                <h3>{habit.title}</h3>
                <p>{habit.body}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="elsewhere reveal" aria-labelledby="elsewhere-title">
        <h2 id="elsewhere-title">Elsewhere</h2>
        <ul>
          {elsewhere.map((link) => (
            <li key={link.label}>
              <span>{link.label}</span>
              <a href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                {link.handle}
                {link.href.startsWith('http') && <span aria-hidden="true"> ↗</span>}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <figure className="quote reveal">
        <blockquote>
          “Programs must be written for people to read, and only incidentally for machines to execute.”
        </blockquote>
        <figcaption>Harold Abelson &amp; Gerald Jay Sussman, <cite>Structure and Interpretation of Computer Programs</cite></figcaption>
      </figure>

      <section className="cta reveal">
        <h2>Have a book I should read?</h2>
        <p>I'm always happy to hear what belongs on the shelf.</p>
        <button type="button" className="button" onClick={() => recommend()}>
          Recommend a book
        </button>
      </section>
    </article>
  )
}
