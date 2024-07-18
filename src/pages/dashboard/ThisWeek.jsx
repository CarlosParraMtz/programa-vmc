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
		title: 'Busquemos perlas escondidas', 
		section: 1 
	},
	{ name: 'Nahúm González', title: 'Lectura de la Biblia', section: 1 },
	{ name: 'Mish de Parra / Jimena Galván', title: 'Empiece conversaciones', section: 2 },
	{ name: 'Bety de Galván / Jimena Galván', title: 'Empiece conversaciones', section: 2 },
	{ name: '', title: '🎞️ 📽️🎬🎥Informe 4 del cuerpo gobernante', section: 3 },
	{ name: 'Lorenzo Galván', title: 'Estudio bíblico de congregación', section: 3 },

]

export default function ThisWeek() {

	const [sala, setSala] = useState("A")

	return (
		<>
			<div className="p-2.5">
				<h1 className="text-2xl" >Esta semana</h1>
			</div>
			<div className='flex' >
				<div className="w-2/4 p-2.5">
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
				<div className="w-1/4 p-2.5">
					<div className="card p-5">
						<h2>Personas asignadas:</h2>
						<div className="separator"></div>
						<div className="flex flex-col gap-1" >
							{
								programa.map((i, index) =>
									<p key={index} >
										{i.name}
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
