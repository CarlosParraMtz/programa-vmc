import Tablero from "../../components/dashboard/Tablero"
import { useRecoilValue } from "recoil"
import atoms from "../../recoil/atoms"
import { meses } from "../../constants/meses"


export default function ThisWeek() {

	const hoy = new Date()
	const reuniones = useRecoilValue(atoms.reuniones)

	function obtenerRangoSemanaActual() {
		const dia = hoy.getDay(); // 0 (domingo) a 6 (sábado)
		const diffLunes = dia === 0 ? -6 : 1 - dia;

		const lunes = new Date();
		lunes.setDate(hoy.getDate() + diffLunes);
		lunes.setHours(0, 0, 0, 0);

		const domingo = new Date(lunes);
		domingo.setDate(lunes.getDate() + 6);
		domingo.setHours(23, 59, 59, 999);
		console.log(lunes)

		return { inicioSemana: lunes, finSemana: domingo };
	}

	const { inicioSemana, finSemana } = obtenerRangoSemanaActual();
	function filtrarProgramasSemanaActual(programas) {
		if(programas.length == 0) return null;

		return programas.filter(programa => {
			const fechaPrograma = new Date(programa.fecha);
			return fechaPrograma >= inicioSemana && fechaPrograma <= finSemana;
		});
	}

	const estaSemana = filtrarProgramasSemanaActual(reuniones)

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
								Programa para la semana del {inicioSemana.getDate()} de {meses[inicioSemana.getMonth()]} de {inicioSemana.getFullYear()}
							</h2>
						</div>
						<div className="divider"></div>
						{/* <div className="w-full flex justify-center">
							No hay datos todavía
						</div> */}
						{
							estaSemana
							? <Tablero programa={estaSemana} />
							: <p>No se ha agregado un programa para esta semana</p>
						}
					</div>
				</div>
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

			</div>
		</>
	)
}
