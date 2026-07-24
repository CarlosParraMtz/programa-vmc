import { useEffect, useMemo, useRef, useState } from "react"
import { useAtomValue } from "jotai"
import Matriculados from "../../components/dashboard/personas/Matriculados"
import Nombrados from "../../components/dashboard/personas/Nombrados"
import Oraciones from "../../components/dashboard/personas/Oraciones"
import atoms from "../../jotai/atoms"
import { getStudentHistory, parseDateValue } from "../../functions/programHelpers"
import {
  getTiposAsignacionLabels,
  TIPOS_ASIGNACION_MATRICULADO,
} from "../../constants/tiposAsignacionMatriculado"
import {
  getTiposAsignacionNombradoLabels,
  TIPOS_ASIGNACION_NOMBRADO,
} from "../../constants/tiposAsignacionNombrado"
import { nombramientos } from "../../constants/nombramientos"

const formatoFecha = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function mostrarFecha(value) {
  const fecha = value instanceof Date ? value : parseDateValue(value)
  return fecha ? formatoFecha.format(fecha) : "—"
}

function ultimaFechaDeRol(persona, rol) {
  const fechas = (persona?.ultimasAsignaciones?.[rol] || [])
    .map(parseDateValue)
    .filter(Boolean)

  return fechas.length
    ? new Date(Math.max(...fechas.map((fecha) => fecha.getTime())))
    : null
}

function ultimaFechaNombrado(persona) {
  const fechasPorRol = Object.values(persona?.ultimasAsignaciones || {})
    .flat()
    .map(parseDateValue)
    .filter(Boolean)
  const ultimaGeneral = parseDateValue(persona?.ultimaAsignacion)

  if (ultimaGeneral) fechasPorRol.push(ultimaGeneral)
  return fechasPorRol.length
    ? new Date(Math.max(...fechasPorRol.map((fecha) => fecha.getTime())))
    : null
}

function compareValues(a, b) {
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === "number" && typeof b === "number") return a - b
  return String(a).localeCompare(String(b), "es", { numeric: true, sensitivity: "base" })
}

function isFilterActive(value) {
  if (Array.isArray(value)) return value.length > 0
  return value != null && value !== "todos"
}

function getDefaultVisibleColumns(columnas) {
  return columnas
    .filter((columna) => columna.defaultVisible !== false)
    .map((columna) => columna.key)
}

function TablaPersonas({ id, titulo, descripcion, personas = [], columnas, onAgregar }) {
  const [orden, setOrden] = useState([])
  const [abierta, setAbierta] = useState(true)
  const [configurandoColumnas, setConfigurandoColumnas] = useState(false)
  const [configurandoFiltros, setConfigurandoFiltros] = useState(false)
  const [filtros, setFiltros] = useState({})
  const [columnasVisibles, setColumnasVisibles] = useState(() => {
    const defaults = getDefaultVisibleColumns(columnas)
    if (typeof window === "undefined") return new Set(defaults)

    try {
      const saved = JSON.parse(window.localStorage.getItem(`personas-columnas-${id}`))
      if (!Array.isArray(saved)) return new Set(defaults)

      const validKeys = new Set(columnas.map((columna) => columna.key))
      const visible = saved.filter((key) => validKeys.has(key))
      columnas
        .filter((columna) => columna.alwaysVisible)
        .forEach((columna) => visible.push(columna.key))
      return new Set(visible)
    } catch {
      return new Set(defaults)
    }
  })
  const contenidoId = `${id}-contenido`
  const columnasId = `${id}-columnas`
  const filtrosId = `${id}-filtros`
  const columnasFiltrables = useMemo(
    () => columnas.filter((columna) => columna.filterOptions?.length),
    [columnas],
  )
  const filtrosActivos = Object.values(filtros).filter(isFilterActive).length
  const columnasMostradas = useMemo(
    () => columnas.filter((columna) => columnasVisibles.has(columna.key)),
    [columnas, columnasVisibles],
  )

  useEffect(() => {
    window.localStorage.setItem(
      `personas-columnas-${id}`,
      JSON.stringify(Array.from(columnasVisibles)),
    )
  }, [columnasVisibles, id])

  const filasOrdenadas = useMemo(() => {
    return personas
      .filter((persona) => (
        Object.entries(filtros).every(([key, selected]) => {
          if (!isFilterActive(selected)) return true
          const columna = columnas.find((item) => item.key === key)
          if (!columna) return true

          if (Array.isArray(selected)) {
            const values = columna.filterValues
              ? columna.filterValues(persona)
              : [columna.filterValue?.(persona)]
            const normalizedValues = values.map(String)
            return selected.some((value) => normalizedValues.includes(value))
          }

          const value = columna.filterValue
            ? columna.filterValue(persona)
            : columna.sortValue(persona)
          return String(value) === selected
        })
      ))
      .map((persona, index) => ({ persona, index }))
      .sort((a, b) => {
        for (const nivel of orden) {
          const columna = columnas.find((item) => item.key === nivel.key)
          if (!columna) continue

          const valorA = columna.sortValue(a.persona)
          const valorB = columna.sortValue(b.persona)
          const vacioA = valorA == null || valorA === ""
          const vacioB = valorB == null || valorB === ""

          if (vacioA !== vacioB) return vacioA ? 1 : -1

          const comparacion = vacioA ? 0 : compareValues(valorA, valorB)
          if (comparacion !== 0) {
            return comparacion * (nivel.direction === "asc" ? 1 : -1)
          }
        }

        return a.index - b.index
      })
      .map(({ persona }) => persona)
  }, [columnas, filtros, orden, personas])

  const cambiarOrden = (key) => {
    setOrden((actual) => {
      const indice = actual.findIndex((nivel) => nivel.key === key)
      if (indice === -1) return [...actual, { key, direction: "asc" }]

      const nivel = actual[indice]
      if (nivel.direction === "asc") {
        return actual.map((item, index) => (
          index === indice ? { ...item, direction: "desc" } : item
        ))
      }

      return actual.filter((_, index) => index !== indice)
    })
  }

  const cambiarVisibilidadColumna = (columna) => {
    if (columna.alwaysVisible) return

    const estabaVisible = columnasVisibles.has(columna.key)
    setColumnasVisibles((actuales) => {
      const siguientes = new Set(actuales)
      if (estabaVisible) siguientes.delete(columna.key)
      else siguientes.add(columna.key)
      return siguientes
    })
    if (estabaVisible) {
      setOrden((ordenActual) => ordenActual.filter((nivel) => nivel.key !== columna.key))
    }
  }

  const restablecerColumnas = () => {
    const defaults = new Set(getDefaultVisibleColumns(columnas))
    setColumnasVisibles(defaults)
    setOrden((actual) => actual.filter((nivel) => defaults.has(nivel.key)))
  }

  const cambiarFiltro = (key, value) => {
    setFiltros((actuales) => ({ ...actuales, [key]: value }))
  }

  const cambiarFiltroMultiple = (key, value) => {
    setFiltros((actuales) => {
      const selected = Array.isArray(actuales[key]) ? actuales[key] : []
      return {
        ...actuales,
        [key]: selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value],
      }
    })
  }

  const limpiarFiltros = () => setFiltros({})

  return (
    <section className={`people-table-card ${abierta ? "" : "people-table-card--collapsed"}`}>
      <div className="people-table-card__header">
        <button
          type="button"
          className="people-table-card__toggle"
          onClick={() => setAbierta((actual) => !actual)}
          aria-expanded={abierta}
          aria-controls={contenidoId}
        >
          <i
            className={`fas fa-chevron-${abierta ? "down" : "right"}`}
            aria-hidden="true"
          ></i>
          <span>
            <strong>{titulo}</strong>
            <small>{descripcion}</small>
          </span>
        </button>
        <div className="people-table-card__actions">
          <span>
            {filtrosActivos > 0
              ? `${filasOrdenadas.length} de ${personas.length}`
              : `${personas.length} personas`
            }
          </span>
          {columnasFiltrables.length > 0 &&
            <button
              type="button"
              className={`icon-button people-table-filter-button ${configurandoFiltros ? "active" : ""}`}
              onClick={() => {
                setAbierta(true)
                setConfigurandoColumnas(false)
                setConfigurandoFiltros((actual) => !actual)
              }}
              aria-label={`Filtrar ${titulo.toLowerCase()}`}
              aria-expanded={configurandoFiltros}
              aria-controls={filtrosId}
              title="Aplicar filtros"
            >
              <i className="fas fa-filter" aria-hidden="true"></i>
              {filtrosActivos > 0 && <b>{filtrosActivos}</b>}
            </button>
          }
          <button
            type="button"
            className={`icon-button ${configurandoColumnas ? "active" : ""}`}
            onClick={() => {
              setAbierta(true)
              setConfigurandoFiltros(false)
              setConfigurandoColumnas((actual) => !actual)
            }}
            aria-label={`Configurar columnas de ${titulo.toLowerCase()}`}
            aria-expanded={configurandoColumnas}
            aria-controls={columnasId}
            title="Seleccionar columnas"
          >
            <i className="fas fa-table-columns" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={onAgregar}
            aria-label={`Agregar a ${titulo.toLowerCase()}`}
            title={`Agregar a ${titulo.toLowerCase()}`}
          >
            <i className="fas fa-add" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      {abierta &&
        <div id={contenidoId}>
          {configurandoFiltros &&
            <div id={filtrosId} className="people-table-filters">
              <div className="people-table-filters__heading">
                <div>
                  <strong>Filtrar personas</strong>
                  <small>Los filtros activos se aplican al mismo tiempo.</small>
                </div>
                {filtrosActivos > 0 &&
                  <button type="button" onClick={limpiarFiltros}>
                    Limpiar filtros
                  </button>
                }
              </div>
              <div className="people-table-filters__options">
                {columnasFiltrables.map((columna) => (
                  columna.filterType === "checkboxes"
                    ? <fieldset key={columna.key}>
                      <legend>{columna.filterLabel || columna.label}</legend>
                      <div className="people-table-filters__checks">
                        {columna.filterOptions.map((option) => {
                          const inputId = `${id}-${columna.key}-${option.value}`
                          return (
                            <label key={option.value} htmlFor={inputId}>
                              <input
                                id={inputId}
                                type="checkbox"
                                checked={(filtros[columna.key] || []).includes(option.value)}
                                onChange={() => cambiarFiltroMultiple(columna.key, option.value)}
                              />
                              <span>{option.label}</span>
                            </label>
                          )
                        })}
                      </div>
                    </fieldset>
                    : <label key={columna.key}>
                      <span>{columna.filterLabel || columna.label}</span>
                      <select
                        value={filtros[columna.key] || "todos"}
                        onChange={(event) => cambiarFiltro(columna.key, event.target.value)}
                      >
                        <option value="todos">Todos</option>
                        {columna.filterOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                ))}
              </div>
            </div>
          }
          {configurandoColumnas &&
            <div id={columnasId} className="people-table-columns">
              <div className="people-table-columns__heading">
                <div>
                  <strong>Columnas visibles</strong>
                  <small>
                    {columnasMostradas.length} de {columnas.length} seleccionadas
                  </small>
                </div>
                <button type="button" onClick={restablecerColumnas}>
                  Predeterminadas
                </button>
              </div>
              <div className="people-table-columns__options">
                {columnas.map((columna) => (
                  <label
                    key={columna.key}
                    className={columna.alwaysVisible ? "is-required" : ""}
                  >
                    <input
                      type="checkbox"
                      checked={columnasVisibles.has(columna.key)}
                      disabled={columna.alwaysVisible}
                      onChange={() => cambiarVisibilidadColumna(columna)}
                    />
                    <span>{columna.label}</span>
                    {columna.alwaysVisible && <small>Siempre visible</small>}
                  </label>
                ))}
              </div>
            </div>
          }
          {personas.length > 0
            ? <>
              <div className="people-table-sort">
                <div>
                  <i className="fas fa-arrow-down-wide-short" aria-hidden="true"></i>
                  {orden.length > 0
                    ? <span>
                      Orden: {orden.map((nivel, index) => {
                        const columna = columnas.find((item) => item.key === nivel.key)
                        return `${index + 1}. ${columna?.label || nivel.key} ${nivel.direction === "asc" ? "↑" : "↓"}`
                      }).join(" · ")}
                    </span>
                    : <span>Selecciona encabezados en el orden de prioridad.</span>
                  }
                </div>
                {orden.length > 0 &&
                  <button type="button" onClick={() => setOrden([])}>
                    Restablecer
                  </button>
                }
              </div>
              <div className="people-table-scroll">
                <table className="people-table">
                  <thead>
                    <tr>
                      {columnasMostradas.map((columna) => {
                        const prioridad = orden.findIndex((nivel) => nivel.key === columna.key)
                        const nivel = prioridad >= 0 ? orden[prioridad] : null
                        const ariaSort = nivel
                          ? nivel.direction === "asc" ? "ascending" : "descending"
                          : "none"

                        return (
                          <th
                            key={columna.key}
                            scope="col"
                            aria-sort={ariaSort}
                            className={columna.sticky ? "people-table__sticky" : ""}
                          >
                            <button
                              type="button"
                              onClick={() => cambiarOrden(columna.key)}
                              title="Clic: ascendente, descendente o quitar del orden"
                            >
                              <span>{columna.label}</span>
                              <span className="people-table__sort-state">
                                {nivel && <b>{prioridad + 1}</b>}
                                <i
                                  className={nivel
                                    ? `fas fa-arrow-${nivel.direction === "asc" ? "up" : "down"}`
                                    : "fas fa-sort"
                                  }
                                  aria-hidden="true"
                                ></i>
                              </span>
                            </button>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {filasOrdenadas.map((persona) => (
                      <tr key={persona.id || persona.nombre}>
                        {columnasMostradas.map((columna) => (
                          <td
                            key={columna.key}
                            className={columna.sticky ? "people-table__sticky people-table__name" : ""}
                          >
                            {columna.render(persona)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
            : <div className="people-table-card__empty">No hay personas agregadas.</div>
          }
        </div>
      }
    </section>
  )
}

export default function Personas() {
  const [vista, setVista] = useState(() => (
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
      ? "lista"
      : "tabla"
  ))
  const nombradosRef = useRef(null)
  const matriculadosRef = useRef(null)
  const matriculados = useAtomValue(atoms.matriculados) || []
  const nombrados = useAtomValue(atoms.nombrados) || []

  const columnasMatriculados = useMemo(() => [
    {
      key: "nombre",
      label: "Nombre",
      sticky: true,
      alwaysVisible: true,
      sortValue: (persona) => persona.nombre,
      render: (persona) => persona.nombre,
    },
    {
      key: "genero",
      label: "Género",
      defaultVisible: false,
      sortValue: (persona) => persona.genero,
      filterOptions: [
        { value: "1", label: "Hombres" },
        { value: "2", label: "Mujeres" },
      ],
      filterValue: (persona) => persona.genero,
      render: (persona) => (
        persona.genero === 1 ? "Hombre" : persona.genero === 2 ? "Mujer" : "—"
      ),
    },
    {
      key: "ultimaAsignacion",
      label: "Última participación",
      sortValue: (persona) => getStudentHistory(persona).lastParticipation,
      render: (persona) => mostrarFecha(getStudentHistory(persona).lastParticipation),
    },
    {
      key: "ultimoRol",
      label: "Participación",
      sortValue: (persona) => getStudentHistory(persona).lastRole,
      filterLabel: "Última participación",
      filterOptions: [
        { value: "asignado", label: "Asignado" },
        { value: "ayudante", label: "Ayudante" },
      ],
      filterValue: (persona) => getStudentHistory(persona).lastRole,
      render: (persona) => {
        const rol = getStudentHistory(persona).lastRole
        return rol === "ayudante" ? "Ayudante" : rol === "asignado" ? "Asignado" : "—"
      },
    },
    {
      key: "ultimaSala",
      label: "Sala como asignado",
      sortValue: (persona) => getStudentHistory(persona).lastRoom,
      filterLabel: "Última sala como asignado",
      filterOptions: [
        { value: "0", label: "Sala principal" },
        { value: "1", label: "Sala B" },
      ],
      filterValue: (persona) => getStudentHistory(persona).lastRoom,
      render: (persona) => {
        const sala = getStudentHistory(persona).lastRoom
        return sala == null ? "—" : sala === 1 ? "Sala B" : "Principal"
      },
    },
    {
      key: "tiposAsignacion",
      label: "Puede pasar",
      sortValue: (persona) => getTiposAsignacionLabels(persona.tiposAsignacion || []).join(", "),
      filterType: "checkboxes",
      filterOptions: TIPOS_ASIGNACION_MATRICULADO.map((tipo) => ({
        value: tipo.id,
        label: tipo.label,
      })),
      filterValues: (persona) => persona.tiposAsignacion || [],
      render: (persona) => {
        const tipos = getTiposAsignacionLabels(persona.tiposAsignacion || [])
        return tipos.length > 0 ? tipos.join(", ") : "Sin definir"
      },
    },
    {
      key: "detalles",
      label: "Observaciones",
      sortValue: (persona) => persona.detalles,
      render: (persona) => persona.detalles || "—",
    },
  ], [])

  const columnasNombrados = useMemo(() => {
    const columnasRol = [
      ["presidir", "Presidir"],
      ["salaAux", "Sala auxiliar"],
      ["tesoros", "Tesoros"],
      ["perlas", "Perlas"],
      ["analisis", "Análisis"],
      ["estudio", "Estudio"],
      ["necesidades", "Necesidades"],
    ].map(([key, label]) => ({
      key,
      label,
      sortValue: (persona) => ultimaFechaDeRol(persona, key),
      render: (persona) => mostrarFecha(ultimaFechaDeRol(persona, key)),
    }))

    return [
      {
        key: "nombre",
        label: "Nombre",
        sticky: true,
        alwaysVisible: true,
        sortValue: (persona) => persona.nombre,
        render: (persona) => (
          <span className="people-table__person">
            <strong>{persona.nombre}</strong>
            <small>{nombramientos[persona.nombramiento] || "Sin nombramiento"}</small>
          </span>
        ),
      },
      ...columnasRol,
      {
        key: "ultimaAsignacion",
        label: "Última asignación",
        sortValue: ultimaFechaNombrado,
        render: (persona) => mostrarFecha(ultimaFechaNombrado(persona)),
      },
      {
        key: "tiposAsignacion",
        label: "Puede pasar",
        sortValue: (persona) => getTiposAsignacionNombradoLabels(persona.tiposAsignacion || []).join(", "),
        filterType: "checkboxes",
        filterOptions: TIPOS_ASIGNACION_NOMBRADO.map((tipo) => ({
          value: tipo.id,
          label: tipo.label,
        })),
        filterValues: (persona) => persona.tiposAsignacion || [],
        render: (persona) => {
          const tipos = getTiposAsignacionNombradoLabels(persona.tiposAsignacion || [])
          return tipos.length > 0 ? tipos.join(", ") : "Sin definir"
        },
      },
      {
        key: "detalles",
        label: "Observaciones",
        sortValue: (persona) => persona.detalles,
        render: (persona) => persona.detalles || "—",
      },
    ]
  }, [])

  return (
    <>
      <div className="people-page-header">
        <div>
          <h1>Personas</h1>
          <p>Administra las personas o compara rápidamente sus asignaciones.</p>
        </div>
        <div className="people-view-switch" aria-label="Vista de personas">
          <button
            type="button"
            className={vista === "lista" ? "active" : ""}
            onClick={() => setVista("lista")}
            aria-pressed={vista === "lista"}
          >
            <i className="fas fa-list" aria-hidden="true"></i>
            Lista
          </button>
          <button
            type="button"
            className={vista === "tabla" ? "active" : ""}
            onClick={() => setVista("tabla")}
            aria-pressed={vista === "tabla"}
          >
            <i className="fas fa-table" aria-hidden="true"></i>
            Tabla
          </button>
        </div>
      </div>

      {vista === "tabla" &&
        <div className="people-tables">
          <TablaPersonas
            id="tabla-matriculados"
            titulo="Matriculados"
            descripcion="Sin las marcas de participación de los últimos tres meses."
            personas={matriculados}
            columnas={columnasMatriculados}
            onAgregar={() => matriculadosRef.current?.abrirModalAgregar()}
          />
          <TablaPersonas
            id="tabla-nombrados"
            titulo="Nombrados"
            descripcion="Última fecha registrada para cada tipo de asignación."
            personas={nombrados}
            columnas={columnasNombrados}
            onAgregar={() => nombradosRef.current?.abrirModalAgregar()}
          />
        </div>
      }

      <div className={vista === "lista"
        ? "flex flex-col xl:flex-row matriculados gap-3 sm:gap-4 px-3 sm:px-4 pb-4"
        : "contents"
      }>
        <div className={vista === "lista" ? "w-full xl:max-w-md" : "contents"}>
          <Nombrados ref={nombradosRef} mostrarTarjeta={vista === "lista"} />
        </div>
        <div className={vista === "lista" ? "w-full xl:max-w-md" : "contents"}>
          <Matriculados ref={matriculadosRef} mostrarTarjeta={vista === "lista"} />
        </div>
      </div>
      <div className="px-3 sm:px-4 pb-4">
        <Oraciones />
      </div>
    </>
  )
}
