import { useState } from 'react'
import Modal from '../../common/Modal'
import NombradoCollapse from './NombradoCollapse'
import atoms from '../../../recoil/atoms'
import { useRecoilValue } from 'recoil'
import Input from '../../common/Input'
import useModal from '../../../hooks/useModal'
import Select from '../../common/Select'
import { LoaderIcon } from 'react-hot-toast'
import nombradosController from '../../../firebase/controllers/nombrados.controller'

export default function Nombrados() {
  const nombrados = useRecoilValue(atoms.nombrados)
  const congregacion = useRecoilValue(atoms.congregacion)
  const [modalAgregar, setModalAgregar] = useState(false)
  const abrirModalAgregar = () => setModalAgregar(true)
  const cerrarModalAgregar = () => {
    setModalAgregar(false)
    setAgregarForm({
      id: null,
      nombre: "",
      nombramiento: "",
      detalles: "",
    })
  }
  const [agregarForm, setAgregarForm] = useState({
    id: null,
    nombre: "",
    nombramiento: "",
    detalles: "",
  })
  const [loading, setLoading] = useState(false)
  const { modalSuccess, modalError, modalLoading } = useModal()

  const submit = async (e) => {
    e.preventDefault()
    if (!congregacion) return;

    setLoading(true)
    try {
      if (agregarForm.id) {
        const payload = { ...agregarForm }
        await nombradosController.updateNombrado(payload, congregacion.id, payload.id)
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
    setAgregarForm({
      id: null,
      nombre: "",
      nombramiento: "",
      detalles: "",
    })
  }

  const onEdit = (nombrado) => {
    setAgregarForm({
      id: nombrado.id,
      nombre: nombrado.nombre,
      nombramiento: nombrado.nombramiento,
      detalles: nombrado.detalles || "",
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
    <div className="card">
      <div className="card_title">
        <h2><b>Nombrados:</b></h2>
        <button className="icon-button" onClick={abrirModalAgregar}>
          <i className="fas fa-add"></i>
        </button>
      </div>

      {/* Contenido */}
      {
        nombrados && nombrados.length > 0
          ? <ul className='my-2 gap-2 max-h-[400px] overflow-y-auto border-b ' >
            {nombrados.map(nombrado =>
              <NombradoCollapse
                key={nombrado.id}
                nombrado={nombrado}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            )}
          </ul>
          : <div className='p-5 border-2 border-dashed rounded-xl mt-5 border-purple-200 flex flex-col items-center gap-5 ' >
            <p className='text-center' >No hay nombrados agregados</p>
            <button className='btn main' onClick={abrirModalAgregar} >Agregar uno</button>
          </div>
      }
    </div>

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
          <label className='text-sm'>Detalles y observaciones:</label>
          <textarea className='resize-none w-full rounded-xl p-5 border border-gray-300'
            value={agregarForm.detalles}
            onChange={e => setAgregarForm({ ...agregarForm, detalles: e.target.value })}
            rows={6} placeholder="Escribe algo..." ></textarea>
        </div>
        <button type="submit" className='btn main' disabled={loading} >
          {loading ? <LoaderIcon className='w-5 h-5 border-4 border-r-purple-500' /> : "Guardar"}
        </button>
      </form>
    </Modal >
  </>
  )
}
