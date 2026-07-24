import { useEffect, useState } from "react"

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches
    || window.navigator.standalone === true
}

export default function InstallPWAButton({ onInstalled }) {
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    if (isStandalone()) return undefined

    const guardarPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    const marcarInstalada = () => {
      setInstallPrompt(null)
      onInstalled?.()
    }

    window.addEventListener("beforeinstallprompt", guardarPrompt)
    window.addEventListener("appinstalled", marcarInstalada)
    return () => {
      window.removeEventListener("beforeinstallprompt", guardarPrompt)
      window.removeEventListener("appinstalled", marcarInstalada)
    }
  }, [onInstalled])

  if (!installPrompt) return null

  const instalar = async () => {
    await installPrompt.prompt()
    const resultado = await installPrompt.userChoice
    if (resultado.outcome === "accepted") {
      setInstallPrompt(null)
      onInstalled?.()
    }
  }

  return (
    <button
      type="button"
      className="sidebar_link pwa-install-button"
      onClick={instalar}
      title="Instalar Programa VMC"
    >
      <span className="sidebar_link-icon">
        <i className="fas fa-download" aria-hidden="true"></i>
      </span>
      <span className="sidebar_link-text">
        <span>Instalar aplicación</span>
      </span>
    </button>
  )
}
