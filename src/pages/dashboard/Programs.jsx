import Modal from '../../components/common/Modal';
import Tooltip from '../../components/common/Tooltip';
import { useState } from 'react';
import Input from '../../components/common/Input'
import periodosController from '../../firebase/controllers/periodos.controller';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import atoms from '../../recoil/atoms';
import toast from '../../functions/toast';
import { LoaderIcon } from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function Programs() {

	// Store
	const congregacion = useRecoilValue(atoms.congregacion)
	const programas = useRecoilValue(atoms.programas)
	const setPeriodo = useSetRecoilState(atoms.periodo)
	const reuniones = useRecoilValue(atoms.reuniones)
	
	//States
	const [selected, setSelected] = useState(null)
	const [dialogAgregar, setDialogAgregar] = useState(false)
	const [periodoText, setPeriodoText] = useState("")
	const [sending, setSending] = useState(false)
	const [modalBorrar, setModalBorrar] = useState(false)
	
	//Funciones
	const abrirDialogAgregar = () => setDialogAgregar(true)
	const cerrarDialogAgregar = () => {
		setDialogAgregar(false)
		setPeriodoText("")
	}
	const abrirModalBorrar = () => setModalBorrar(true)
	const cerrarModalBorrar = () => setModalBorrar(false)
	const confirmaBorrarPeriodo = async () => {
		if (!selected) return;

		setSending(true)
		try {
			await periodosController.deletePeriodo(selected.id, congregacion.id)
			setSelected(null)
			setPeriodo(null)
			cerrarModalBorrar()
			setSending(false)
			toast.success("Se ha eliminado este periodo y toda su información")
		}
		catch (e) {
			setSending(false)
			toast.error(e)
		}
	}
	const seleccionar = (data) => {
		setPeriodo(data)
		setSelected(data)
	}
	const onSubmit = async (e) => {
		e.preventDefault()
		if (!congregacion) return;
		setSending(true)
		try {
			await periodosController.createPeriodo({ periodo: periodoText }, congregacion.id)
			toast.success("Se ha agregado el periodo")
			cerrarDialogAgregar()
			setSending(false)
		}
		catch (e) {
			setSending(false)
			toast.error(e)
		}
	}
	//TODO Función para actualizar periodo
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
							<button className='icon-button' onClick={abrirDialogAgregar}  >
								<i className="fas fa-add"></i>
							</button>
						</div>
						<div className="divider"></div>
						{
							(programas && programas.length === 0)
								? (
									<div className="flex flex-col items-center justify-center gap-5 p-16">
										<p>No hay periodos agregados</p>
										<button
											onClick={abrirDialogAgregar}
											className='btn main'
										>
											Agregar uno
										</button>
									</div>
								) : (
									<ul className='flex flex-col gap-1' >
										{
											programas && programas.map((programa) =>
												<li key={programa.id}
													onClick={() => !selected
														? seleccionar(programa)
														: selected.id === programa.id
															? seleccionar(null)
															: seleccionar(programa)
													}
													className={`
														bg-gray-100 cursor-pointer hover:bg-gray-200 
														p-3 rounded flex items-center justify-between
														${selected && selected.id === programa.id
															? "bg-purple-400 hover:bg-purple-300 text-white"
															: ""}
														`}
												>
													{programa.periodo}
												</li>
											)
										}
									</ul>
								)
						}
					</div>
				</div>

				<div className="w-1/2">
					{selected &&
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
									<Tooltip title="Borrar" >
										<button className="icon-button xl" onClick={abrirModalBorrar}>
											<i className="fas fa-trash"></i>
										</button>
									</Tooltip>
									<Tooltip title="Editar nombre de periodo" >
										<button className="icon-button xl">
											<i className="fas fa-edit"></i>
										</button>
									</Tooltip>
								</div>
							</div>
						</div>
					}
					{
						(programas && programas.length > 0) &&

						<div className="w-full p-2.5">
							<div className="card w-full">
								{
									selected
										? <>

											<div className="card_title">
												<h2><strong>Reuniones en este periodo:</strong></h2>
											</div>
											<div className="divider"></div>
											{
												reuniones.filter(reunion => reunion.periodo === selected.id).length === 0
													? <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
														<p>No hay reuniones agregadas en este periodo</p>
														<Link to="/dashboard/reuniones" >
															<button className="btn main">Ir a reuniones</button>
														</Link>
													</div>
													: <div>lista</div>
											}

										</>
										: <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
											<p>Selecciona un periodo en la lista para mostrar las reuniones</p>
										</div>
								}
							</div>
						</div>
					}

				</div>


			</div>

			<Modal id="modal-agregar-periodo" open={dialogAgregar} onClose={cerrarDialogAgregar} title="Agregar periodo" >
				<form className='flex flex-col gap-5' onSubmit={onSubmit}>
					<Input label="Periodo" placeholder="Ej. Julio 2025" required
						value={periodoText} onChange={e => setPeriodoText(e.target.value)}
					/>
					<div className='w-full items-center flex justify-end gap-2' >
						<button className='btn error' type="button" onClick={cerrarDialogAgregar} >Cancelar</button>
						<button className='btn main' type="submit" disabled={sending} >
							{sending ? <LoaderIcon /> : "Agregar"}
						</button>
					</div>
				</form>
			</Modal>

			<Modal id="modal-borrar-periodo" open={modalBorrar} onClose={cerrarModalBorrar} title="Borrar periodo" >
				<h3 className='text-xl mb-4'>¿Seguro que desea borrar el periodo seleccionado?</h3>
				<p>Esta acción no se puede deshacer</p>
				<div className='w-full items-center flex justify-end gap-2 mt-5' >
					<button className='btn error' type="button" onClick={cerrarModalBorrar} >Cancelar</button>
					<button className='btn main' type="button" disabled={sending} onClick={confirmaBorrarPeriodo} >
						{sending ? <LoaderIcon /> : "Borrar"}
					</button>
				</div>
			</Modal>

		</>
	)
}
