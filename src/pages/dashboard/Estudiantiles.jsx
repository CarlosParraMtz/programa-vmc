import { Link } from "react-router-dom"
import Tooltip from "../../components/common/Tooltip"

export default function Estudiantiles() {
  return (
    <>
      <div className="p-3 sm:p-4">
        <h1 className="text-2xl" >Asignaciones estudiantiles</h1>
      </div>
      <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 px-3 sm:px-4 pb-4">
        <div className="w-full xl:w-1/3">
          <div className="card">
            <div className="card_title">
              <h2><b>Seleccionar reunión:</b></h2>
            </div>
            <div className="divider"></div>
            <div className="p-8 sm:p-16 flex flex-col items-center justify-center gap-5 text-center">
              <p>No hay reuniones agregadas a este periodo.</p>
              <Link to="/dashboard/reuniones" >
                <button className="btn main">Ir a reuniones</button>
              </Link>
            </div>
          </div>
        </div>

        <div className="w-full xl:w-2/3">
          <div className="w-full">
            <div className="card flex">
              <Tooltip title="Editar" >
                <button className="icon-button xl">
                  <i className="fas fa-edit"></i>
                </button>
              </Tooltip>
            </div>
          </div>

          <div className="w-full mt-3 sm:mt-4">
            <div className="card">
              <div className="card_title">
                <h2><b>Detalles:</b></h2>
              </div>
              <div className="divider"></div>
              <div className="p-8 sm:p-16 flex flex-col items-center justify-center text-center">
                <p>
                  Selecciona una reunión para ver o editar las asignaciones estudiantiles
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
