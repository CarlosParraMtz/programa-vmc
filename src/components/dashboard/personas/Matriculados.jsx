import { useMemo, useState } from 'react'
import Modal from '../../common/Modal'
import { useAtomValue } from 'jotai'
import atoms from '../../../jotai/atoms'
import MatriculadoCollapse from './MatriculadoCollapse'
import Input from '../../common/Input'
import { LoaderIcon } from 'react-hot-toast'
import useModal from '../../../hooks/useModal'
import matriculadosController from '../../../firebase/controllers/matriculados.controller'
import { TIPOS_ASIGNACION_MATRICULADO } from '../../../constants/tiposAsignacionMatriculado'

const formInicial = {
  nombre: "",
  genero: 1, //*1 hombre, 2 mujer
  detalles: "",
  fechas: [ //Cada objeto es una sala diferente
    {
      asignado: [], // Aquí se van apilando las fechas en las que tuvo asignaciones.
      ayudante: [],
    },
  ],
  ultimaSala: 0, //* Index de salas, 0 es Sala principal, 1 es sala B. Si hubiera sala C, sería 2
  ultimaAsignacion: null,
  ayudantes: [], //* Hay que ir agregando el id del ayudante cada que tiene uno
  ultimoTipo: 1, //* 1 Ayudante; 2 Demostración; 3 Lectura; 4 Discurso
  tiposAsignacion: [],
}

export default function Nombrados() {

  const [loading, setLoading] = useState(false)
  const [modalAgregar, setModalAgregar] = useState(false)
  const [agregarForm, setAgregarForm] = useState(formInicial)
  const [filtrosGenero, setFiltrosGenero] = useState({
    hombres: true,
    mujeres: true,
  })
  const [ordenarPorUltimaAsignacion, setOrdenarPorUltimaAsignacion] = useState(false)
  const matriculados = useAtomValue(atoms.matriculados)
  const congregacion = useAtomValue(atoms.congregacion)
  const { modalSuccess, modalError } = useModal()

  const matriculadosFiltrados = useMemo(() => {
    if (!matriculados) return []

    return matriculados
      .filter((matriculado) => {
        if (matriculado.genero === 1) return filtrosGenero.hombres
        if (matriculado.genero === 2) return filtrosGenero.mujeres
        return true
      })
      .sort((a, b) => {
        if (ordenarPorUltimaAsignacion) {
          const fechaA = a.ultimaAsignacion || '0000-00-00'
          const fechaB = b.ultimaAsignacion || '0000-00-00'
          const comparacionFecha = fechaA.localeCompare(fechaB)
          if (comparacionFecha !== 0) return comparacionFecha
        }

        return a.nombre.localeCompare(b.nombre)
      })
  }, [matriculados, filtrosGenero, ordenarPorUltimaAsignacion])

  const toggleFiltroGenero = (genero) => {
    setFiltrosGenero((prev) => {
      const next = { ...prev, [genero]: !prev[genero] }
      return next.hombres || next.mujeres ? next : { hombres: true, mujeres: true }
    })
  }

  const filtroClass = (active) => (
    `text-xs px-3 py-1 rounded-full border transition cursor-pointer ${
      active
        ? "bg-purple-500 text-white border-purple-500"
        : "bg-white text-gray-600 border-gray-300"
    }`
  )

  const abrirModalAgregar = () => setModalAgregar(true)
  const cerrarModalAgregar = () => {
    setModalAgregar(false)
    setAgregarForm(formInicial)
  }

  const toggleTipoAsignacion = (tipo) => {
    setAgregarForm((prev) => {
      const actuales = Array.isArray(prev.tiposAsignacion) ? prev.tiposAsignacion : []
      const tiposAsignacion = actuales.includes(tipo)
        ? actuales.filter((item) => item !== tipo)
        : [...actuales, tipo]
      return { ...prev, tiposAsignacion }
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!congregacion) {
      modalError({
        title: "Error al guardar",
        text: "Es necesario administrar una congregación primero"
      })
      return
    }

    setLoading(true)
    try {
      if (agregarForm.id) {
        await matriculadosController.updateMatriculado(agregarForm, congregacion.id, agregarForm.id)
        modalSuccess({
          title: "Se ha actualizado este matriculado correctamente",
          text: <span className='text-purple-400' >{agregarForm.nombre}</span>
        })
      } else {
        await matriculadosController.createMatriculado(agregarForm, congregacion.id)
        modalSuccess({
          title: "Se ha guardado este matriculado correctamente",
          text: <span className='text-purple-400' >{agregarForm.nombre}</span>
        })
      }
      cerrarModalAgregar()
    } catch (error) {
      console.error("Error al guardar =>", error)
      modalError({
        title: "Error al guardar",
        text: "No se ha podido guardar este matriculado"
      })
    }
    setLoading(false)
  }

  const onEdit = (matriculado) => {
    setAgregarForm({
      id: matriculado.id,
      nombre: matriculado.nombre,
      genero: matriculado.genero, 
      detalles: matriculado.detalles,
      fechas: matriculado.fechas,
      ultimaSala: matriculado.ultimaSala, 
      ultimaAsignacion: matriculado.ultimaAsignacion,
      ayudantes: matriculado.ayudantes, 
      ultimoTipo: matriculado.ultimoTipo, 
      tiposAsignacion: Array.isArray(matriculado.tiposAsignacion) ? matriculado.tiposAsignacion : [],
    })
    setModalAgregar(true)
  }

  const onDelete = async (id, nombre) => {
    setLoading(true)
    try {
      await matriculadosController.deleteMatriculado(id, congregacion.id)
      modalSuccess({
        text: <>Se ha borrado a <span>{nombre}</span> correctamente.</>,
      })
    } catch (error) {
      console.error("Error al borrar", error)
      modalError({
        text: "Ha habido un error al borrar."
      })
    }
    setLoading(false)
  }

  return (<>
    <div className="card">
      <div className="card_title">
        <h2><b>Matriculados:</b></h2>
        <button className="icon-button" onClick={abrirModalAgregar}>
          <i className="fas fa-add"></i>
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <button
          type="button"
          className={filtroClass(filtrosGenero.hombres)}
          onClick={() => toggleFiltroGenero("hombres")}
        >
          Hombres
        </button>
        <button
          type="button"
          className={filtroClass(filtrosGenero.mujeres)}
          onClick={() => toggleFiltroGenero("mujeres")}
        >
          Mujeres
        </button>
        <button
          type="button"
          className={filtroClass(ordenarPorUltimaAsignacion)}
          onClick={() => setOrdenarPorUltimaAsignacion((prev) => !prev)}
        >
          Ultima asignacion
        </button>
      </div>

      {/* Contenido */}
      {
        matriculados && matriculados.length > 0
          ? <ul className='my-2 gap-2 max-h-[400px] overflow-y-auto border-b ' >
            {matriculadosFiltrados.map(matriculado =>
              <MatriculadoCollapse
                key={matriculado.id}
                matriculado={matriculado}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            )}
            {matriculadosFiltrados.length === 0 && (
              <p className='text-center text-gray-500 py-4'>No hay resultados con estos filtros</p>
            )}
          </ul>
          : <div className='p-5 border-2 border-dashed rounded-xl mt-5 border-purple-200 flex flex-col items-center gap-5 ' >
            <p className='text-center' >No hay matriculados agregados</p>
            <button className='btn main' onClick={abrirModalAgregar} >Agregar uno</button>
          </div>
      }
    </div>

    <Modal title="Agregar matriculado" open={modalAgregar} onClose={cerrarModalAgregar} >
      <form onSubmit={submit} className='flex flex-col gap-5 my-5' >
        <Input
          required
          value={agregarForm.nombre}
          onChange={e => setAgregarForm({ ...agregarForm, nombre: e.target.value })}
          label="Nombre:"
          placeholder="Nombre"
        />
        <div>
          <p className='text-sm'>Género:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAgregarForm({ ...agregarForm, genero: 1 })}
              className={agregarForm.genero === 1 ? "btn main" : "btn gray"}
            >
              Hombre</button>
            <button
              type="button"
              onClick={() => setAgregarForm({ ...agregarForm, genero: 2 })}
              className={agregarForm.genero === 2 ? "btn main" : "btn gray"}
            >Mujer</button>
          </div>
        </div>

        <div>
          <p className='text-sm'>Tipos de asignaciones que puede pasar:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TIPOS_ASIGNACION_MATRICULADO.map((tipo) => {
              const checked = agregarForm.tiposAsignacion.includes(tipo.id)
              return (
                <label
                  key={tipo.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition ${
                    checked
                      ? "bg-purple-50 border-purple-400 text-purple-700"
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTipoAsignacion(tipo.id)}
                    className="accent-purple-500"
                  />
                  <span>{tipo.label}</span>
                </label>
              )
            })}
          </div>
          {agregarForm.tiposAsignacion.length === 0 && (
            <p className="mt-1 text-xs text-gray-500">Selecciona al menos una opción.</p>
          )}
        </div>

        <div>
          <label className='text-sm'>Detalles y observaciones:</label>
          <textarea className='resize-none w-full rounded-xl p-5 border border-gray-300'
            value={agregarForm.detalles}
            onChange={e => setAgregarForm({ ...agregarForm, detalles: e.target.value })}
            rows={6} placeholder="Escribe algo..." ></textarea>
        </div>
        <button type="submit" className='btn main' disabled={loading || agregarForm.tiposAsignacion.length === 0} >
          {loading ? <LoaderIcon className='w-5 h-5 border-4 border-r-purple-500' /> : "Guardar"}
        </button>
      </form>
    </Modal>
  </>
  )
}
