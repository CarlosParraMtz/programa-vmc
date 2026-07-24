import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import toast, { LoaderIcon } from "react-hot-toast";
import { db } from "../firebase/config";
import Tablero from "../components/dashboard/Tablero";
import formatearRangoSemanal from "../functions/formatearRangoSemanal";
import { downloadStudentAssignmentCardsPng } from "../functions/studentAssignmentCards";
import { getWeekKey, parseLocalDate } from "../functions/meetingDates";
import getDia from "../functions/getDia";
import getLunesAnterior from "../functions/getLunesAnterior";

function addWeeks(value, weeks) {
  const date = parseLocalDate(value);
  if (!date) return getWeekKey(new Date());
  date.setDate(date.getDate() + weeks * 7);
  return getDia(getLunesAnterior(date));
}

export default function ProgramaPublico() {
  const { congregacionId, reunionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [semanaParamInicial] = useState(() => searchParams.get("semana"));
  const [programa, setPrograma] = useState(null);
  const [reuniones, setReuniones] = useState([]);
  const [congregacion, setCongregacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [direccion, setDireccion] = useState(0);
  const [generandoAsignaciones, setGenerandoAsignaciones] = useState(false);
  const [preparandoImpresion, setPreparandoImpresion] = useState(false);
  const reducirMovimiento = useReducedMotion();
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(() => {
    const semanaParam = searchParams.get("semana");
    return getWeekKey(semanaParam) || getWeekKey(new Date());
  });

  useEffect(() => {
    async function cargarPrograma() {
      setLoading(true);
      setError("");
      try {
        const [reunionesSnap, congregacionSnap] = await Promise.all([
          getDocs(collection(db, `congregaciones/${congregacionId}/reuniones`)),
          getDoc(doc(db, "congregaciones", congregacionId)),
        ]);

        const reunionesCargadas = reunionesSnap.docs.map((documento) => ({ ...documento.data(), id: documento.id }));
        const reunionInicial = reunionId ? reunionesCargadas.find((item) => item.id === reunionId) : null;

        setReuniones(reunionesCargadas);
        if (!semanaParamInicial && reunionInicial) {
          setSemanaSeleccionada(getWeekKey(reunionInicial.fecha) || getWeekKey(new Date()));
        }
        setCongregacion(congregacionSnap.exists() ? congregacionSnap.data() : null);
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar el programa.");
      } finally {
        setLoading(false);
      }
    }

    cargarPrograma();
  }, [congregacionId, reunionId, semanaParamInicial]);

  useEffect(() => {
    const semanaParam = searchParams.get("semana");
    if (semanaParam) {
      setSemanaSeleccionada(getWeekKey(semanaParam) || getWeekKey(new Date()));
    }
  }, [searchParams]);

  useEffect(() => {
    setPrograma(reuniones.find((item) => getWeekKey(item.fecha) === semanaSeleccionada) || null);
  }, [reuniones, semanaSeleccionada]);

  const cambiarSemana = (weeks) => {
    const nuevaSemana = addWeeks(semanaSeleccionada, weeks);
    setDireccion(Math.sign(weeks));
    setSemanaSeleccionada(nuevaSemana);
    setSearchParams({ semana: nuevaSemana });
  };

  const volverAEstaSemana = () => {
    const semanaActual = getWeekKey(new Date());
    setDireccion(semanaActual > semanaSeleccionada ? 1 : -1);
    setSemanaSeleccionada(semanaActual);
    setSearchParams({});
  };

  const reunionesDelPeriodo = programa?.periodo
    ? reuniones
      .filter((reunion) => reunion.periodo === programa.periodo)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
    : [];

  const paginasImpresion = reunionesDelPeriodo.reduce((paginas, reunion, index) => {
    if (index % 2 === 0) paginas.push([reunion]);
    else paginas[paginas.length - 1].push(reunion);
    return paginas;
  }, []);

  const descargarAsignaciones = async () => {
    if (!programa || !congregacion) return;
    setGenerandoAsignaciones(true);
    try {
      const total = await downloadStudentAssignmentCardsPng(programa, congregacion);
      if (total === 0) {
        toast.error("No hay asignaciones estudiantiles para generar");
        return;
      }
      toast.success(`Se generaron ${total} PNG en un archivo ZIP`);
    } catch (e) {
      console.error(e);
      toast.error("No se pudieron generar las hojas de asignación");
    } finally {
      setGenerandoAsignaciones(false);
    }
  };

  const imprimirPeriodo = async () => {
    if (reunionesDelPeriodo.length === 0) return;
    setPreparandoImpresion(true);
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      window.print();
    } finally {
      setPreparandoImpresion(false);
    }
  };

  if (loading) {
    return <div className="public-program"><p>Cargando programa...</p></div>;
  }

  if (error) {
    return (
      <div className="public-program">
        <div className="public-program__sheet">
          <p>{error}</p>
          <Link to="/dashboard">Ir al dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="public-program">
      <div className="public-program__actions no-print">
        <div className="public-program__week-controls">
          <button className="public-program__nav-button" onClick={() => cambiarSemana(-1)} aria-label="Semana anterior">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="btn bg-gray-100 hover:bg-white" onClick={volverAEstaSemana}>
            Volver a esta semana
          </button>
          <button className="public-program__nav-button" onClick={() => cambiarSemana(1)} aria-label="Semana siguiente">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

      </div>

      <AnimatePresence initial={false} mode="wait" custom={direccion}>
      <motion.section
        className="public-program__sheet public-program__screen"
        key={semanaSeleccionada}
        custom={direccion}
        variants={{
          enter: (direction) => ({ x: reducirMovimiento ? 0 : direction * 72, opacity: 0 }),
          center: { x: 0, opacity: 1 },
          exit: (direction) => ({ x: reducirMovimiento ? 0 : direction * -72, opacity: 0 }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: reducirMovimiento ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="public-program__header">
          <p>{congregacion?.nombre ? `Cong. ${congregacion.nombre}` : "Congregacion"}</p>
          <h1>Programa para la reunion de entre semana</h1>
          <h2>Semana {formatearRangoSemanal(semanaSeleccionada)}</h2>
        </header>

        {programa ? (
          <Tablero programa={programa} congregacion={congregacion} congregacionNombre={congregacion?.nombre} />
        ) : (
          <div className="public-program__empty">
            <i className="fas fa-calendar-xmark"></i>
            <p>No hay una reunion programada para esta semana.</p>
            <span>Puedes seguir navegando a semanas anteriores o siguientes.</span>
          </div>
        )}

        {programa &&
          <footer className="public-program__footer no-print">
            <button
              className="btn main"
              type="button"
              onClick={imprimirPeriodo}
              disabled={preparandoImpresion || reunionesDelPeriodo.length === 0}
            >
              {preparandoImpresion
                ? <LoaderIcon />
                : <i className="fas fa-print" aria-hidden="true"></i>
              }
              <span>{preparandoImpresion ? "Preparando..." : "Imprimir periodo"}</span>
            </button>
            <button
              className="btn main"
              type="button"
              onClick={descargarAsignaciones}
              disabled={generandoAsignaciones}
            >
              {generandoAsignaciones
                ? <LoaderIcon />
                : <i className="fas fa-id-badge" aria-hidden="true"></i>
              }
              <span>{generandoAsignaciones ? "Generando..." : "Hojas de asignación"}</span>
            </button>
          </footer>
        }
      </motion.section>
      </AnimatePresence>

      {paginasImpresion.length > 0 &&
        <section className="period-print public-period-print">
          {paginasImpresion.map((pagina, pageIndex) => (
            <div
              className={`period-print-page ${pageIndex === 0 ? "period-print-page--first" : ""} ${pagina.length === 1 ? "period-print-page--single" : ""}`}
              key={`public-print-page-${pageIndex}`}
            >
              {pageIndex === 0 &&
                <div className="program-print-header period-print-header">
                  <p className="program-print-congregation">
                    {congregacion?.nombre ? `Cong. ${congregacion.nombre}` : "Congregación"}
                  </p>
                  <h2>Programa para la reunión de entre semana</h2>
                </div>
              }
              {pagina.map((reunion) => (
                <div className="period-print-meeting" key={reunion.id}>
                  <Tablero
                    programa={reunion}
                    congregacion={congregacion}
                    congregacionNombre={congregacion?.nombre}
                    showPrintHeader={false}
                  />
                </div>
              ))}
            </div>
          ))}
        </section>
      }
    </main>
  );
}
