import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import Tablero from "../components/dashboard/Tablero";
import formatearRangoSemanal from "../functions/formatearRangoSemanal";
import { getPersonName } from "../functions/programHelpers";
import getDia from "../functions/getDia";
import getLunesAnterior from "../functions/getLunesAnterior";

function parseLocalDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value.seconds) return new Date(value.seconds * 1000);

  const dateOnly = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getWeekKey(value) {
  const date = parseLocalDate(value);
  return date ? getDia(getLunesAnterior(date)) : null;
}

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
    setSemanaSeleccionada(nuevaSemana);
    setSearchParams({ semana: nuevaSemana });
  };

  const volverAEstaSemana = () => {
    const semanaActual = getWeekKey(new Date());
    setSemanaSeleccionada(semanaActual);
    setSearchParams({});
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
          <button className="btn gray" onClick={volverAEstaSemana}>
            Volver a esta semana
          </button>
          <button className="public-program__nav-button" onClick={() => cambiarSemana(1)} aria-label="Semana siguiente">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

      </div>

      <section className="public-program__sheet">
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

        {programa && (
          <footer className="public-program__footer">
            {getPersonName(programa.oracionFinal) &&
              <p><strong>Oracion final:</strong> {getPersonName(programa.oracionFinal)}</p>
            }
          </footer>
        )}
        <div className="w-full flex items-center justify-center">
          <button className="btn main" onClick={() => window.print()}>
            <i className="fas fa-print mr-2"></i>
            Imprimir
          </button>
        </div>
      </section>
    </main>
  );
}
