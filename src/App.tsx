import { About } from './components/about'
import { Library } from './components/library'
import { RecommendProvider, useRecommend } from './components/recommend-sheet'
import { profile } from './data/profile'
import { useRoute } from './lib/router'
import './App.css'

const year = new Date().getFullYear()

function App() {
  const route = useRoute()

  return (
    <RecommendProvider>
      <header className="nav">
        <div className="nav-inner">
          <a className="brand" href="#/" aria-label="The Reading Room, home">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 5.5c3-1.2 6-1 10 1 4-2 7-2.2 10-1v13c-3-1.2-6-1-10 1-4-2-7-2.2-10-1z" />
              <path d="M12 6.5v13" />
            </svg>
            The Reading Room
          </a>
          <nav aria-label="Main">
            <a href="#/" aria-current={route === 'home' ? 'page' : undefined}>Library</a>
            <a href="#/about" aria-current={route === 'about' ? 'page' : undefined}>About</a>
          </nav>
        </div>
      </header>

      <main className="page" key={route}>
        {route === 'about' ? <About /> : <Home />}
      </main>

      <footer className="footer">
        <span>The Reading Room</span>
        <span>© {year} {profile.name}</span>
      </footer>
    </RecommendProvider>
  )
}

function Home() {
  const recommend = useRecommend()
  return (
    <>
      <section className="hero">
        <h1>
          A little room for
          <br />a lot of <span className="accent">stories.</span>
        </h1>
        <p>A home for the books I've read, the ones I'm reading now, and the stories worth sharing.</p>
      </section>

      <Library />

      <section className="cta reveal">
        <h2>Have a book I should read?</h2>
        <p>I'm always happy to hear what belongs on the shelf.</p>
        <button type="button" className="button" onClick={() => recommend()}>
          Recommend a book
        </button>
      </section>

      <figure className="quote reveal">
        <blockquote>“A reader lives a thousand lives before he dies. The man who never reads lives only one.”</blockquote>
        <figcaption>George R. R. Martin, <cite>A Dance with Dragons</cite></figcaption>
      </figure>
    </>
  )
}

export default App
