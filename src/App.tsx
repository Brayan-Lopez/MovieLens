import './App.css'
import { HeroHighlight } from './components/HeroHighlight'
import { TrendingRow } from './components/TrendingRow'
import { FeaturedMovies } from './components/FeaturedMovies'
import { MoviesExplorer } from './components/MoviesExplorer'

function App() {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <header className="sticky top-0 z-50 bg-neutral-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 h-[88px] sm:h-[96px] py-0 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <img src="/movielens.svg" alt="MovieLens" className="h-10 w-10 sm:h-20 sm:w-20 min-h-[55px] min-w-[55px]" />
            <h1 className="m-0 text-[1.5rem] sm:text-[2rem] lg:text-[2.5rem] leading-[1.2] font-semibold tracking-tight text-white">MovieLens</h1>
          </div>
          <div className="hidden sm:block text-xs sm:text-sm text-neutral-300">
            Explora los detalles de tus películas y series favoritas
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 pt-0 pb-6 space-y-10">
        <section>
          <HeroHighlight />
        </section>

        <section>
          <TrendingRow />
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Explorar catálogo</h2>
          <MoviesExplorer />
        </section>

        <section>
          {/* Eliminado subtítulo de 'Películas destacadas' */}
          <FeaturedMovies />
        </section>
      </main>

      <footer className="mt-8 border-t border-neutral-800">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-6 flex items-center justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <a href="/" aria-label="Ir al inicio" className="flex items-center gap-3 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-neutral-500 rounded">
              <img src="/movielens.svg" alt="MovieLens" className="w-6 h-6 min-h-[55px] min-w-[55px]" />
              <span className="text-sm text-neutral-300">MovieLens</span>
            </a>
            <span className="text-xs text-neutral-400">Explora los detalles de tus películas y series favoritas</span>
          </div>
          <span className="text-xs text-neutral-500">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}

export default App
