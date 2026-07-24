import { useMemo, useState } from "react"
import { useAtomValue } from "jotai"
import toast from "react-hot-toast"
import atoms from "../../../jotai/atoms"
import Modal from "../../common/Modal"
import matriculadosController from "../../../firebase/controllers/matriculados.controller"
import nombradosController from "../../../firebase/controllers/nombrados.controller"
import { getLastPrayerDate, sortPrayerCandidates } from "../../../functions/programHelpers"

const formatoFecha = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function prepararPersona(persona, tipoPersona) {
  return { ...persona, tipoPersona }
}

export default function Oraciones() {
  const congregacion = useAtomValue(atoms.congregacion)
  const matriculados = useAtomValue(atoms.matriculados)
  const nombrados = useAtomValue(atoms.nombrados)
  const [abierta, setAbierta] = useState(true)
  const [modalAgregar, setModalAgregar] = useState(false)
  const [guardando, setGuardando] = useState(null)

  const todasLasPersonas = useMemo(() => [
    ...(nombrados || []).map((persona) => prepararPersona(persona, "nombrado")),
    ...(matriculados || []).map((persona) => prepararPersona(persona, "matriculado")),
  ], [matriculados, nombrados])

  const personasOracion = useMemo(
    () => sortPrayerCandidates(todasLasPersonas.filter((persona) => persona.puedeOrar)),
    [todasLasPersonas],
  )

  const candidatosDisponibles = useMemo(
    () => todasLasPersonas
      .filter((persona) => !persona.puedeOrar)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
    [todasLasPersonas],
  )

  const actualizarElegibilidad = async (persona, puedeOrar) => {
    if (!congregacion) return
    const key = `${persona.tipoPersona}-${persona.id}`
    setGuardando(key)
    try {
      const controller = persona.tipoPersona === "nombrado"
        ? nombradosController
        : matriculadosController
      const update = persona.tipoPersona === "nombrado"
        ? controller.updateNombrado
        : controller.updateMatriculado
      await update({ puedeOrar }, congregacion.id, persona.id)
      toast.success(puedeOrar
        ? `${persona.nombre} se agregó a la lista de oración`
        : `${persona.nombre} se retiró de la lista de oración`
      )
    } catch (error) {
      console.error(error)
      toast.error("No se pudo actualizar la lista de oración")
    } finally {
      setGuardando(null)
    }
  }

  return (
    <>
      <section className={`prayer-list-card ${abierta ? "" : "prayer-list-card--collapsed"}`}>
        <div className="prayer-list-card__header">
          <button
            type="button"
            className="prayer-list-card__toggle"
            onClick={() => setAbierta((actual) => !actual)}
            aria-expanded={abierta}
            aria-controls="lista-oracion-contenido"
          >
            <i className={`fas fa-chevron-${abierta ? "down" : "right"}`} aria-hidden="true"></i>
            <span>
              <strong>Oración final</strong>
              <small>Ordenados de quien lleva más tiempo sin orar al más reciente.</small>
            </span>
          </button>
          <div className="prayer-list-card__actions">
            <span>{personasOracion.length} personas</span>
            <button
              type="button"
              className="icon-button"
              onClick={() => setModalAgregar(true)}
              aria-label="Agregar persona a oración final"
              title="Agregar desde nombrados o matriculados"
            >
              <i className="fas fa-add" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        {abierta &&
          <div id="lista-oracion-contenido" className="prayer-list-card__content">
            {personasOracion.length > 0
              ? <ol className="prayer-list">
                {personasOracion.map((persona, index) => {
                  const fecha = getLastPrayerDate(persona)
                  const key = `${persona.tipoPersona}-${persona.id}`
                  return (
                    <li key={key}>
                      <span className="prayer-list__position">{index + 1}</span>
                      <span className="prayer-list__person">
                        <strong>{persona.nombre}</strong>
                        <small>
                          {persona.tipoPersona === "nombrado" ? "Nombrado" : "Matriculado"}
                          {" · "}
                          {fecha ? `Última oración: ${formatoFecha.format(fecha)}` : "Sin oraciones registradas"}
                        </small>
                      </span>
                      <button
                        type="button"
                        onClick={() => actualizarElegibilidad(persona, false)}
                        disabled={guardando === key}
                        aria-label={`Retirar a ${persona.nombre} de la lista de oración`}
                        title="Retirar de la lista"
                      >
                        <i className="fas fa-xmark" aria-hidden="true"></i>
                      </button>
                    </li>
                  )
                })}
              </ol>
              : <div className="prayer-list-card__empty">
                <i className="fas fa-hands-praying" aria-hidden="true"></i>
                <p>Aún no hay personas en la lista de oración final.</p>
                <button type="button" className="btn main" onClick={() => setModalAgregar(true)}>
                  Agregar personas
                </button>
              </div>
            }
          </div>
        }
      </section>

      <Modal
        id="agregar-personas-oracion"
        title="Agregar a la lista de oración"
        open={modalAgregar}
        onClose={() => setModalAgregar(false)}
        size="xl2"
      >
        <p className="mb-4 text-sm text-gray-600">
          Selecciona personas de Nombrados o Matriculados. La lista se ordenará automáticamente por la fecha de su última oración.
        </p>
        {candidatosDisponibles.length > 0
          ? <div className="prayer-candidate-list">
            {candidatosDisponibles.map((persona) => {
              const key = `${persona.tipoPersona}-${persona.id}`
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => actualizarElegibilidad(persona, true)}
                  disabled={guardando === key}
                >
                  <span>
                    <strong>{persona.nombre}</strong>
                    <small>{persona.tipoPersona === "nombrado" ? "Nombrado" : "Matriculado"}</small>
                  </span>
                  <i className="fas fa-plus" aria-hidden="true"></i>
                </button>
              )
            })}
          </div>
          : <p className="rounded-lg bg-purple-50 p-5 text-center text-gray-600">
            Todas las personas ya están agregadas.
          </p>
        }
      </Modal>
    </>
  )
}
