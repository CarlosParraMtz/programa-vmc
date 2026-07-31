import { useAtomValue } from "jotai"
import { useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"
import Tablero from "../../components/dashboard/Tablero"
import atoms from "../../jotai/atoms"
import getDia from "../../functions/getDia"
import formatearRangoSemanal from "../../functions/formatearRangoSemanal"
import { getWeekKey, parseLocalDate } from "../../functions/meetingDates"
import { getCurrentWeekPublicProgramUrl, getPublicProgramUrl } from "../../functions/programHelpers"

function addWeeks(value, weeks) {
	const date = parseLocalDate(value)
	if (!date) return getWeekKey(new Date())
	date.setDate(date.getDate() + weeks * 7)
	return getWeekKey(date)
}

function getDateInputValue(value) {
	const date = parseLocalDate(value)
	return date ? getDia(date) : ""
}

export default function ThisWeek() {
	const reuniones = useAtomValue(atoms.reuniones) || []
	const congregacion = useAtomValue(atoms.congregacion)
	const [searchParams, setSearchParams] = useSearchParams()
	const semanaActual = getWeekKey(new Date())
	const semanaSeleccionada = getWeekKey(searchParams.get("semana")) || semanaActual
	const reunionSeleccionada = reuniones.find(reunion => getWeekKey(reunion.fecha) === semanaSeleccionada)
	const fechaSelector = getDateInputValue(reunionSeleccionada?.fecha || semanaSeleccionada)

	const cambiarSemana = (weeks) => {
		setSearchParams({ semana: addWeeks(semanaSeleccionada, weeks) })
	}

	const volverAEstaSemana = () => {
		setSearchParams({})
	}

	const irAFecha = (event) => {
		const semana = getWeekKey(event.target.value)
		if (semana === semanaActual) {
			setSearchParams({})
			return
		}
		if (semana) setSearchParams({ semana })
	}

	const compartirEnlacePrograma = async () => {
		if (!congregacion?.id) return
		const url = reunionSeleccionada?.id
			? getPublicProgramUrl(congregacion.id, reunionSeleccionada.id)
			: getCurrentWeekPublicProgramUrl(congregacion.id)
		try {
			if (navigator.share) {
				await navigator.share({
					title: "Programa de la congregación",
					text: "Programa de la reunión de entre semana",
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
			<div className="dashboard-page-header">
				<div className="dashboard-page-heading">
					<h1>Reuniones programadas</h1>
					<p>Consulta reuniones anteriores o futuras y comparte el programa.</p>
				</div>
				{congregacion?.id &&
					<button className="btn main w-full sm:w-auto" onClick={compartirEnlacePrograma}>
						<i className="fas fa-paper-plane mr-2"></i>
						Compartir enlace del programa
					</button>
				}
			</div>

			<div className="scheduled-meetings-toolbar" aria-label="Navegación por semanas">
				<div className="public-program__week-controls">
					<button
						className="public-program__nav-button"
						type="button"
						onClick={() => cambiarSemana(-1)}
						aria-label="Semana anterior"
					>
						<i className="fas fa-chevron-left" aria-hidden="true"></i>
					</button>
					<button className="btn bg-gray-100 hover:bg-white" type="button" onClick={volverAEstaSemana}>
						Volver a esta semana
					</button>
					<button
						className="public-program__nav-button"
						type="button"
						onClick={() => cambiarSemana(1)}
						aria-label="Semana siguiente"
					>
						<i className="fas fa-chevron-right" aria-hidden="true"></i>
					</button>
				</div>

				<label className="scheduled-meetings-date-picker">
					<span>Ir a la fecha</span>
					<input type="date" value={fechaSelector} onChange={irAFecha} />
				</label>
			</div>

			<div className="flex flex-col lg:flex-row w-full gap-3 sm:gap-4 px-3 sm:px-4 pb-4">
				<div className="w-full lg:w-3/5 xl:w-2/4">
					<div className="card">
						<div className="card_title">
							<h2>Programa para la semana {formatearRangoSemanal(semanaSeleccionada)}</h2>
						</div>
						<div className="divider"></div>
						{reunionSeleccionada
							? <Tablero programa={reunionSeleccionada} congregacion={congregacion} congregacionNombre={congregacion?.nombre} />
							: <p>No se ha agregado un programa para esta semana.</p>
						}
					</div>
				</div>
			</div>
		</>
	)
}
