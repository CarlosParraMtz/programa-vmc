import { useState } from 'react'
import Modal from '../../common/Modal'
import NombradoCollapse from './NombradoCollapse'
import atoms from '../../../recoil/atoms'
import { useRecoilValue } from 'recoil'
import Input from '../../common/Input'
import useModal from '../../../hooks/useModal'

export default function Nombrados() {
  const [modalAgregar, setModalAgregar] = useState(false)
  const abrirModalAgregar = () => setModalAgregar(true)
  const cerrarModalAgregar = () => setModalAgregar(false)
  const nombrados = useRecoilValue(atoms.nombrados)
  const { modalSuccess } = useModal()

  const submit = async (e) => {
    e.preventDefault()
    modalSuccess({
      text: 'Se ha agregado un nombrado correctamente',
    })
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
              <NombradoCollapse key={nombrado.id} nombrado={nombrado} />)}
          </ul>
          : <div className='p-5 border-2 border-dashed rounded-xl mt-5 border-purple-200 flex flex-col items-center gap-5 ' >
            <p className='text-center' >No hay nombrados agregados</p>
            <button className='btn main' onClick={abrirModalAgregar} >Agregar uno</button>
          </div>
      }
    </div>

    <Modal title="Agregar nombrado" open={modalAgregar} onClose={cerrarModalAgregar} >
      <form onSubmit={submit} >
        <Input label="Nombre" placeholder="Nombre" />
        <button type="submit" className='btn main' >Guardar</button>
      </form>
    </Modal>
  </>
  )
}
