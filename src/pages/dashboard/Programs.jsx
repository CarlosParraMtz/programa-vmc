import Modal from '../../components/common/Modal';
import { useState } from 'react';
import Input from '../../components/common/Input'
import periodosController from '../../firebase/controllers/periodos.controller';
import { useAtomValue, useSetAtom } from 'jotai';
import atoms from '../../jotai/atoms';
import toast from '../../functions/toast';
import { LoaderIcon } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import formatearRangoSemanal from '../../functions/formatearRangoSemanal';
import { validateProgram } from '../../functions/programHelpers';
import Tablero from '../../components/dashboard/Tablero';

export default function Programs() {

	// Store
	const congregacion = useAtomValue(atoms.congregacion)
	const programas = useAtomValue(atoms.programas)
	const setPeriodo = useSetAtom(atoms.periodo)
	const reuniones = useAtomValue(atoms.reuniones)

	//States
	const [selected, setSelected] = useState(null)
	const [dialogAgregar, setDialogAgregar] = useState(false)
	const [periodoText, setPeriodoText] = useState("")
	const [sending, setSending] = useState(false)
	const [modalBorrar, setModalBorrar] = useState(false)
	const [exportingPdf, setExportingPdf] = useState(false)

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
	const exportarPeriodoPdf = async () => {
		if (!selected || reunionesDelPeriodo.length === 0) return

		setExportingPdf(true)
		try {
			const nombreArchivo = `Programa VMC - ${selected.periodo}`
			if (window.desktopAPI?.exportPeriodPdf) {
				const result = await window.desktopAPI.exportPeriodPdf(nombreArchivo)
				if (!result.canceled) toast.success("El programa se exportó correctamente a PDF")
				return
			}

			if (document.fonts?.ready) await document.fonts.ready
			await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

			const tituloOriginal = document.title
			document.title = nombreArchivo
			try {
				window.print()
			}
			finally {
				document.title = tituloOriginal
			}
		}
		catch (error) {
			toast.error(error?.message || "No se pudo exportar el programa a PDF")
		}
		finally {
			setExportingPdf(false)
		}
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
	const reunionesDelPeriodo = selected
		? reuniones
			.filter(reunion => reunion.periodo === selected.id)
			.sort((a, b) => a.fecha.localeCompare(b.fecha))
			.map(reunion => ({
				...reunion,
				advertencias: validateProgram(reunion, congregacion),
			}))
		: []

	const reunionesCompletas = reunionesDelPeriodo.filter(reunion => reunion.advertencias.length === 0).length
	const reunionesPendientes = reunionesDelPeriodo.length - reunionesCompletas
	const paginasImpresion = reunionesDelPeriodo.reduce((paginas, reunion, index) => {
		if (index % 2 === 0) paginas.push([reunion])
		else paginas[paginas.length - 1].push(reunion)
		return paginas
	}, [])

	return (
		<>
			<div className="p-3 sm:p-4 no-print">
				<h1 className="text-2xl" >Programas</h1>
			</div>
			<div className='flex flex-col xl:flex-row periodos no-print gap-3 sm:gap-4 px-3 sm:px-4 pb-4'>
				<div className="w-full xl:max-w-sm">
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
									<div className="flex flex-col items-center justify-center gap-5 p-8 sm:p-16 text-center">
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
														px-4 py-2 rounded-lg shadow-md bg-purple-50 
                        		border hover:border-purple-300 cursor-pointer
												 		flex items-center justify-between
														${selected && selected.id === programa.id
															? "bg-purple-100 border-purple-500"
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

				<div className="w-full min-w-0 xl:max-w-3xl">
					{selected &&
						<div className="w-full">
							<div className="program-actions">
								<div className="program-actions__summary">
									<span className="program-actions__label">Periodo seleccionado</span>
									<strong>{selected.periodo}</strong>
								</div>
								<div className="program-actions__buttons">
									<button
										className="program-actions__button program-actions__button--print"
										onClick={exportarPeriodoPdf}
										disabled={reunionesDelPeriodo.length === 0 || exportingPdf}
										aria-label="Exportar periodo a PDF"
									>
										{exportingPdf
											? <LoaderIcon />
											: <i className="fas fa-file-pdf"></i>
										}
										<span>{exportingPdf ? "Exportando..." : "Exportar PDF"}</span>
									</button>
									<button
										className="program-actions__button program-actions__button--delete"
										onClick={abrirModalBorrar}
										aria-label="Borrar periodo"
									>
										<i className="fas fa-trash"></i>
										<span>Borrar</span>
									</button>
								</div>
							</div>
						</div>
					}
					{
						(programas && programas.length > 0) &&

						<div className="w-full mt-3 sm:mt-4">
							<div className="card w-full">
								{
									selected
										? <>

											<div className="card_title">
												<h2><strong>Reuniones en este periodo:</strong></h2>
											</div>
											<div className="divider"></div>
											{
												reunionesDelPeriodo.length === 0
													? <div className="flex flex-col items-center justify-center gap-3 p-8 sm:p-16 text-center">
														<p>No hay reuniones agregadas en este periodo</p>
														<Link to="/dashboard/reuniones" >
															<button className="btn main">Ir a reuniones</button>
														</Link>
													</div>
													: <div className="flex flex-col gap-4">
														<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
															<div className="rounded-lg border bg-gray-50 p-3 text-center">
																<p className="text-2xl font-bold">{reunionesDelPeriodo.length}</p>
																<p className="text-sm text-gray-600">Reuniones</p>
															</div>
															<div className="rounded-lg border bg-green-50 p-3 text-center">
																<p className="text-2xl font-bold text-green-700">{reunionesCompletas}</p>
																<p className="text-sm text-gray-600">Completas</p>
															</div>
															<div className="rounded-lg border bg-amber-50 p-3 text-center">
																<p className="text-2xl font-bold text-amber-700">{reunionesPendientes}</p>
																<p className="text-sm text-gray-600">Con pendientes</p>
															</div>
														</div>

														<ul className="flex flex-col gap-2 max-h-[420px] overflow-auto">
															{reunionesDelPeriodo.map(reunion => {
																const tienePendientes = reunion.advertencias.length > 0
																return (
																	<li
																		key={reunion.id}
																		className={`rounded-lg border p-3 flex flex-col gap-2 ${tienePendientes ? "bg-amber-50 border-amber-300" : "bg-green-50 border-green-300"}`}
																	>
																		<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
																			<div>
																				<p className="font-semibold">Semana {formatearRangoSemanal(reunion.fecha)}</p>
																				{tienePendientes &&
																					<p className="text-sm text-gray-700">
																						{reunion.advertencias[0]}
																					</p>
																				}
																			</div>
																			<span className={`text-sm font-semibold px-3 py-1 rounded-full w-fit ${tienePendientes ? "bg-amber-200 text-amber-900" : "bg-green-200 text-green-900"}`}>
																				{tienePendientes
																					? `${reunion.advertencias.length} pendiente${reunion.advertencias.length === 1 ? "" : "s"}`
																					: "Completa"}
																			</span>
																		</div>
																	</li>
																)
															})}
														</ul>

														<div className="flex justify-end">
															<Link to="/dashboard/reuniones">
																<button className="btn main">Administrar reuniones</button>
															</Link>
														</div>
													</div>
											}

										</>
										: <div className="flex flex-col items-center justify-center gap-3 p-8 sm:p-16 text-center">
											<p>Selecciona un periodo en la lista para mostrar las reuniones</p>
										</div>
								}
							</div>
						</div>
					}

				</div>


			</div>

			{selected && reunionesDelPeriodo.length > 0 &&
				<section className="period-print">
					{paginasImpresion.map((pagina, pageIndex) => (
						<div
							className={`period-print-page ${pageIndex === 0 ? "period-print-page--first" : ""} ${pagina.length === 1 ? "period-print-page--single" : ""}`}
							key={`print-page-${pageIndex}`}
						>
							{pageIndex === 0 && (
								<div className="program-print-header period-print-header">
									<p className="program-print-congregation">
										{congregacion?.nombre ? `Cong. ${congregacion.nombre}` : "CongregaciÃ³n"}
									</p>
									<h2>Programa para la reuni&oacute;n de entre semana</h2>
								</div>
							)}
							{pagina.map((reunion) => (
								<div className="period-print-meeting" key={reunion.id}>
									<Tablero
										programa={reunion}
										congregacion={congregacion}
										congregacionNombre={congregacion?.nombre}
										showPrintHeader={false}
									/>
								</div>
							))}
						</div>
					))}
				</section>
			}

			{selected && reunionesDelPeriodo.length < 0 &&
				<section className="period-print">
					<div className="program-print-header period-print-header">
						<p className="program-print-congregation">
							{congregacion?.nombre ? `Cong. ${congregacion.nombre}` : "Congregación"}
						</p>
						<h2>Programa para la reuni&oacute;n de entre semana</h2>
					</div>
					<p className="period-print-title">{selected.periodo}</p>
					{reunionesDelPeriodo.map((reunion) => (
						<div className="period-print-meeting" key={reunion.id}>
							<Tablero
								programa={reunion}
								congregacion={congregacion}
								congregacionNombre={congregacion?.nombre}
								showPrintHeader={false}
							/>
						</div>
					))}
				</section>
			}

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
