import Matriculados from "../../components/dashboard/personas/Matriculados"
import Nombrados from "../../components/dashboard/personas/Nombrados"

export default function Personas() {
  return (
    <>
      <div className="p-2.5">
        <h1 className="text-2xl" >Personas</h1>
      </div>

      <div className="flex matriculados">
        <div className="w-1/3 p-2.5">
          <Nombrados/>
        </div>
        <div className="w-1/3 p-2.5">
          <Matriculados />
        </div>
      </div>
    </>
  )
}
