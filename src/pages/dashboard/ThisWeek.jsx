import Tablero from "../../components/dashboard/Tablero"
import { useAtomValue } from "jotai"
import atoms from "../../jotai/atoms"
import getLunesAnterior from '../../functions/getLunesAnterior'
import formatearRangoSemanal from "../../functions/formatearRangoSemanal"

export default function ThisWeek() {

	const reuniones = useAtomValue(atoms.reuniones)
	const lunes = getLunesAnterior(new Date())
	const estaSemana = reuniones.find(reunion => reunion.fecha == lunes)
	return (
		<>
			<div className="p-2.5">
				<h1 className="text-2xl" >Esta semana</h1>
			</div>
			<div className='flex flex-col lg:flex-row w-full' >
				<div className="w-full lg:w-3/5 xl:w-2/4 p-2.5">
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
								? <Tablero programa={estaSemana} />
								: <p>No se ha agregado un programa para esta semana</p>
						}
					</div>
				</div>
				{estaSemana &&
					<div className="w-full lg:w-2/5 xl:w-1/4 p-2.5">
						<div className="card p-5">
							<h2>Personas asignadas:</h2>
							<div className="separator"></div>
							<div className="flex flex-col gap-1" >
								{
									estaSemana && estaSemana.map((i, index) =>
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
