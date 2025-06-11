import { useState } from 'react'
import Modal from '../../common/Modal'
import { useRecoilValue } from 'recoil'
import atoms from '../../../recoil/atoms'
import MatriculadoCollapse from './MatriculadoCollapse'
import Input from '../../common/Input'
import { LoaderIcon } from 'react-hot-toast'
import useModal from '../../../hooks/useModal'
import matriculadosController from '../../../firebase/controllers/matriculados.controller'

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
}

export default function Nombrados() {

  const [loading, setLoading] = useState(false)
  const [modalAgregar, setModalAgregar] = useState(false)
  const [agregarForm, setAgregarForm] = useState(formInicial)
  const matriculados = useRecoilValue(atoms.matriculados)
  const congregacion = useRecoilValue(atoms.congregacion)
  const { modalSuccess, modalError } = useModal()

  const abrirModalAgregar = () => setModalAgregar(true)
  const cerrarModalAgregar = () => {
    setModalAgregar(false)
    setAgregarForm(formInicial)
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

      {/* Contenido */}
      {
        matriculados && matriculados.length > 0
          ? <ul className='my-2 gap-2 max-h-[400px] overflow-y-auto border-b ' >
            {matriculados.map(matriculado =>
              <MatriculadoCollapse
                key={matriculado.id}
                matriculado={matriculado}
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