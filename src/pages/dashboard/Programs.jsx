import Modal from '../../components/common/Modal';
import Tooltip from '../../components/common/Tooltip';
import { useState } from 'react';

export default function Programs() {

	const [dialogAgregar, setDialogAgregar] = useState(false)


	const abrirDialogAgregar = () => {
		setDialogAgregar(true)
	}

	const cerrarDialogAgregar = () => {
		setDialogAgregar(false)
	}

	return (
		<>
			<div className="p-2.5">
				<h1 className="text-2xl" >Programas</h1>
			</div>
			<div className='flex periodos'>
				<div className="w-1/2 p-2.5">
					<div className="card w-full">
						<div className="card_title">
							<h2><strong>Periodos</strong></h2>
							<button className='icon-button'  >
								<i className="fas fa-add"></i>
							</button>
						</div>
						<div className="divider"></div>
						<div className="flex flex-col items-center justify-center gap-5 p-16">
							<p>No hay periodos agregados</p>
							<button
								onClick={abrirDialogAgregar}
								className='main-button'
							>
								Agregar uno
							</button>
						</div>
					</div>
				</div>

				<div className="w-1/2">
					<div className="w-full p-2.5">
						<div className="card">
							<div className="flex justify-center gap-2">
								<Tooltip title="Imprimir" >
									<button className="icon-button xl">
										<i className="fas fa-print"></i>
									</button>
								</Tooltip>
								<Tooltip title="Enviar" >
									<button className="icon-button xl">
										<i className="fas fa-paper-plane"></i>
									</button>
								</Tooltip>
								<Tooltip title="Exportar" >
									<button className="icon-button xl">
										<i className="fas fa-download"></i>
									</button>
								</Tooltip>
							</div>
						</div>
					</div>
					<div className="w-full p-2.5">
						<div className="card w-full">
							<div className="card_title">
								<h2><strong>Reuniones en este periodo:</strong></h2>
							</div>
							<div className="divider"></div>
							<div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
								<p>Selecciona un periodo en la lista para mostrar las reuniones</p>
							</div>
						</div>
					</div>

				</div>


			</div>

			<Modal id="modal-agregar-periodo" open={dialogAgregar} onClose={cerrarDialogAgregar}  >
				aa
			</Modal>
		</>
	)
}
