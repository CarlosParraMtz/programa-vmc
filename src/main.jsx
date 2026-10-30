import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/styles.css'
import './styles/styles.scss'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'jotai'
import { initializeTheme, ThemeProvider } from './contexts/ThemeContext.jsx'

initializeTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
)
