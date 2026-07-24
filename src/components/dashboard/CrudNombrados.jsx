import { useMemo, useState } from "react"
import { useAtomValue } from "jotai"
import atoms from "../../jotai/atoms"
import NombradoCollapse from "./personas/NombradoCollapse"
import {
  TIPOS_ASIGNACION_NOMBRADO,
  puedePasarTipoNombrado,
} from "../../constants/tiposAsignacionNombrado"
import { parseDateValue } from "../../functions/programHelpers"

const OPCIONES_ORDEN = [
  { key: "nombre", label: "Nombre" },
  { key: "ultimaAsignacion", label: "Última asignación" },
  { key: "presidir", label: "Presidir" },
  { key: "salaAux", label: "Sala auxiliar" },
  { key: "tesoros", label: "Tesoros" },
  { key: "perlas", label: "Perlas" },
  { key: "analisis", label: "Análisis" },
  { key: "estudio", label: "Estudio" },
  { key: "necesidades", label: "Necesidades" },
]

function ultimaFechaDeRol(persona, rol) {
  const fechas = (persona?.ultimasAsignaciones?.[rol] || [])
    .map(parseDateValue)
    .filter(Boolean)

  return fechas.length
    ? new Date(Math.max(...fechas.map((fecha) => fecha.getTime())))
    : null
}

function ultimaFechaGeneral(persona) {
  const fechas = Object.values(persona?.ultimasAsignaciones || {})
    .flat()
    .map(parseDateValue)
    .filter(Boolean)
  const ultimaAsignacion = parseDateValue(persona?.ultimaAsignacion)

  if (ultimaAsignacion) fechas.push(ultimaAsignacion)
  return fechas.length
    ? new Date(Math.max(...fechas.map((fecha) => fecha.getTime())))
    : null
}

function valorDeOrden(persona, key) {
  if (key === "nombre") return persona.nombre || ""
  if (key === "ultimaAsignacion") return ultimaFechaGeneral(persona)
  return ultimaFechaDeRol(persona, key)
}

function compararValores(a, b) {
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  return String(a).localeCompare(String(b), "es", { numeric: true, sensitivity: "base" })
}

export default function CrudNombrados({
  agregarNombrado,
  tipoAsignacionPermitida = null,
  opcionesExtra = [],
}) {
  const nombrados = useAtomValue(atoms.nombrados)
  const [filtros, setFiltros] = useState({
    nombramiento: "todos",
    tipoAsignacion: "todos",
  })
  const [orden, setOrden] = useState([])

  const cambiarFiltro = (key, value) => {
    setFiltros((actuales) => ({ ...actuales, [key]: value }))
  }

  const limpiarFiltros = () => {
    setFiltros({
      nombramiento: "todos",
      tipoAsignacion: "todos",
    })
  }

  const cambiarOrden = (key) => {
    setOrden((actual) => {
      const indice = actual.findIndex((nivel) => nivel.key === key)
      if (indice === -1) return [...actual, { key, direction: "asc" }]

      if (actual[indice].direction === "asc") {
        return actual.map((nivel, index) => (
          index === indice ? { ...nivel, direction: "desc" } : nivel
        ))
      }

      return actual.filter((_, index) => index !== indice)
    })
  }

  const nombradosFiltrados = useMemo(() => {
    return [...opcionesExtra, ...(nombrados || [])]
      .filter((nombrado) => puedePasarTipoNombrado(nombrado, tipoAsignacionPermitida))
      .filter((nombrado) => (
        filtros.nombramiento === "todos"
        || nombrado.nombramiento === filtros.nombramiento
      ))
      .filter((nombrado) => (
        filtros.tipoAsignacion === "todos"
        || puedePasarTipoNombrado(nombrado, filtros.tipoAsignacion)
      ))
      .map((nombrado, index) => ({ nombrado, index }))
      .sort((a, b) => {
        for (const nivel of orden) {
          const valorA = valorDeOrden(a.nombrado, nivel.key)
          const valorB = valorDeOrden(b.nombrado, nivel.key)
          const vacioA = valorA == null || valorA === ""
          const vacioB = valorB == null || valorB === ""

          if (vacioA !== vacioB) return vacioA ? 1 : -1
          if (vacioA) continue

          const comparacion = compararValores(valorA, valorB)
          if (comparacion !== 0) {
            return comparacion * (nivel.direction === "asc" ? 1 : -1)
          }
        }

        return a.index - b.index
      })
      .map(({ nombrado }) => nombrado)
  }, [
    filtros,
    nombrados,
    opcionesExtra,
    orden,
    tipoAsignacionPermitida,
  ])

  return (
    <div className="space-y-4 min-w-0">
      <div className="rounded-xl bg-gray-100 px-3 sm:px-4 py-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <div className="flex flex-col min-w-0">
            <label className="text-xs mb-0" htmlFor="filtro-nombramiento">
              Nombramiento
            </label>
            <select
              id="filtro-nombramiento"
              className="px-2 py-2 border border-gray-300 rounded-full w-full"
              value={filtros.nombramiento}
              onChange={(event) => cambiarFiltro("nombramiento", event.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="a">Ancianos</option>
              <option value="sm">Siervos ministeriales</option>
            </select>
          </div>

          <div className="flex flex-col min-w-0">
            <label className="text-xs mb-0" htmlFor="filtro-tipo-nombrado">
              Puede pasar
            </label>
            <select
              id="filtro-tipo-nombrado"
              className="px-2 py-2 border border-gray-300 rounded-full w-full"
              value={filtros.tipoAsignacion}
              onChange={(event) => cambiarFiltro("tipoAsignacion", event.target.value)}
            >
              <option value="todos">Cualquier asignación</option>
              {TIPOS_ASIGNACION_NOMBRADO.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>{tipo.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              className="text-xs bg-purple-500 cursor-pointer text-white px-4 py-2 rounded-full w-full"
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-300 pt-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-700">Ordenar por prioridad</p>
              <p className="text-[11px] text-gray-500">
                Selecciona primero “Última asignación” y después las demás.
              </p>
            </div>
            {orden.length > 0 && (
              <button
                type="button"
                className="text-xs font-semibold text-purple-700 hover:text-purple-900"
                onClick={() => setOrden([])}
              >
                Restablecer orden
              </button>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {OPCIONES_ORDEN.map((opcion) => {
              const prioridad = orden.findIndex((nivel) => nivel.key === opcion.key)
              const nivel = prioridad >= 0 ? orden[prioridad] : null

              return (
                <button
                  key={opcion.key}
                  type="button"
                  className={`min-h-9 rounded-lg border px-3 py-1.5 inline-flex items-center gap-2 text-xs font-semibold transition ${
                    nivel
                      ? "border-purple-500 bg-purple-500 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-purple-300 hover:text-purple-700"
                  }`}
                  onClick={() => cambiarOrden(opcion.key)}
                  title="Clic: ascendente, descendente o quitar del orden"
                >
                  {nivel && (
                    <span className="h-5 w-5 rounded-full bg-white text-purple-700 inline-grid place-items-center text-[10px]">
                      {prioridad + 1}
                    </span>
                  )}
                  <span>{opcion.label}</span>
                  <i
                    className={`fas ${
                      nivel
                        ? nivel.direction === "asc" ? "fa-arrow-up" : "fa-arrow-down"
                        : "fa-sort"
                    }`}
                    aria-hidden="true"
                  ></i>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl flex flex-col gap-2">
        {nombradosFiltrados.map((nombrado) => (
          <NombradoCollapse
            nombrado={nombrado}
            key={nombrado.id}
            onAdd={agregarNombrado}
          />
        ))}
        {nombradosFiltrados.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No se encontraron resultados con los filtros aplicados
          </div>
        )}
      </div>
    </div>
  )
}
