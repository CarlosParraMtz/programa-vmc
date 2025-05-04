import { useState } from "react";
import Tablero from "../components/dashboard/Tablero";
import Modal from '../components/common/Modal'
import { meses } from "../constants/meses";
import datareunionesController from "../firebase/controllers/datareuniones.controller";
import { LoaderIcon } from "react-hot-toast";

export default function CargaReuniones() {
  const [jsonInput, setJsonInput] = useState("");
  const [reuniones, setReuniones] = useState([]);
  const [modalGuardar, setModalGuardar] = useState(false);
  const [modalAdvertencia, setModalAdvertencia] = useState(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false);

  const abrirModalGuardar = () => setModalGuardar(true)
  const cerrarModalGuardar = () => setModalGuardar(false)

  const handleJsonChange = (e) => {
    setJsonInput(e.target.value);
  };

  const handleParseJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setReuniones(parsed);
    } catch (error) {
      alert("El JSON no es válido");
    }
  };

  const handleClear = () => {
    setJsonInput("");
    setReuniones([]);
  };


  async function guardar() {
    if (reuniones.length === 0) {
      setModalAdvertencia("No hay reuniones cargadas para guardar.")
      return
    }

    setLoading(true)
    try {
      await reuniones.forEach(async reunion => {
        await datareunionesController.createDataReunion({ ...reunion, fecha: new Date(reunion.fecha) })
      })
      handleClear()
      setModalGuardar(false)
      setModalAdvertencia("✅ Se han guardado con éxito los datos de las reuniones")
    } catch (e) {
      setModalAdvertencia(e)
    }
    setLoading(false)

  }


  return (
    <>
      <div className="max-w-2xl mx-auto p-4 space-y-8">
        <div className="card" >
          <div className="flex items-center justify-start" >
            <button className={`btn tab ${page === 0 ? "active" : ""}`}
              onClick={() => setPage(0)}
            >
              Cargar
            </button>
            <button className={`btn tab ${page === 1 ? "active" : ""}`}
              onClick={() => setPage(1)}
            >
              ver
            </button>
          </div>
          <hr className="mb-5" ></hr>
          {
            page === 0 && <>
              <h1 className="text-2xl font-bold">Cargar Programa</h1>

              <div className="space-y-2 mb-8">
                <textarea
                  value={jsonInput}
                  onChange={handleJsonChange}
                  placeholder="Pega aquí el JSON..."
                  className="w-full h-48 p-2 border rounded resize-none"
                />
                <div className="space-x-2 flex items-center">
                  {
                    reuniones.length === 0
                      ? <button
                        onClick={handleParseJson}
                        className="btn main"
                      >
                        Preparar reuniones
                      </button>
                      : <>
                        <button
                          onClick={abrirModalGuardar}
                          className="btn main"
                        >
                          Guardar reuniones
                        </button>
                        <button
                          onClick={handleClear}
                          className="btn error"
                        >
                          Limpiar
                        </button>
                      </>
                  }
                </div>
              </div>
              {reuniones.length === 0 ? (
                <p className="text-gray-500">No hay reuniones para mostrar.</p>
              ) : reuniones.map((reunion, i) => <Tablero key={i} programa={reunion} />)}
            </>
          }

          {
            // TODO Falta generar un crud para ver las reuniones que han sido cargadas
          }

        </div>

      </div>


      <Modal id="modal-guardar-reuniones" title="Guardar" open={modalGuardar} onClose={cerrarModalGuardar} >
        {
          loading
            ? <LoaderIcon className="w-full" />
            : <>
              <h3 className="text-xl" >
                Se guardarán las reuniones que tienen las siguientes fechas:
              </h3>
              <ul className="flex flex-col gap-2 my-5" >
                {reuniones.map((reunion, i) => {
                  const fecha = new Date(reunion.fecha)
                  return (<li key={i} className="p-2 rounded bg-purple-200" >
                    <p>Semana del {fecha.getDate()} al {fecha.getDate() + 6} de {meses[fecha.getMonth()]} de {fecha.getFullYear()} </p>
                  </li>)
                })}
              </ul>
              <div className="flex justify-end gap-3" >
                <button className="btn error" onClick={cerrarModalGuardar} >Cancelar</button>
                <button className="btn main" onClick={guardar} >Continuar</button>
              </div>
            </>
        }
      </Modal>

      <Modal id="modal-advertencia-generica"
        title="Advertencia"
        open={modalAdvertencia != null}
        onClose={() => setModalAdvertencia(null)}
      >
        <p className="text-lg" > {modalAdvertencia} </p>
        <div className="flex justify-end" >
          <button className="btn main" onClick={() => setModalAdvertencia(null)} >
            Aceptar
          </button>
        </div>
      </Modal>

    </>
  );
}
