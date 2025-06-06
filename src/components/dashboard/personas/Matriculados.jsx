import { useState } from 'react'
import Modal from '../../common/Modal'
import { useRecoilValue } from 'recoil'
import atoms from '../../../recoil/atoms'
import MatriculadoCollapse from './MatriculadoCollapse'
import Input from '../../common/Input'
import { LoaderIcon } from 'react-hot-toast'

export default function Nombrados() {

  const [loading, setLoading] = useState(false)
  const [modalAgregar, setModalAgregar] = useState(false)
  const matriculados = useRecoilValue(atoms.matriculados)
  const [agregarForm, setAgregarForm] = useState({
    nombre: "",
    genero: 1, //1 hombre, 2 mujer
    fechas: [ //Cada objeto es una sala diferente
      {
        asignado: [],
        ayudante: [],
      }
    ],
    ultimaSala: 0, //Index de fechas, 0 es Sala principal, 1 es sala B. Si hubiera sala C, sería 2
    ultimaAsignacion: null,
    ayudantes: [], //Hay que ir agregando el id del ayudante cada que tiene uno
    ultimoTipo: 1, // Consultar tipos de asignaciones en md
  })

  const abrirModalAgregar = () => setModalAgregar(true)
  const cerrarModalAgregar = () => setModalAgregar(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      throw new Error("No implementado aún!")
    } catch (error) {
      console.error("Error al guardar =>", error)
    }
    setLoading(false)
  }

  const onEdit = () => { }
  const onDelete = () => { }

  return (<>
    <div className="card">
      <div className="card_title">
        <h2><b>Matriculados:</b></h2>
        <button className="icon-button" onClick={abrirModalAgregar}>
          <i className="fas fa-add"></i>
        </button>
      </div>

      {/* Contenido */}
      {
        matriculados && matriculados.length > 0
          ? <ul className='my-2 gap-2 max-h-[400px] overflow-y-auto border-b ' >
            {matriculados.map(nombrado =>
              <MatriculadoCollapse
                key={nombrado.id}
                nombrado={nombrado}
                onDelete={onDelete}
                onEdit={onEdit}
              />
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
              onClick={() => setAgregarForm({ ...agregarForm, genero: 1 })}
              className={agregarForm.genero === 1 ? "btn main" : "btn gray"}
            >
              Hombre</button>
            <button
              onClick={() => setAgregarForm({ ...agregarForm, genero: 2 })}
              className={agregarForm.genero === 2 ? "btn main" : "btn gray"}
            >Mujer</button>
          </div>
        </div>
        {/* //TODO Falta agrear el resto del formulario
         */}
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
    </Modal>
  </>
  )
}