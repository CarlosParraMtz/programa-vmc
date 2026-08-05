import { useEffect, useState } from "react"
import { isPwaStandalone } from "../../functions/pwaPublicProgram"

let deferredInstallPrompt = null
const promptSubscribers = new Set()

function notifyPromptSubscribers() {
  promptSubscribers.forEach((notify) => notify(deferredInstallPrompt))
}

export default function InstallPWAButton({ onInstalled, onUnavailable, variant = "sidebar" }) {
  const [installPrompt, setInstallPrompt] = useState(deferredInstallPrompt)
  const [isInstalled, setIsInstalled] = useState(isPwaStandalone)

  useEffect(() => {
    if (isPwaStandalone()) return undefined

    const syncPrompt = (prompt) => setInstallPrompt(prompt)
    const guardarPrompt = (event) => {
      event.preventDefault()
      deferredInstallPrompt = event
      notifyPromptSubscribers()
    }
    const marcarInstalada = () => {
      deferredInstallPrompt = null
      notifyPromptSubscribers()
      setIsInstalled(true)
      onInstalled?.()
    }

    promptSubscribers.add(syncPrompt)
    syncPrompt(deferredInstallPrompt)
    window.addEventListener("beforeinstallprompt", guardarPrompt)
    window.addEventListener("appinstalled", marcarInstalada)
    return () => {
      promptSubscribers.delete(syncPrompt)
      window.removeEventListener("beforeinstallprompt", guardarPrompt)
      window.removeEventListener("appinstalled", marcarInstalada)
    }
  }, [onInstalled])

  const isDesktopApp = Boolean(window.desktopAPI?.isDesktop)
  if (isDesktopApp || isInstalled || (!installPrompt && variant !== "public")) return null

  const instalar = async () => {
    if (!installPrompt) {
      onUnavailable?.()
      return
    }

    await installPrompt.prompt()
    const resultado = await installPrompt.userChoice
    if (resultado.outcome === "accepted") {
      deferredInstallPrompt = null
      notifyPromptSubscribers()
      setIsInstalled(true)
      onInstalled?.()
    }
  }

  if (variant === "config") {
    return (
      <button
        type="button"
        className="btn main inline-flex items-center justify-center gap-2"
        onClick={instalar}
      >
        <i className="fas fa-mobile-screen-button" aria-hidden="true"></i>
        Instalar en mi teléfono
      </button>
    )
  }

  if (variant === "public") {
    return (
      <button
        type="button"
        className="btn main"
        onClick={instalar}
      >
        <i className="fas fa-mobile-screen-button" aria-hidden="true"></i>
        <span>Instalar app</span>
      </button>
    )
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
