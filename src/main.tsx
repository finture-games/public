import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'
import { useGameStore } from './store/game'

const CURRENT_VERSION = '20261003_v13'
const lastVersion = localStorage.getItem('finture_app_ver')

if (lastVersion !== CURRENT_VERSION) {
  localStorage.setItem('finture_app_ver', CURRENT_VERSION)
  if (typeof window !== 'undefined') {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister()
        }
      })
    }
    if ('caches' in window) {
      caches.keys().then((names) => {
        Promise.all(names.map((name) => caches.delete(name))).then(() => {
          window.location.reload()
        }).catch(() => {
          window.location.reload()
        })
      })
    }
  }
}

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true)
    setTimeout(() => {
      window.location.reload()
    }, 500)
  },
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      setInterval(() => {
        void registration.update()
      }, 10 * 60 * 1000)
    }
  },
})

// akses debug/tes untuk Alur Pengguna
;(window as unknown as { __finture: typeof useGameStore }).__finture = useGameStore

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
