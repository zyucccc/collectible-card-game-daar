import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css';

const node = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(node)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
