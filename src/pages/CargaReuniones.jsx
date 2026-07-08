import { useEffect, useState } from "react";
import Tablero from "../components/dashboard/Tablero";
import TableroEdicion from "../components/dashboard/TableroEdicion";
import Modal from '../components/common/Modal'
import datareunionesController from "../firebase/controllers/datareuniones.controller";
import { LoaderIcon } from "react-hot-toast";
import formatearRangoSemanal from "../functions/formatearRangoSemanal";
import { parseMwbPdf } from "../functions/mwbPdfParser";
import getDia from "../functions/getDia";
import getLunesAnterior from "../functions/getLunesAnterior";

function normalizarFechaReunion(reunion) {
  if (!reunion?.fecha) return { ...reunion };
  return {
    ...reunion,
    fecha: getDia(getLunesAnterior(reunion.fecha)),
  };
}

function normalizarFechasReuniones(reuniones) {
  return reuniones.map((reunion) => normalizarFechaReunion(reunion));
}

export default function CargaReuniones() {
  const [jsonInput, setJsonInput] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [reuniones, setReuniones] = useState([]);
  const [reunionesGuardadas, setReunionesGuardadas] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [edicion, setEdicion] = useState(null);
  const [modalBorrar, setModalBorrar] = useState(null);
  const [modalBorrarSeleccionadas, setModalBorrarSeleccionadas] = useState(false);
  const [modalGuardar, setModalGuardar] = useState(false);
  const [modalAdvertencia, setModalAdvertencia] = useState(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false);

  const abrirModalGuardar = () => setModalGuardar(true)
  const cerrarModalGuardar = () => setModalGuardar(false)

  const handleJsonChange = (e) => {
    setJsonInput(e.target.value);
  };

  const cargarReunionesGuardadas = async () => {
    setLoading(true);
    try {
      const data = await datareunionesController.getAllDataReuniones();
      setReunionesGuardadas(data);
      setSeleccionadas((actuales) => actuales.filter((id) => data.some((reunion) => reunion.id === id)));
      setSeleccion((actual) => {
        if (!actual) return data[0] || null;
        return data.find((reunion) => reunion.id === actual.id) || data[0] || null;
      });
    } catch (error) {
      console.error(error);
      setModalAdvertencia(`No se pudieron cargar las reuniones: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page === 1) cargarReunionesGuardadas();
  }, [page]);

  const handleParseJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const reunionesNormalizadas = normalizarFechasReuniones(parsed);
      setReuniones(reunionesNormalizadas);
      setJsonInput(JSON.stringify(reunionesNormalizadas, null, 2));
    } catch (error) {
      console.error("Error al parsear el JSON:", error);
      alert("El JSON no es válido");
    }
  };

  const handlePdfChange = (e) => {
    setPdfFile(e.target.files?.[0] || null);
  };

  const handleParsePdf = async () => {
    if (!pdfFile) {
      setModalAdvertencia("Selecciona un PDF primero.");
      return;
    }

    setLoading(true);
    try {
      const parsed = normalizarFechasReuniones(await parseMwbPdf(pdfFile));
      if (parsed.length === 0) {
        setModalAdvertencia("No pude encontrar reuniones en este PDF.");
        return;
      }
      setReuniones(parsed);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setModalAdvertencia(`Se prepararon ${parsed.length} reuniones desde el PDF.`);
    } catch (error) {
      console.error(error);
      setModalAdvertencia(`No se pudo leer el PDF: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setJsonInput("");
    setPdfFile(null);
    setReuniones([]);
  };


  async function guardar() {
    if (reuniones.length === 0) {
      setModalAdvertencia("No hay reuniones cargadas para guardar.")
      return
    }

    setLoading(true)
    try {
      const reunionesNormalizadas = normalizarFechasReuniones(reuniones);
      await Promise.all(reunionesNormalizadas.map(reunion => datareunionesController.createDataReunion({ ...reunion })))
      handleClear()
      await cargarReunionesGuardadas()
      setModalGuardar(false)
      setModalAdvertencia("✅ Se han guardado con éxito los datos de las reuniones")
    } catch (e) {
      setModalAdvertencia(e)
    }
    setLoading(false)

  }

  const abrirEditar = (reunion) => {
    const { id, ...payload } = reunion;
    setEdicion({ id, ...structuredClone(payload) });
  };

  const toggleSeleccionada = (id) => {
    setSeleccionadas((actuales) => (
      actuales.includes(id)
        ? actuales.filter((actualId) => actualId !== id)
        : [...actuales, id]
    ));
  };

  const limpiarSeleccionadas = () => setSeleccionadas([]);

  const guardarEdicion = async () => {
    if (!edicion?.id) return;

    setLoading(true);
    try {
      const { id, ...payload } = edicion;
      const reunionNormalizada = normalizarFechaReunion(payload);
      await datareunionesController.updateDataReunion(JSON.parse(JSON.stringify(reunionNormalizada)), id);
      await cargarReunionesGuardadas();
      setSeleccion({ id, ...reunionNormalizada });
      setEdicion(null);
      setModalAdvertencia("Se actualizó la reunión correctamente.");
    } catch (error) {
      console.error(error);
      setModalAdvertencia(`No se pudo actualizar la reunión: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const borrarReunion = async () => {
    if (!modalBorrar?.id) return;

    setLoading(true);
    try {
      await datareunionesController.deleteReunion(modalBorrar.id);
      setModalBorrar(null);
      setSeleccionadas((actuales) => actuales.filter((id) => id !== modalBorrar.id));
      await cargarReunionesGuardadas();
      setModalAdvertencia("Se borró la reunión correctamente.");
    } catch (error) {
      console.error(error);
      setModalAdvertencia(`No se pudo borrar la reunión: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const borrarReunionesSeleccionadas = async () => {
    if (seleccionadas.length === 0) return;

    setLoading(true);
    try {
      await Promise.all(seleccionadas.map((id) => datareunionesController.deleteReunion(id)));
      setModalBorrarSeleccionadas(false);
      limpiarSeleccionadas();
      await cargarReunionesGuardadas();
      setModalAdvertencia("Se borraron las reuniones seleccionadas correctamente.");
    } catch (error) {
      console.error(error);
      setModalAdvertencia(`No se pudieron borrar las reuniones seleccionadas: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className={`${page === 1 ? "max-w-7xl" : "max-w-2xl"} mx-auto p-4 space-y-8`}>
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
                <div className="rounded-lg border border-dashed border-purple-300 bg-purple-50 p-4">
                  <label htmlFor="programa-pdf-input" className="block font-semibold text-gray-800">
                    Cargar desde PDF
                  </label>
                  <input
                    id="programa-pdf-input"
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfChange}
                    className="mt-2 block w-full text-sm"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleParsePdf}
                      className="btn main"
                      disabled={!pdfFile || loading}
                    >
                      {loading ? <LoaderIcon /> : "Convertir PDF"}
                    </button>
                    {pdfFile && <p className="text-sm text-gray-600">{pdfFile.name}</p>}
                  </div>
                </div>
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
              ) : reuniones.map((reunion, i) => {
                return <Tablero key={i} programa={reunion} />
              })}
            </>
          }

          {page === 1 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">Reuniones guardadas</h1>
                <div className="flex flex-wrap justify-end gap-2">
                  {seleccionadas.length > 0 && (
                    <>
                      <button className="btn error" onClick={() => setModalBorrarSeleccionadas(true)} disabled={loading}>
                        Borrar seleccionadas ({seleccionadas.length})
                      </button>
                      <button className="btn" onClick={limpiarSeleccionadas} disabled={loading}>
                        Limpiar selección
                      </button>
                    </>
                  )}
                  <button className="btn main" onClick={cargarReunionesGuardadas} disabled={loading}>
                    {loading ? <LoaderIcon /> : "Actualizar"}
                  </button>
                </div>
              </div>

              {loading && reunionesGuardadas.length === 0 ? (
                <div className="flex justify-center p-5"><LoaderIcon /></div>
              ) : reunionesGuardadas.length === 0 ? (
                <p className="text-gray-500">No hay reuniones guardadas.</p>
              ) : (
                <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                  <ul className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto pr-2">
                    {reunionesGuardadas.map((reunion) => (
                      <li key={reunion.id}>
                        <div className={`flex items-start gap-2 rounded-lg border p-3 hover:bg-purple-50 ${seleccion?.id === reunion.id ? "border-purple-600 bg-purple-100" : "border-gray-200 bg-white"}`}>
                          <input
                            type="checkbox"
                            checked={seleccionadas.includes(reunion.id)}
                            onChange={() => toggleSeleccionada(reunion.id)}
                            className="mt-1 h-4 w-4 accent-purple-600"
                            aria-label={`Seleccionar reunión de la semana ${formatearRangoSemanal(reunion.fecha)}`}
                          />
                          <button
                            className="flex-1 text-left"
                            onClick={() => setSeleccion(reunion)}
                          >
                            <p className="font-semibold">Semana {formatearRangoSemanal(reunion.fecha)}</p>
                            <p className="text-sm text-gray-500">{reunion.asignaciones?.length || 0} asignaciones</p>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3">
                    {seleccion && (
                      <>
                        <div className="flex flex-wrap justify-end gap-2">
                          <button className="btn main" onClick={() => abrirEditar(seleccion)}>
                            Editar
                          </button>
                          <button className="btn error" onClick={() => setModalBorrar(seleccion)}>
                            Borrar
                          </button>
                        </div>
                        <Tablero programa={seleccion} />
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

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
                    <p>{formatearRangoSemanal(fecha)}</p>
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

      <Modal id="modal-editar-reunion" title="Editar reunión" size="xl4" open={edicion != null} onClose={() => setEdicion(null)} >
        {edicion && (
          <div className="space-y-5">
            <div>
              <label htmlFor="editar-reunion-fecha" className="block text-sm font-medium text-gray-900">
                Fecha
              </label>
              <input
                id="editar-reunion-fecha"
                type="date"
                value={edicion.fecha || ""}
                onChange={(e) => setEdicion({ ...edicion, fecha: e.target.value })}
                className="block w-full rounded-full border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:outline-purple-500"
              />
            </div>

            <TableroEdicion useReunion={[edicion, setEdicion]} />

            <div className="flex justify-end gap-3">
              <button className="btn error" onClick={() => setEdicion(null)} disabled={loading}>Cancelar</button>
              <button className="btn main" onClick={guardarEdicion} disabled={loading}>
                {loading ? <LoaderIcon /> : "Guardar cambios"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal id="modal-borrar-reunion" title="Borrar reunión" open={modalBorrar != null} onClose={() => setModalBorrar(null)} >
        {modalBorrar && (
          <>
            <p className="text-lg">
              Se borrará la reunión de la semana {formatearRangoSemanal(modalBorrar.fecha)}.
            </p>
            <p className="mt-2 text-sm text-gray-600">Esta acción no se puede deshacer.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button className="btn main" onClick={() => setModalBorrar(null)} disabled={loading}>Cancelar</button>
              <button className="btn error" onClick={borrarReunion} disabled={loading}>
                {loading ? <LoaderIcon /> : "Borrar"}
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal id="modal-borrar-reuniones-seleccionadas" title="Borrar reuniones" open={modalBorrarSeleccionadas} onClose={() => setModalBorrarSeleccionadas(false)} >
        <>
          <p className="text-lg">
            Se borrarán {seleccionadas.length} reuniones seleccionadas.
          </p>
          <p className="mt-2 text-sm text-gray-600">Esta acción no se puede deshacer.</p>
          <div className="mt-5 flex justify-end gap-3">
            <button className="btn main" onClick={() => setModalBorrarSeleccionadas(false)} disabled={loading}>Cancelar</button>
            <button className="btn error" onClick={borrarReunionesSeleccionadas} disabled={loading || seleccionadas.length === 0}>
              {loading ? <LoaderIcon /> : "Borrar seleccionadas"}
            </button>
          </div>
        </>
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
