import { useState } from 'react'
import ToolView from './views/ToolView.jsx'
import ExperimentView from './views/ExperimentView.jsx'

export default function App() {
  const [tab, setTab] = useState('tool')

  return (
    <div className="app">
      <header className="site">
        <h1>甲骨文 · Oracle Bone Script Explorer</h1>
        <p>See how ancient pictographs became modern Chinese characters and kanji</p>
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
      </nav>

      {tab === 'tool' ? <ToolView /> : <ExperimentView />}

      <footer className="site">
        Oracle bone images: HUST-OBC dataset (Wang et al., 2024, CC BY 4.0). English
        glosses adapted from CC-CEDICT (CC BY-SA 3.0). Built for a cognitive science
        project on pictographic origins and memory.
      </footer>
    </div>
  )
}
