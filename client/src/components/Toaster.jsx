import { useEffect, useState } from 'react'

export function Toaster() {
  const [message, setMessage] = useState(null)
  useEffect(() => {
    const handler = (e) => setMessage(e.detail)
    window.addEventListener('toast', handler)
    const timer = setInterval(() => setMessage(null), 3000)
    return () => { window.removeEventListener('toast', handler); clearInterval(timer) }
  }, [])
  if (!message) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md bg-black text-white/90 shadow-lg">
      {message}
    </div>
  )
}

export function toast(msg) {
  window.dispatchEvent(new CustomEvent('toast', { detail: msg }))
}


