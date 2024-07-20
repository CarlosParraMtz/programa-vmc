import Tablero from "../../components/dashboard/Tablero"
import { useState } from "react"

const programa = [
	{ 
		nombre: 'Carlos Parra', 
		titulo: '“Tu amor leal es mejor que la vida”', 
		seccion: 1,
		sala: "A", 
	},
	{ 
		nombre: 'Ubaldo Melchor', 
		titulo: 'Busquemos perlas escondidas', 
		seccion: 1 
	},
	{ nombre: 'Nahúm González', titulo: 'Lectura de la Biblia', seccion: 1 },
	{ nombre: 'Mish de Parra / Jimena Galván', titulo: 'Empiece conversaciones', seccion: 2 },
	{ nombre: 'Bety de Galván / Jimena Galván', titulo: 'Empiece conversaciones', seccion: 2 },
	{ nombre: '', titulo: '🎞️ 📽️🎬🎥Informe 4 del cuerpo gobernante', seccion: 3 },
	{ nombre: 'Lorenzo Galván', titulo: 'Estudio bíblico de congregación', seccion: 3 },

]

export default function ThisWeek() {

	const [sala, setSala] = useState("A")

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
								Programa para el 22 de julio de 2023
							</h2>
						</div>
						<div className="divider"></div>
						{/* <div className="w-full flex justify-center">
							No hay datos todavía
						</div> */}

						<Tablero programa={programa} sala={sala} />
					</div>
				</div>
				<div className="w-full lg:w-2/5 xl:w-1/4 p-2.5">
					<div className="card p-5">
						<h2>Personas asignadas:</h2>
						<div className="separator"></div>
						<div className="flex flex-col gap-1" >
							{
								programa.map((i, index) =>
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
