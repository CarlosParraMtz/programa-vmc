import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import Tablero from "../components/dashboard/Tablero";
import formatearRangoSemanal from "../functions/formatearRangoSemanal";
import { getPersonName } from "../functions/programHelpers";

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
        const [reunionSnap, congregacionSnap] = await Promise.all([
          getDoc(doc(db, `congregaciones/${congregacionId}/reuniones`, reunionId)),
          getDoc(doc(db, "congregaciones", congregacionId)),
        ]);

        if (!reunionSnap.exists()) {
          setError("No se encontro este programa.");
          return;
        }

        setPrograma({ ...reunionSnap.data(), id: reunionSnap.id });
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
        <Link to="/dashboard" className="btn gray">Dashboard</Link>
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
