import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import UserContext from './context/UserContext.jsx'
import CaptainContext from './context/CaptainContext.jsx'
import SocketContext from './context/SocketContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SocketContext>
      <UserContext>
        <CaptainContext>
          <BrowserRouter>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <App />
            </GoogleOAuthProvider>
          </BrowserRouter>
        </CaptainContext>
      </UserContext>
    </SocketContext>
  </StrictMode>,
)
