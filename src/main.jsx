import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CartProvider } from './context/CartContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { ProductsProvider } from './context/ProductsContext'
import { SponsoredProvider } from './context/SponsoredContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <ProductsProvider>
          <SponsoredProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </SponsoredProvider>
        </ProductsProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
