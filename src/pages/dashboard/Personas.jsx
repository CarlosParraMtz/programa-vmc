import Matriculados from "../../components/dashboard/personas/Matriculados"
import Nombrados from "../../components/dashboard/personas/Nombrados"

export default function Personas() {
  return (
    <>
      <div className="p-3 sm:p-4">
        <h1 className="text-2xl" >Personas</h1>
      </div>

      <div className="flex flex-col xl:flex-row matriculados gap-3 sm:gap-4 px-3 sm:px-4 pb-4">
        <div className="w-full xl:max-w-md">
          <Nombrados/>
        </div>
        <div className="w-full xl:max-w-md">
          <Matriculados />
        </div>
      </div>
    </>
  )
}
