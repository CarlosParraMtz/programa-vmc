import { Link } from "react-router-dom"
import Tooltip from "../../components/common/Tooltip"

export default function Estudiantiles() {
  return (
    <>
      <div className="p-2.5">
        <h1 className="text-2xl" >Asignaciones estudiantiles</h1>
      </div>
      <div className="flex">
        <div className="w-1/3 p-2.5">
          <div className="card">
            <div className="card_title">
              <h2><b>Seleccionar reunión:</b></h2>
            </div>
            <div className="divider"></div>
            <div className="p-16 flex flex-col items-center justify-center gap-5">
              <p>No hay reuniones agregadas a este periodo.</p>
              <Link to="/dashboard/reuniones" >
                <button className="main-button">Ir a reuniones</button>
              </Link>
            </div>
          </div>
        </div>

        <div className="w-2/3">
          <div className="w-full p-2.5">
            <div className="card flex">
              <Tooltip title="Editar" >
                <button className="icon-button xl">
                  <i className="fas fa-edit"></i>
                </button>
              </Tooltip>
            </div>
          </div>

          <div className="w-full p-2.5">
            <div className="card">
              <div className="card_title">
                <h2><b>Detalles:</b></h2>
              </div>
              <div className="divider"></div>
              <div className="p-16 flex flex-col items-center justify-center">
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
