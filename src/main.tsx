import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App'
import { AppProvider } from './store/AppContext'
import './index.css'

// A preview published beside the main site routes with the hash: github pages only falls back to the main site's 404.
const routed = (app: React.ReactNode) =>
  import.meta.env.VITE_HASH_ROUTER ? <HashRouter>{app}</HashRouter> : <BrowserRouter basename={import.meta.env.BASE_URL}>{app}</BrowserRouter>

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {routed(
      <AppProvider>
        <App />
      </AppProvider>,
    )}
  </React.StrictMode>,
)
