import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { LandingPage } from './LandingPage'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <LandingPage />
  </StrictMode>,
)
