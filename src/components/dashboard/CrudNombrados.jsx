import { useAtomValue } from "jotai"
import atoms from "../../jotai/atoms"
import NombradoCollapse from "./personas/NombradoCollapse"


export default function CrudNombrados({ agregarNombrado }) {
  const nombrados = useAtomValue(atoms.nombrados)

  return (
    <div className="max-w-4xl max-h-[60vh] overflow-auto flex flex-col gap-2">

      {
        nombrados.map(nombrado => 
        <NombradoCollapse nombrado={nombrado} key={nombrado.id} onAdd={agregarNombrado} />)
      }

    </div>
  )
}
