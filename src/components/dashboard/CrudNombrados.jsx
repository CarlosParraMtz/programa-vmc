import { useAtomValue } from "jotai"
import atoms from "../../jotai/atoms"
import NombradoCollapse from "./personas/NombradoCollapse"
import { puedePasarTipoNombrado } from "../../constants/tiposAsignacionNombrado"


export default function CrudNombrados({ agregarNombrado, tipoAsignacionPermitida = null, opcionesExtra = [] }) {
  const nombrados = useAtomValue(atoms.nombrados)
  const nombradosFiltrados = [...opcionesExtra, ...nombrados]
    .filter((nombrado) => puedePasarTipoNombrado(nombrado, tipoAsignacionPermitida))

  return (
    <div className="max-w-4xl max-h-[60vh] overflow-auto flex flex-col gap-2">

      {
        nombradosFiltrados.map(nombrado => 
        <NombradoCollapse nombrado={nombrado} key={nombrado.id} onAdd={agregarNombrado} />)
      }
      {nombradosFiltrados.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No se encontraron resultados para esta asignación
        </div>
      )}

    </div>
  )
}
