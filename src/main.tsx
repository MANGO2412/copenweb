import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from "react-router"
import {SerialProvider} from "@/context/serial-context.tsx"
import {AuthProvider} from "@/context/auth-context.tsx"
import App from './App.tsx'

import './i18n.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SerialProvider>
         <AuthProvider>
              <App />
         </AuthProvider>
      </SerialProvider>
    </BrowserRouter>
  </StrictMode>,
)