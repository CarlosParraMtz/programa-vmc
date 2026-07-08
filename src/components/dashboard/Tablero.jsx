import { meses } from "../../constants/meses";
import formatearRangoSemanal from "../../functions/formatearRangoSemanal";
import { parseLocalDate } from "../../functions/meetingDates";
import { getPersonName, hasAuxRoom, isAuxRoomAssignment } from "../../functions/programHelpers";

export default function Tablero({ programa, congregacion = null, congregacionNombre = "", showPrintHeader = true }) {
  const date = parseLocalDate(programa.fecha);
  const usaSalaB = hasAuxRoom(congregacion, programa);
  const presidente = getPersonName(programa.presidente) || "No asignado";
  const presidenteAuxiliar = usaSalaB ? getPersonName(programa.presidenteB) : "";
  const oracionFinal = getPersonName(programa.oracionFinal);

  function formatProgramDate(fecha) {
    const [year, month, day] = String(fecha).split("-").map(Number);
    if (!year || !month || !day) return formatearRangoSemanal(fecha);

    return `${day} de ${meses[month - 1]} de ${year}`;
  }

  function getItems(section, bg = "", cancion1 = null, cancion2 = null, cancion3 = null, includePresidente = false) {
    return (
      <div className={`program-section-body program-section-${section} flex flex-col px-3 sm:px-5 py-2 ${bg} divide-slate-700`}>
        <div className="program-section-intro flex flex-col justify-between">
          {includePresidente && (
            <div className="program-presidents flex flex-col">
              <p className="text-md">
                <strong className="mr-5">Presidente:</strong>
                {presidente}
              </p>
              {presidenteAuxiliar && (
                <p className="text-sm">
                  <strong className="mr-5">Presidente de sala auxiliar:</strong>
                  {presidenteAuxiliar}
                </p>
              )}
            </div>
          )}

          {(cancion2 || cancion1) && (
            <p className="program-song font-bold text-sm mt-2">
              Canción {cancion1 || cancion2} {cancion1 && "y oración"}
            </p>
          )}
        </div>

        {programa?.asignaciones?.map((asignacion, index) => {
          if (asignacion.seccion != section) return null;
          const aplicaSalaB = usaSalaB && isAuxRoomAssignment(asignacion, index);
          const renderParticipantes = (sala = "A") => {
            const isSalaB = sala === "B";
            const asignado = getPersonName(isSalaB ? asignacion.asignadoB : asignacion.asignado) || (!isSalaB ? asignacion.nombre : "") || "No asignado";
            const ayudante = getPersonName(isSalaB ? asignacion.ayudanteB : asignacion.ayudante);

            return (
              <p className="program-assignment-person text-left text-md break-words">
                {aplicaSalaB && <strong>Sala {sala}: </strong>}
                {asignado}
                {ayudante && (
                  <span className="text-sm"> / Ayudante: {ayudante}</span>
                )}
              </p>
            );
          };

          return (
            <div key={index} className="program-assignment-row border-gray-400 flex flex-col w-full justify-between py-2">
              <div className="program-assignment-title flex-1 sm:mr-5">
                <p className="text-md leading-none">
                  <strong>{index + 1}. {asignacion.titulo}</strong> ({asignacion.duracion} mins.)
                  {asignacion.video && <i className="fas fa-video ml-2 sm:ml-5 text-purple-700"></i>}
                </p>
                {asignacion.descripcion && (
                  <p className="program-assignment-description text-xs">{asignacion.descripcion}</p>
                )}
              </div>

              <div className={aplicaSalaB ? "program-room-grid grid gap-1 sm:grid-cols-2" : ""}>
                {renderParticipantes("A")}
                {aplicaSalaB && renderParticipantes("B")}
              </div>
            </div>
          );
        })}

        {cancion3 && (
          <p className="program-song program-final-song font-bold text-md pb-1">
            <span>Canción {cancion3} y oración</span>
            {oracionFinal && <span className="program-final-prayer">{oracionFinal}</span>}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="program-board w-full min-w-0 flex flex-col">
      {showPrintHeader && (
        <div className="program-print-header">
          <p className="program-print-congregation">
            {congregacionNombre ? `Cong. ${congregacionNombre}` : "Congregación"}
          </p>
          <h2>Programa para la reunión de entre semana</h2>
        </div>
      )}

      <div className="program-print-meeting-head">
        <div>
          <p className="program-print-date">
            {formatProgramDate(programa.fecha)} {programa.estudio && `| ${programa.estudio.toUpperCase()}`}
          </p>
          <p className="program-song">Canción {programa.canciones?.[0]}</p>
          <p className="program-song">Palabras de introducción (1 min.)</p>
        </div>
        <div className="program-print-presidents">
          <p><span>Presidente:</span> {presidente}</p>
          {presidenteAuxiliar && <p><span>Presidente de sala auxiliar:</span> {presidenteAuxiliar}</p>}
        </div>
      </div>

      <h3 className="program-screen-week text-lg sm:text-xl">Semana del {formatearRangoSemanal(date)}</h3>

      <span className="program-section-heading program-section-heading-1 bg-program-treasures w-full text-white px-4 sm:px-5 py-2 rounded-t-lg font-thin text-md">
        Tesoros de la Biblia
      </span>
      {getItems(1, "bg-[#3c7f8b22]", programa.canciones?.[0], null, null, true)}

      <span className="program-section-heading program-section-heading-2 bg-program-teachers w-full text-white px-4 sm:px-5 py-2 font-thin text-md">
        Seamos mejores maestros
      </span>
      {getItems(2, "bg-[#d68f0022]")}

      <span className="program-section-heading program-section-heading-3 bg-program-life w-full text-white px-4 sm:px-5 py-2 font-thin text-md">
        Nuestra vida cristiana
      </span>
      {getItems(3, "bg-[#bf2f1322]", null, programa.canciones?.[1], programa.canciones?.[2])}
    </div>
  );
}
