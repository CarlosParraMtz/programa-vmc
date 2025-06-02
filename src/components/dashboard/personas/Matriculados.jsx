import { useState } from 'react'
import Modal from '../../common/Modal'

export default function Nombrados() {
  const [modalAgregar, setModalAgregar] = useState(false)

  const abrirModalAgregar = () => setModalAgregar(true)
  const cerrarModalAgregar = () => setModalAgregar(false)

  return (<>
    <div className="card">
      <div className="card_title">
        <h2><b>Matriculados:</b></h2>
        <button className="icon-button" onClick={abrirModalAgregar}>
          <i className="fas fa-add"></i>
        </button>
      </div>
    </div>

    <Modal title="Agregar matriculado" open={modalAgregar} onClose={cerrarModalAgregar} >

    </Modal>
  </>
  )
}