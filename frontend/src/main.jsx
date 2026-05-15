import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet"></link>

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App style={{
      minHeight: "100vh",
      background: "#0D0D0D",
      color: "#E8E0D0",
      paddingBottom: 70
    }}/>
  </StrictMode>,
)
