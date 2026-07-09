import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

export default function ProgramaPublico() {
  const { congregacionId, reunionId } = useParams();
  const [programa, setPrograma] = useState(null);
  const [congregacion, setCongregacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarPrograma() {
      setLoading(true);
      setError("");
      try {
        const [programaResultado, congregacionSnap] = await Promise.all([
          reunionId
            ? getDoc(doc(db, `congregaciones/${congregacionId}/reuniones`, reunionId))
            : getDocs(collection(db, `congregaciones/${congregacionId}/reuniones`)),
          getDoc(doc(db, "congregaciones", congregacionId)),
        ]);

        let reunion = null;
        if (reunionId) {
          if (programaResultado.exists()) {
            reunion = { ...programaResultado.data(), id: programaResultado.id };
          }
        } else {
          const semanaActual = getWeekKey(new Date());
          reunion = programaResultado.docs
            .map((documento) => ({ ...documento.data(), id: documento.id }))
            .find((item) => getWeekKey(item.fecha) === semanaActual);
        }

        if (!reunion) {
          setError("No se encontro este programa.");
          return;
        }

        setPrograma(reunion);
        setCongregacion(congregacionSnap.exists() ? congregacionSnap.data() : null);
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar el programa.");
      } finally {
        setLoading(false);
      }
    }

    cargarPrograma();
  }, [congregacionId, reunionId]);

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
        <button className="btn main" onClick={() => window.print()}>
          <i className="fas fa-print mr-2"></i>
          Imprimir
        </button>
      </div>

      <section className="public-program__sheet">
        <header className="public-program__header">
          <p>{congregacion?.nombre ? `Cong. ${congregacion.nombre}` : "Congregacion"}</p>
          <h1>Programa para la reunion de entre semana</h1>
          <h2>Semana {formatearRangoSemanal(programa.fecha)}</h2>
        </header>

        <Tablero programa={programa} congregacion={congregacion} congregacionNombre={congregacion?.nombre} />

        <footer className="public-program__footer">
          {getPersonName(programa.oracionFinal) &&
            <p><strong>Oracion final:</strong> {getPersonName(programa.oracionFinal)}</p>
          }
        </footer>
      </section>
    </main>
  );
}
