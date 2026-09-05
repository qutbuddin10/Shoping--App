import {BrowserRouter} from "react-router-dom"
import { createRoot } from 'react-dom/client'
import {GoogleOAuthProvider} from "@react-oauth/google"
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="916796302479-qnoocdhcklebt40ajm7sjv06eehol1r2.apps.googleusercontent.com">
    <BrowserRouter>

    <App />

    </BrowserRouter>
</GoogleOAuthProvider>
)
