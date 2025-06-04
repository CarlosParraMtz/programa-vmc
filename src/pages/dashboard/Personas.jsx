import Matriculados from "../../components/dashboard/personas/Matriculados"
import Nombrados from "../../components/dashboard/personas/Nombrados"

export default function Personas() {
  return (
    <>
      <div className="p-2.5">
        <h1 className="text-2xl" >Personas</h1>
      </div>

      <div className="flex flex-col md:flex-row matriculados">
        <div className="w-full max-w-md p-2.5">
          <Nombrados/>
        </div>
        <div className="w-full max-w-md p-2.5">
          <Matriculados />
        </div>
      </div>
    </>
  )
}
