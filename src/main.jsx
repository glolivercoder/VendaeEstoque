import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/shipping.css'
import App from './App.jsx'
import { initTheme } from './initTheme'

// Inicializar o tema antes de renderizar a aplicação
initTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
