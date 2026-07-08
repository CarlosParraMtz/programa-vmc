import Tablero from "../../components/dashboard/Tablero"
import { useAtomValue } from "jotai"
import atoms from "../../jotai/atoms"
import getLunesAnterior from '../../functions/getLunesAnterior'
import getDia from "../../functions/getDia"
import formatearRangoSemanal from "../../functions/formatearRangoSemanal"
import toast from "react-hot-toast"
import { getCurrentWeekPublicProgramUrl } from "../../functions/programHelpers"

function parseLocalDate(value) {
	if (!value) return null
	if (value instanceof Date) return value
	if (value.seconds) return new Date(value.seconds * 1000)

	const dateOnly = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/)
	if (dateOnly) {
		const [, year, month, day] = dateOnly
		return new Date(Number(year), Number(month) - 1, Number(day))
	}

	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? null : date
}

function getWeekKey(value) {
	const date = parseLocalDate(value)
	return date ? getDia(getLunesAnterior(date)) : null
}

export default function ThisWeek() {

	const reuniones = useAtomValue(atoms.reuniones)
	const congregacion = useAtomValue(atoms.congregacion)
	const hoy = new Date()
	const lunes = getLunesAnterior(hoy)
	const fechaLunes = getDia(lunes)
	const estaSemana = reuniones.find(reunion => getWeekKey(reunion.fecha) === fechaLunes)
	const asignaciones = estaSemana?.asignaciones?.filter(asignacion => asignacion.nombre) || []

	const compartirEnlacePrograma = async () => {
		if (!congregacion?.id) return
		const url = getCurrentWeekPublicProgramUrl(congregacion.id)
		try {
			if (navigator.share) {
				await navigator.share({
					title: "Programa de la congregacion",
					text: "Programa de la reunion de entre semana",
					url,
				})
				return
			}

			await navigator.clipboard.writeText(url)
			toast.success("Enlace del programa copiado")
		} catch (error) {
			if (error?.name === "AbortError") return
			window.prompt("Copia el enlace del programa", url)
		}
	}

	return (
		<>
			<div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<h1 className="text-2xl" >Esta semana</h1>
				{congregacion?.id &&
					<button className="btn main w-full sm:w-auto" onClick={compartirEnlacePrograma}>
						<i className="fas fa-paper-plane mr-2"></i>
						Compartir enlace del programa
					</button>
				}
			</div>
			<div className='flex flex-col lg:flex-row w-full gap-3 sm:gap-4 px-3 sm:px-4 pb-4' >
				<div className="w-full lg:w-3/5 xl:w-2/4">
					<div className="card">
						<div className="card_title">
							<h2>
								Programa para la semana del {formatearRangoSemanal(lunes)}
							</h2>
						</div>
						<div className="divider"></div>
						{/* <div className="w-full flex justify-center">
							No hay datos todavía
						</div> */}
						{
							estaSemana != null
								? <Tablero programa={estaSemana} congregacion={congregacion} congregacionNombre={congregacion?.nombre} />
								: <p>No se ha agregado un programa para esta semana</p>
						}
					</div>
				</div>
				{estaSemana &&
					<div className="w-full lg:w-2/5 xl:w-1/4">
						<div className="card p-5">
							<h2>Personas asignadas:</h2>
							<div className="separator"></div>
							<div className="flex flex-col gap-1" >
								{
									asignaciones.map((i, index) =>
										<p key={index} >
											{i.nombre}
										</p>
									)
								}
							</div>
						</div>
					</div>
				}

			</div>
		</>
	)
}
