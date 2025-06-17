import { useAtomValue } from "jotai"
import atoms from "../../jotai/atoms"
import { useState, useMemo } from "react"

export default function CrudMatriculados() {
  const matriculados = useAtomValue(atoms.matriculados)
  const [filters, setFilters] = useState({
    genero: 'todos',
    sala: 'todos',
    tipoAsignacion: 'todos',
  })
  const [sortConfig, setSortConfig] = useState({
    key: 'nombre',
    direction: 'ascending'
  })

  // Función para manejar cambios en los filtros
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  // Función para solicitar ordenación
  const requestSort = (key) => {
    let direction = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  // Filtrar y ordenar los datos
  const filteredAndSortedMatriculados = useMemo(() => {
    let filteredData = [...matriculados]

    // Aplicar filtros
    if (filters.genero !== 'todos') {
      filteredData = filteredData.filter(m => m.genero === parseInt(filters.genero))
    }

    if (filters.sala !== 'todos') {
      const salaNum = parseInt(filters.sala)
      filteredData = filteredData.filter(m => {
        // Si tiene última sala definida, comparamos con ella
        if (m.ultimaSala !== undefined && m.ultimaSala !== null) {
          return m.ultimaSala === salaNum
        }
        // Si no, verificamos si tiene asignaciones en la sala solicitada
        return m.fechas[salaNum]?.asignado?.length > 0 ||
          m.fechas[salaNum]?.ayudante?.length > 0
      })
    }

    if (filters.tipoAsignacion !== 'todos') {
      filteredData = filteredData.filter(m => m.ultimoTipo === parseInt(filters.tipoAsignacion))
    }

    // Aplicar ordenación
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        if (sortConfig.key === 'nombre') {
          if (a.nombre < b.nombre) {
            return sortConfig.direction === 'ascending' ? -1 : 1
          }
          if (a.nombre > b.nombre) {
            return sortConfig.direction === 'ascending' ? 1 : -1
          }
          return 0
        } else if (sortConfig.key === 'ultimaAsignacion') {
          const dateA = a.ultimaAsignacion || '0000-00-00'
          const dateB = b.ultimaAsignacion || '0000-00-00'
          if (dateA < dateB) {
            return sortConfig.direction === 'ascending' ? -1 : 1
          }
          if (dateA > dateB) {
            return sortConfig.direction === 'ascending' ? 1 : -1
          }
          return 0
        }
        return 0
      })
    }

    return filteredData
  }, [matriculados, filters, sortConfig])

  // Función para limpiar filtros
  const clearFilters = () => {
    setFilters({
      genero: 'todos',
      sala: 'todos',
      tipoAsignacion: 'todos'
    })
  }

  return (
    <div className="space-y-4">
      {/* Barra de filtros */}
      <div className="flex flex-wrap gap-4 px-4 py-2 bg-gray-100 rounded-xl">
        <div className="flex flex-col">
          <label className="text-xs mb-0">Género</label>
          <select
            className="px-2 py-1 border border-gray-300 rounded-full"
            value={filters.genero}
            onChange={(e) => handleFilterChange('genero', e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="1">Hombre</option>
            <option value="2">Mujer</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs mb-0">Sala</label>
          <select
            className="px-2 py-1 border border-gray-300 rounded-full"
            value={filters.sala}
            onChange={(e) => handleFilterChange('sala', e.target.value)}
          >
            <option value="todos">Todas</option>
            <option value="0">Sala A</option>
            <option value="1">Sala B</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs mb-0">Tipo de asignación</label>
          <select
            className="px-2 py-1 border border-gray-300 rounded-full"
            value={filters.tipoAsignacion}
            onChange={(e) => handleFilterChange('tipoAsignacion', e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="1">Ayudante</option>
            <option value="2">Demostración</option>
            <option value="3">Lectura</option>
            <option value="4">Discurso</option>
          </select>
        </div>

        <div className="flex items-end mb-1">
          <button
            className="text-xs bg-purple-500 cursor-pointer text-white px-4 py-1 rounded-full"
            onClick={clearFilters}
          >
            Limpiar filtros
          </button>
        </div>

        <div className="flex flex-col">
          <label className="text-xs mb-0">Ordenar por</label>
          <div className="flex gap-2">
            <button
              className={`text-xs px-4 py-1 rounded-lg cursor-pointer
                ${sortConfig.key === 'nombre' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
              onClick={() => requestSort('nombre')}
            >
              <i className={`fas text-xs ${sortConfig.direction === 'ascending' ? 'fa-arrow-up-a-z' : 'fa-arrow-up-z-a'}`}></i>
            </button>
            <button
              className={`text-xs  px-4 py-1 rounded-lg cursor-pointer
                ${sortConfig.key === 'ultimaAsignacion' ? 'bg-purple-500 text-white' : 'bg-gray-200'} `}
              onClick={() => requestSort('ultimaAsignacion')}
            >
              <i className={`fas ${sortConfig.direction === 'ascending' ? "fa-arrow-up" : 'fa-arrow-down'}`}></i>
              
              <i className="fas fa-calendar text-xs ml-1"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="max-w-4xl overflow-auto relative max-h-[400px]">
        <table className="w-full">
          <thead className="sticky top-0 bg-white z-30">
            <tr className="
              sticky left-0
              [&>]:bg-gray-300
              [&>*:not(:first-child)]:min-w-[100px] 
            ">
              <td
                className="min-w-[150px] sticky left-0 bg-white cursor-pointer"
                onClick={() => requestSort('nombre')}
              >
                Nombre 
              </td>
              <td>Género</td>
              <td>Asignado Sala A</td>
              <td>Ayudante Sala A</td>
              <td>Asignado Sala B</td>
              <td>Ayudante Sala B</td>
              <td
                className="cursor-pointer"
                onClick={() => requestSort('ultimaAsignacion')}
              >
                Última asignación 
              </td>
              <td>Última sala</td>
              <td>Último tipo</td>
              <td>Observaciones</td>
            </tr>
          </thead>
          <tbody
            className="max-h-[500px] overflow-auto
              [&>*]:nada
              [&>*:not(:last-child)]:border-gray-700
            ">
            {
              filteredAndSortedMatriculados.map((matriculado, index) => (
                <tr
                  key={matriculado.id}
                  onClick={() => alert(`se ha clickado ${matriculado.nombre}`)}
                  className="
                    [&>*]:py-2
                    [&>*]:sticky
                    [&>*]:left-0
                    [&>*:first-child]:z-20
                    [&>*:not(:last-child)]:px-2
                    [&>*]:text-xs
                    odd:bg-gray-200
                    even:bg-gray-50
                    hover:[&>*]:bg-purple-200
                    cursor-pointer
                  "
                >
                  <td className={` ${index % 2 === 0 ? 'bg-gray-200' : 'bg-gray-50'}`}>
                    {matriculado.nombre}
                  </td>
                  <td>{matriculado.genero === 1 ? "Hombre" : matriculado.genero === 2 ? "Mujer" : "No especificado"}</td>
                  <td>{matriculado.fechas[0]?.asignado[0] || "Sin fecha"}</td>
                  <td>{matriculado.fechas[0]?.ayudante[0] || "Sin fecha"}</td>
                  <td>{matriculado.fechas[1]?.asignado[0] || "Sin fecha"}</td>
                  <td>{matriculado.fechas[1]?.ayudante[0] || "Sin fecha"}</td>
                  <td>{matriculado.ultimaAsignacion || "Sin fecha"}</td>
                  <td>{matriculado.ultimaSala === 0 ? "Sala A" : matriculado.ultimaSala === 1 ? "Sala B" : "Sin datos"}</td>
                  <td>
                    {matriculado.ultimoTipo === 1 ? "Ayudante" :
                      matriculado.ultimoTipo === 2 ? "Demostración" :
                        matriculado.ultimoTipo === 3 ? "Lectura" :
                          matriculado.ultimoTipo === 4 ? "Discurso" : "Sin datos"}
                  </td>
                  <td className="text-ellipsis">{matriculado.detalles}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {filteredAndSortedMatriculados.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No se encontraron resultados con los filtros aplicados
          </div>
        )}
      </div>
    </div>
  )
}
