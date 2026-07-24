import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import Modal from '../../common/Modal'
import NombradoCollapse from './NombradoCollapse'
import atoms from '../../../jotai/atoms'
import { useAtomValue } from 'jotai'
import Input from '../../common/Input'
import useModal from '../../../hooks/useModal'
import Select from '../../common/Select'
import { LoaderIcon } from 'react-hot-toast'
import nombradosController from '../../../firebase/controllers/nombrados.controller'
import {nombradoInicial} from '../../../constants/nombradoInicial'
import { TIPOS_ASIGNACION_NOMBRADO } from '../../../constants/tiposAsignacionNombrado'
import { stripUndefined } from '../../../functions/programHelpers'

const Nombrados = forwardRef(function Nombrados({ mostrarTarjeta = true }, ref) {
  const nombrados = useAtomValue(atoms.nombrados)
  const congregacion = useAtomValue(atoms.congregacion)
  const [abierta, setAbierta] = useState(true)
  const [filtrosNombramiento, setFiltrosNombramiento] = useState({
    a: true,
    sm: true,
  })
  const [modalAgregar, setModalAgregar] = useState(false)
  const abrirModalAgregar = () => setModalAgregar(true)
  useImperativeHandle(ref, () => ({
    abrirModalAgregar: () => setModalAgregar(true),
  }), [])
  const cerrarModalAgregar = () => {
    setModalAgregar(false)
    setAgregarForm(nombradoInicial)
  }
  const [agregarForm, setAgregarForm] = useState(nombradoInicial)
  const [loading, setLoading] = useState(false)
  const { modalSuccess, modalError, modalLoading } = useModal()

  const nombradosFiltrados = useMemo(() => {
    if (!nombrados) return []

    return nombrados.filter(nombrado => filtrosNombramiento[nombrado.nombramiento])
  }, [nombrados, filtrosNombramiento])

  const toggleFiltroNombramiento = (nombramiento) => {
    setFiltrosNombramiento((prev) => {
      const next = { ...prev, [nombramiento]: !prev[nombramiento] }
      return next.a || next.sm ? next : { a: true, sm: true }
    })
  }

  const filtroClass = (active) => (
    `text-xs px-3 py-1 rounded-full border transition cursor-pointer ${
      active
        ? "bg-purple-500 text-white border-purple-500"
        : "bg-white text-gray-600 border-gray-300"
    }`
  )

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
    if (!congregacion) return;

    setLoading(true)
    try {
      if (agregarForm.id) {
        const { id, ...payload } = agregarForm
        await nombradosController.updateNombrado(stripUndefined(payload), congregacion.id, id)
        modalSuccess({
          text: <>
            Se ha editado a <span className='text-purple-400 font-bold' >
              {payload.nombre}
            </span> correctamente
          </>
        })
        setModalAgregar(false)
      } else {
        const payload = {
          nombre: agregarForm.nombre,
          nombramiento: agregarForm.nombramiento,
          detalles: agregarForm.detalles,
          tiposAsignacion: agregarForm.tiposAsignacion,
        }
        await nombradosController.createNombrado(payload, congregacion.id)
        modalSuccess({
          text: <>
            Se ha agregado a <span className='text-purple-400 font-bold' >
              {payload.nombre}
            </span> correctamente
          </>
        })
        setModalAgregar(false)
      }
    } catch (e) {
      console.error("Error al guardar =>", e)
      modalError({ text: "Ha habido un error al guardar" })
    }
    setLoading(false)
    setAgregarForm(nombradoInicial)
  }

  const onEdit = (nombrado) => {
    setAgregarForm({
      id: nombrado.id,
      nombre: nombrado.nombre,
      nombramiento: nombrado.nombramiento,
      detalles: nombrado.detalles || "",
      tiposAsignacion: Array.isArray(nombrado.tiposAsignacion) ? nombrado.tiposAsignacion : [],
      ultimasAsignaciones: nombrado.ultimasAsignaciones,
    })
    setModalAgregar(true)
  }

  const onDelete = async (id, nombre) => {
    setLoading(true)
    modalLoading()

    try {
      await nombradosController.deleteNombrado(id, congregacion.id)
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
    {mostrarTarjeta && <div className="card">
      <div className="card_title">
        <button
          type="button"
          className="people-list-section-toggle"
          onClick={() => setAbierta((actual) => !actual)}
          aria-expanded={abierta}
          aria-controls="lista-nombrados-contenido"
        >
          <i className={`fas fa-chevron-${abierta ? "down" : "right"}`} aria-hidden="true"></i>
          <h2><b>Nombrados:</b></h2>
        </button>
        <button className="icon-button" onClick={abrirModalAgregar}>
          <i className="fas fa-add"></i>
        </button>
      </div>
      {abierta && <div id="lista-nombrados-contenido">
        <div className="flex flex-wrap gap-2 mt-2">
        <button
          type="button"
          className={filtroClass(filtrosNombramiento.a)}
          onClick={() => toggleFiltroNombramiento("a")}
        >
          Ancianos
        </button>
        <button
          type="button"
          className={filtroClass(filtrosNombramiento.sm)}
          onClick={() => toggleFiltroNombramiento("sm")}
        >
          Ministeriales
        </button>
        </div>

        {/* Contenido */}
        {
          nombrados && nombrados.length > 0
          ? <ul className='my-2 gap-2 max-h-[400px] overflow-y-auto border-b ' >
            {nombradosFiltrados.map(nombrado =>
              <NombradoCollapse
                key={nombrado.id}
                nombrado={nombrado}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            )}
            {nombradosFiltrados.length === 0 && (
              <p className='text-center text-gray-500 py-4'>No hay resultados con estos filtros</p>
            )}
          </ul>
          : <div className='p-5 border-2 border-dashed rounded-xl mt-5 border-purple-200 flex flex-col items-center gap-5 ' >
            <p className='text-center' >No hay nombrados agregados</p>
            <button className='btn main' onClick={abrirModalAgregar} >Agregar uno</button>
          </div>
        }
      </div>}
    </div>}

    <Modal title="Agregar nombrado" size='md' open={modalAgregar} onClose={cerrarModalAgregar} >
      <form onSubmit={submit} className='flex flex-col gap-5 my-5' >
        <Input
          required
          value={agregarForm.nombre}
          onChange={e => setAgregarForm({ ...agregarForm, nombre: e.target.value })}
          label="Nombre:"
          placeholder="Nombre"
        />
        <Select
          required
          label="Nombramiento:"
          value={agregarForm.nombramiento}
          onChange={e => setAgregarForm({ ...agregarForm, nombramiento: e.target.value })}
          name="agregar-nombrado-nombramiento-select"
        >
          <option value="" disabled className='text-gray-400 bg-none hover:bg-none italic'>Seleccionar</option>
          <option value="a">Anciano</option>
          <option value="sm">Siervo ministerial</option>
        </Select>
        <div>
          <p className='text-sm'>Tipos de asignaciones que puede pasar:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TIPOS_ASIGNACION_NOMBRADO.map((tipo) => {
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
    </Modal >
  </>
  )
})

Nombrados.displayName = "Nombrados"

export default Nombrados
