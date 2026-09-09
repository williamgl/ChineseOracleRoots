import { useState } from 'react'
import ToolView from './views/ToolView.jsx'
import ExperimentView from './views/ExperimentView.jsx'
import AboutView from './views/AboutView.jsx'

export default function App() {
  const [tab, setTab] = useState('tool')

  return (
    <div className="app">
      <header className="site">
        <h1>甲骨文 · ChineseOracleRoots</h1>
        <p>Learn Chinese characters through their oracle bone origins</p>
      </header>

      <nav className="tabs">
        <button
          className={tab === 'tool' ? 'active' : ''}
          onClick={() => setTab('tool')}
        >
          Explore
        </button>
        <button
          className={tab === 'experiment' ? 'active' : ''}
          onClick={() => setTab('experiment')}
        >
          Learning Study
        </button>
        <button
          className={tab === 'about' ? 'active' : ''}
          onClick={() => setTab('about')}
        >
          About
        </button>
      </nav>

      {tab === 'tool' && <ToolView />}
      {tab === 'experiment' && <ExperimentView />}
      {tab === 'about' && <AboutView />}

      <footer className="site">
        <p>
          Oracle bone images: HUST-OBC dataset (Wang et al., 2024, CC BY 4.0). English
          glosses adapted from CC-CEDICT (CC BY-SA 3.0). Built for a cognitive science
          project on pictographic origins and memory.
        </p>
        <p>
          Created by <strong>Gan Li</strong> ·{' '}
          <a
            href="https://github.com/williamgl/ChineseOracleRoots"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/williamgl/ChineseOracleRoots
          </a>
        </p>
      </footer>
    </div>
  )
}
