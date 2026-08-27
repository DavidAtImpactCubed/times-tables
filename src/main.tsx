import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { registerOffline } from './logic/offline'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Installs the worker that lets the game play with no signal; a no-op in dev
// and on browsers without service workers.
registerOffline()
