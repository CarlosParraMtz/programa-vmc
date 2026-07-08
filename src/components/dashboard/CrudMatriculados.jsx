import { useAtomValue } from "jotai"
import atoms from "../../jotai/atoms"
import { useState, useMemo } from "react"
import MatriculadoCollapse from "./personas/MatriculadoCollapse"
import { puedePasarTipoAsignacion } from "../../constants/tiposAsignacionMatriculado"

export default function CrudMatriculados({ agregarMatriculado, agregarAyudante, tipoAsignacionPermitida = null }) {
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

    if (tipoAsignacionPermitida) {
      filteredData = filteredData.filter(m => puedePasarTipoAsignacion(m, tipoAsignacionPermitida))
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
  }, [matriculados, filters, sortConfig, tipoAsignacionPermitida])

  // Función para limpiar filtros
  const clearFilters = () => {
    setFilters({
      genero: 'todos',
      sala: 'todos',
      tipoAsignacion: 'todos'
    })
  }
  return (
    <div className="space-y-4 min-w-0">
      {/* Barra de filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 px-3 sm:px-4 py-3 bg-gray-100 rounded-xl">
        <div className="flex flex-col min-w-0">
          <label className="text-xs mb-0">Género</label>
          <select
            className="px-2 py-2 border border-gray-300 rounded-full w-full"
            value={filters.genero}
            onChange={(e) => handleFilterChange('genero', e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="1">Hombre</option>
            <option value="2">Mujer</option>
          </select>
        </div>

        <div className="flex flex-col min-w-0">
          <label className="text-xs mb-0">Sala</label>
          <select
            className="px-2 py-2 border border-gray-300 rounded-full w-full"
            value={filters.sala}
            onChange={(e) => handleFilterChange('sala', e.target.value)}
          >
            <option value="todos">Todas</option>
            <option value="0">Sala A</option>
            <option value="1">Sala B</option>
          </select>
        </div>

        <div className="flex flex-col min-w-0">
          <label className="text-xs mb-0">Tipo de asignación</label>
          <select
            className="px-2 py-2 border border-gray-300 rounded-full w-full"
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

        <div className="flex items-end">
          <button
            className="text-xs bg-purple-500 cursor-pointer text-white px-4 py-2 rounded-full w-full"
            onClick={clearFilters}
          >
            Limpiar filtros
          </button>
        </div>

        <div className="flex flex-col min-w-0">
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

      {/* Lista de Matriculados */}
      <div className="max-w-4xl max-h-[55vh] overflow-auto flex flex-col gap-2">
        {
          filteredAndSortedMatriculados.map((matriculado) => (
            <MatriculadoCollapse
              key={matriculado.id}
              matriculado={matriculado}
              onAdd={agregarMatriculado}
              onAddAyudante={agregarAyudante}
            />
          ))
        }
        {filteredAndSortedMatriculados.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No se encontraron resultados con los filtros aplicados
          </div>
        )}
      </div>
    </div>
  )
}
