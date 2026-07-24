import Input from "../common/Input";
import Modal from "../common/Modal";
import { useState } from "react";
import { motion } from "framer-motion";
import atoms from "../../jotai/atoms";
import { useAtomValue } from "jotai";
import CrudNombrados from "./CrudNombrados";
import CrudMatriculados from "./CrudMatriculados";
import {
  getAssignmentType,
  getDraftAssignedPersonIds,
  getLastPrayerDate,
  getNombradoRole,
  getPersonName,
  getPersonRef,
  hasAuxRoom,
  isAuxRoomAssignment,
  isStudentAssignment,
  moveAssignedPeopleToEnd,
  sortByOldestAssignment,
  sortPrayerCandidates,
  sortStudentSuggestions,
} from "../../functions/programHelpers";
import { puedePasarTipoAsignacion } from "../../constants/tiposAsignacionMatriculado";
import { TIPOS_ASIGNACION_NOMBRADO, puedePasarTipoNombrado } from "../../constants/tiposAsignacionNombrado";

const formatoFechaOracion = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function PersonaSelector({
  label,
  persona,
  onClick,
  icon = "fa-user",
  tone = "neutral",
}) {
  const nombre = getPersonName(persona);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`person-selection person-selection--${tone} ${nombre ? "is-selected" : "is-empty"}`}
      aria-label={`${nombre ? "Cambiar" : "Seleccionar"} ${label.toLowerCase()}`}
    >
      <span className="person-selection__icon" aria-hidden="true">
        <i className={`fas ${icon}`}></i>
      </span>
      <span className="person-selection__content">
        <small>{label}</small>
        <strong>{nombre || "Seleccionar persona"}</strong>
        <span>{nombre ? "Pulsa para cambiar" : "Pulsa aquí para asignar"}</span>
      </span>
      <span className="person-selection__action" aria-hidden="true">
        <i className={`fas ${nombre ? "fa-pen" : "fa-plus"}`}></i>
      </span>
    </button>
  );
}

export default function TableroEdicion({ useReunion }) {
  const [reunion, setReunion] = useReunion;
  const [modalSelectCancion, setModalSelectCancion] = useState(null);
  const [modalPersonas, setModalPersonas] = useState(null);
  const [personasPage, setPersonasPage] = useState("NOMBRADOS");
  const nombrados = useAtomValue(atoms.nombrados) || [];
  const matriculados = useAtomValue(atoms.matriculados) || [];
  const congregacion = useAtomValue(atoms.congregacion);
  const usaSalaB = hasAuxRoom(congregacion, reunion);
  const superintendenteCircuito = congregacion?.superintendenteCircuito?.trim();
  const mostrarSuperintendenteComoNombrado = !!(
    reunion?.semanaVisita &&
    superintendenteCircuito &&
    (modalPersonas?.tipo === "asignacion" || modalPersonas?.field === "oracionFinal")
  );
  const superintendenteOpcion = mostrarSuperintendenteComoNombrado
    ? {
      id: "superintendente-circuito",
      nombre: superintendenteCircuito,
      nombramiento: "a",
      tiposAsignacion: TIPOS_ASIGNACION_NOMBRADO.map((tipo) => tipo.id),
      detalles: "Superintendente de circuito",
    }
    : null;
  const opcionesNombrados = superintendenteOpcion ? [superintendenteOpcion] : [];
  const nombradosSeleccionables = [...opcionesNombrados, ...nombrados];
  const candidatosOracion = sortPrayerCandidates([
    ...nombrados
      .filter((persona) => persona.puedeOrar)
      .map((persona) => ({ ...persona, tipoPersona: "nombrado" })),
    ...matriculados
      .filter((persona) => persona.puedeOrar)
      .map((persona) => ({ ...persona, tipoPersona: "matriculado" })),
  ]);
  const esSelectorOracion = modalPersonas?.tipo === "campo" && modalPersonas.field === "oracionFinal";

  const abrirModalPersonas = (target, sala = "A") => {
    if (typeof target === "number") {
      const asignacion = reunion.asignaciones[target];
      setPersonasPage(isStudentAssignment(asignacion) ? "MATRICULADOS" : "NOMBRADOS");
      setModalPersonas({ tipo: "asignacion", index: target, field: sala === "B" ? "asignadoB" : "asignado", sala });
      return;
    }
    setPersonasPage("NOMBRADOS");
    setModalPersonas({ tipo: "campo", field: target });
  };

  const abrirModalAyudante = (index, sala = "A") => {
    setPersonasPage("MATRICULADOS");
    setModalPersonas({ tipo: "asignacion", index, field: sala === "B" ? "ayudanteB" : "ayudante", sala });
  };

  const cerrarModalPersonas = () => setModalPersonas(null);

  const getTipoAsignacionMatriculado = (target) => {
    if (!target || target.tipo !== "asignacion") return null;
    if (target.field.includes("ayudante")) return "ayudante";

    const asignacion = reunion.asignaciones[target.index];
    if (!isStudentAssignment(asignacion)) return null;

    const assignmentType = getAssignmentType(asignacion);
    if (assignmentType === "lectura") return "lectura";
    if (assignmentType === "discurso") return "discurso";
    return "demostracion";
  };

  const getTipoAsignacionNombrado = (target) => {
    if (!target) return null;
    if (target.tipo === "campo") {
      if (target.field === "presidente" || target.field === "presidenteB") return "presidente";
      return null;
    }

    const asignacion = reunion.asignaciones[target.index];
    if (target.field.includes("ayudante")) return "ayudante";
    if (isStudentAssignment(asignacion)) {
      const assignmentType = getAssignmentType(asignacion);
      if (assignmentType === "lectura") return "lectura";
      if (assignmentType === "discurso") return "discurso";
      return "demostracion";
    }

    const role = getNombradoRole(asignacion);
    return ["tesoros", "perlas", "analisis", "necesidades", "estudio"].includes(role) ? role : null;
  };

  const handleChange = (index, key, newValue) => {
    const asignaciones = [...reunion.asignaciones];
    asignaciones[index] = { ...asignaciones[index], [key]: newValue };
    setReunion({ ...reunion, asignaciones });
  };

  const bgs = {
    1: "bg-[#3c7f8b22]",
    2: "bg-[#d68f0022]",
    3: "bg-[#bf2f1322]",
  };

  const seleccionarCancion = (cancion, seccion) => {
    const canciones = [...(reunion.canciones || [])];
    canciones.splice(seccion, 1, cancion);
    setReunion({ ...reunion, canciones });
    setModalSelectCancion(null);
  };

  const agregarAsignacion = () => {
    setReunion({
      ...reunion,
      asignaciones: [
        ...reunion.asignaciones,
        { asignado: null, ayudante: null, duracion: "", seccion: 3, titulo: "", video: false },
      ],
    });
  };

  const eliminarAsignacion = (index) => {
    const asignaciones = [...reunion.asignaciones];
    asignaciones.splice(index, 1);
    setReunion({ ...reunion, asignaciones });
  };

  const checkVideo = (index) => {
    const asignaciones = [...reunion.asignaciones];
    asignaciones[index] = { ...asignaciones[index], video: !asignaciones[index].video };
    setReunion({ ...reunion, asignaciones });
  };

  const setPersona = (persona) => {
    if (!modalPersonas) return;

    if (modalPersonas.tipo === "asignacion") {
      setReunion((reunionActual) => {
        const asignaciones = [...reunionActual.asignaciones];
        asignaciones[modalPersonas.index] = {
          ...asignaciones[modalPersonas.index],
          [modalPersonas.field]: getPersonRef(persona),
        };
        return { ...reunionActual, asignaciones };
      });
    } else {
      setReunion((reunionActual) => ({ ...reunionActual, [modalPersonas.field]: getPersonRef(persona) }));
    }
    cerrarModalPersonas();
  };

  const sugerirPersonas = (target) => {
    if (!target) return [];
    const assignedIds = getDraftAssignedPersonIds(reunion, target, congregacion);

    if (target.tipo === "campo") {
      if (target.field === "oracionFinal") {
        return moveAssignedPeopleToEnd(candidatosOracion, assignedIds);
      }
      const role = target.field === "presidente" ? "presidir" : target.field === "presidenteB" ? "salaAux" : "oracion";
      const tipoAsignacion = getTipoAsignacionNombrado(target);
      const people = sortByOldestAssignment(nombradosSeleccionables, role)
        .filter((persona) => puedePasarTipoNombrado(persona, tipoAsignacion));
      return moveAssignedPeopleToEnd(people, assignedIds);
    }

    const asignacion = reunion.asignaciones[target.index];
    if (personasPage === "MATRICULADOS") {
      const asignado = asignacion[target.sala === "B" ? "asignadoB" : "asignado"];
      const asignadoId = asignado?.id;
      const tipoAsignacion = getTipoAsignacionMatriculado(target);
      const people = sortStudentSuggestions(matriculados, {
        role: target.field.includes("ayudante") ? "ayudante" : "asignado",
        room: target.sala === "B" ? 1 : 0,
        useAuxRoom: usaSalaB,
      })
        .filter((persona) => puedePasarTipoAsignacion(persona, tipoAsignacion))
        .filter((persona) => !target.field.includes("ayudante") || persona.id !== asignadoId)
        .filter((persona) => (
          !target.field.includes("ayudante")
          || asignado?.genero == null
          || persona.genero === asignado.genero
        ));
      return moveAssignedPeopleToEnd(people, assignedIds);
    }

    const tipoAsignacion = getTipoAsignacionNombrado(target);
    const role = isStudentAssignment(asignacion) ? null : getNombradoRole(asignacion);
    const people = sortByOldestAssignment(nombradosSeleccionables, role)
      .filter((persona) => puedePasarTipoNombrado(persona, tipoAsignacion));
    return moveAssignedPeopleToEnd(people, assignedIds);
  };

  const personasSelectorOracion = esSelectorOracion ? sugerirPersonas(modalPersonas) : [];
  const sugerencias = (esSelectorOracion
    ? personasSelectorOracion
    : sugerirPersonas(modalPersonas)
  ).slice(0, esSelectorOracion ? 1 : 3);
  const assignedIds = getDraftAssignedPersonIds(reunion, modalPersonas, congregacion);

  function getItems(seccion) {
    return reunion.asignaciones.map((asignacion, index) => {
      if (asignacion.seccion != seccion) return null;
      const sugerido = sugerirPersonas({ tipo: "asignacion", index, field: "asignado" })[0];
      const aplicaSalaB = usaSalaB && isAuxRoomAssignment(asignacion, index);
      const renderParticipantes = (sala = "A") => {
        const isSalaB = sala === "B";
        const asignadoKey = isSalaB ? "asignadoB" : "asignado";
        const ayudanteKey = isSalaB ? "ayudanteB" : "ayudante";

        return (
          <div className={`assignment-room ${aplicaSalaB ? "assignment-room--divided" : ""}`}>
            {aplicaSalaB &&
              <div className="assignment-room__title">
                <i className="fas fa-door-open" aria-hidden="true"></i>
                <strong>Sala {sala}</strong>
              </div>
            }
            <div className="assignment-room__selectors">
              <PersonaSelector
                label="Asignado"
                persona={asignacion[asignadoKey]}
                onClick={() => abrirModalPersonas(index, sala)}
                icon="fa-user"
                tone={`section-${asignacion.seccion}`}
              />
              {!isSalaB && sugerido &&
                <small className="assignment-room__suggestion">
                  <i className="fas fa-wand-magic-sparkles" aria-hidden="true"></i>
                  Sugerido: {getPersonName(sugerido)} ({getAssignmentType(asignacion)})
                </small>
              }

              {asignacion.seccion === 2 &&
                <PersonaSelector
                  label="Ayudante"
                  persona={asignacion[ayudanteKey]}
                  onClick={() => abrirModalAyudante(index, sala)}
                  icon="fa-handshake"
                  tone={`section-${asignacion.seccion}`}
                />
              }
            </div>
          </div>
        );
      };

      return (
        <div key={index} className="flex flex-col items-center gap-0 w-full p-1.5 sm:p-2">
          <div className="flex flex-col w-full min-w-0 p-3 sm:p-5 gap-3 bg-[#ffffff77] rounded-lg sm:rounded-r-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">{index + 1}</h3>
              {asignacion.seccion === 3 &&
                <button onClick={() => eliminarAsignacion(index)} className="w-8 h-8 bg-white text-gray-600 hover:text-purple-600 rounded-full">
                  <i className="fas fa-trash"></i>
                </button>
              }
            </div>

            <div className="assignment-participants">
              <div className="assignment-participants__heading">
                <span>
                  <i className="fas fa-users" aria-hidden="true"></i>
                  Participantes
                </span>
                <small>Pulsa una tarjeta para seleccionar o cambiar a alguien</small>
              </div>
              <div className={`grid gap-3 min-w-0 ${aplicaSalaB ? "md:grid-cols-2" : "grid-cols-1"}`}>
                {renderParticipantes("A")}
                {aplicaSalaB && renderParticipantes("B")}
              </div>
            </div>

            <Input
              label="Titulo"
              fullwidth
              name={`titulo-input-${index}`}
              value={asignacion.titulo || ""}
              onChange={(e) => handleChange(index, "titulo", e.target.value)}
            />

            <label htmlFor={`descripcion-input-${index}`} className="mb-0 text-sm font-medium text-gray-900">
              Fuente de informacion / Tipo
            </label>
            <textarea
              id={`descripcion-input-${index}`}
              value={asignacion.descripcion || ""}
              onChange={(e) => handleChange(index, "descripcion", e.target.value)}
              placeholder="Descripcion de la asignacion"
              rows={5}
              className="resize-none rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:ring-purple-500 focus:outline-purple-500 caret-purple-300 w-full p-2.5 -mt-2"
            />

            <div className="flex items-center">
              <div className="flex-1">
                <Input
                  label="Duracion"
                  fullwidth
                  name={`duracion-input-${index}`}
                  value={asignacion.duracion || ""}
                  onChange={(e) => handleChange(index, "duracion", e.target.value)}
                />
              </div>
              <span className="mt-5 ml-2">mins.</span>
            </div>

            {asignacion.seccion === 3 &&
              <div className="flex items-center justify-between lg:justify-start gap-5">
                <p>Video:</p>
                <label
                  htmlFor={`video-input-${index}`}
                  className={`h-10 w-16 mb-2 rounded-full flex items-center p-1 cursor-pointer transition-colors ${asignacion.video ? "justify-end bg-gray-100 hover:bg-white" : "justify-start bg-gray-400 hover:bg-gray-300"}`}
                >
                  <motion.div
                    layout="position"
                    layoutId={`checkbox-video-${index}`}
                    transition={{ type: "spring" }}
                    className={`h-8 w-8 rounded-full transition-colors flex items-center justify-center overflow-hidden ${asignacion.video ? "bg-purple-400 text-white" : "bg-white text-gray-400"}`}
                  >
                    <motion.i
                      animate={{ opacity: asignacion.video ? 1 : 0.1, x: asignacion.video ? 1 : -30 }}
                      transition={{ type: "spring" }}
                      className="fas fa-play"
                    />
                  </motion.div>
                </label>
                <input checked={!!asignacion.video} onChange={() => checkVideo(index)} type="checkbox" className="hidden" id={`video-input-${index}`} />
              </div>
            }

          </div>
        </div>
      );
    });
  }

  return (
    <div className="meeting-editor w-full rounded-xl py-3 sm:py-5">
      <div className="meeting-editor__selection-hint">
        <span><i className="fas fa-hand-pointer" aria-hidden="true"></i></span>
        <div>
          <strong>Asigna a cada participante</strong>
          <p>Busca las tarjetas destacadas dentro de cada parte y pulsa para seleccionar o cambiar una persona.</p>
        </div>
      </div>
      <div className="mb-4 rounded-lg border border-purple-200 bg-purple-50 px-3 sm:px-5 py-3">
        <label htmlFor="semana-visita-input" className="flex items-center gap-3 cursor-pointer">
          <input
            id="semana-visita-input"
            type="checkbox"
            checked={!!reunion.semanaVisita}
            onChange={(e) => setReunion({ ...reunion, semanaVisita: e.target.checked })}
            className="h-5 w-5 accent-purple-600"
          />
          <span className="font-semibold text-gray-800">Semana de la visita</span>
        </label>
      </div>

      <div className="bg-program-treasures w-full text-white px-4 sm:px-5 py-2 rounded-t-lg font-thin text-md">Tesoros de la Biblia</div>
      <div className={bgs[1]}>
        <div className="flex flex-col justify-between">
          <div className={`meeting-leadership-grid ${usaSalaB ? "meeting-leadership-grid--two" : ""}`}>
            <PersonaSelector
              label="Presidente"
              persona={reunion.presidente}
              onClick={() => abrirModalPersonas("presidente")}
              icon="fa-user-tie"
              tone="section-1"
            />
            {usaSalaB &&
              <PersonaSelector
                label="Presidente de la sala B"
                persona={reunion.presidenteB}
                onClick={() => abrirModalPersonas("presidenteB")}
                icon="fa-user-tie"
                tone="section-1"
              />
            }
          </div>

          <div className="block">
            <span className="flex gap-3 sm:gap-5 items-center justify-between p-3 sm:p-5">
              <strong>Cancion</strong>
              <button className="px-6 sm:px-10 py-2 bg-gray-50 border border-purple-400 rounded-md text-gray-500" onClick={() => setModalSelectCancion(0)}>
                {reunion.canciones?.[0]}
              </button>
            </span>
          </div>
        </div>
        {getItems(1)}
      </div>

      <div className="bg-program-teachers w-full text-white px-5 py-2 font-thin text-md">Seamos mejores maestros</div>
      <div className={bgs[2]}>{getItems(2)}</div>

      <div className="bg-program-life w-full text-white px-5 py-2 font-thin text-md">Nuestra vida cristiana</div>
      <div className={bgs[3]}>
        <div className="block">
          <span className="flex justify-between gap-3 sm:gap-5 items-center p-3 sm:p-5">
            <strong>Cancion</strong>
            <button className="px-5 py-2 bg-gray-50 border border-purple-400 rounded-md text-gray-500" onClick={() => setModalSelectCancion(1)}>
              {reunion.canciones?.[1]}
            </button>
          </span>
        </div>
        {getItems(3)}
        <button className="btn error mx-auto mt-5 w-[calc(100%-24px)] sm:w-auto" onClick={agregarAsignacion}>Agregar una asignacion</button>
        <div className="block">
          <span className="flex justify-between gap-3 sm:gap-5 items-center px-3 sm:px-5 mt-5">
            <strong>Cancion</strong>
            <button className="px-5 py-2 bg-gray-50 border border-purple-400 rounded-md text-gray-500" onClick={() => setModalSelectCancion(2)}>
              {reunion.canciones?.[2]}
            </button>
          </span>
        </div>
        <div className="px-3 sm:px-5 pb-6 pt-3">
          <PersonaSelector
            label="Oración final"
            persona={reunion.oracionFinal}
            onClick={() => abrirModalPersonas("oracionFinal")}
            icon="fa-hands-praying"
            tone="section-3"
          />
        </div>
      </div>

      <Modal
        title={modalSelectCancion === 0 ? "Selecciona una cancion de inicio" : modalSelectCancion === 1 ? "Selecciona una cancion de intermedio" : modalSelectCancion === 2 ? "Selecciona una cancion final" : "Selecciona una cancion"}
        size="md"
        open={modalSelectCancion != null}
        onClose={() => setModalSelectCancion(null)}
      >
        <div className="grid grid-cols-4 sm:grid-cols-6 bg-gray-200 gap-2 max-h-[300px] overflow-auto p-3">
          {modalSelectCancion != null &&
            Array.from({ length: 161 }, (_, i) => i + 1).map((cancion) =>
              <button
                key={cancion}
                onClick={() => seleccionarCancion(cancion, modalSelectCancion)}
                className={`shadow-md hover:bg-gray-100 p-3 ${reunion.canciones?.[modalSelectCancion] === cancion ? "bg-purple-500 text-white" : "bg-gray-50 text-gray-700"}`}
              >
                {cancion}
              </button>
            )
          }
        </div>
        <div className="flex justify-end mt-3">
          <button className="btn error" onClick={() => setModalSelectCancion(null)}>Cerrar</button>
        </div>
      </Modal>

      <Modal title="Selecciona una persona de la lista" open={modalPersonas != null} onClose={cerrarModalPersonas} size="xl4">
        {sugerencias.length > 0 &&
          <div className="mb-3 rounded-lg bg-purple-50 p-3">
            <p className="text-sm font-semibold text-purple-700">
              {esSelectorOracion ? "Siguiente sugerido para la oración" : "Sugerencias por mayor tiempo sin pasar"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sugerencias.map((persona) =>
                <button key={persona.id} className="btn main" onClick={() => setPersona(persona)}>
                  {persona.nombre}
                </button>
              )}
            </div>
          </div>
        }

        {esSelectorOracion
          ? <div className="prayer-picker">
            {personasSelectorOracion.length > 0
              ? personasSelectorOracion.map((persona, index) => {
                const fecha = getLastPrayerDate(persona);
                return (
                  <button
                    type="button"
                    key={`${persona.tipoPersona}-${persona.id}`}
                    className={index === 0 ? "is-next" : ""}
                    onClick={() => setPersona(persona)}
                  >
                    <span className="prayer-picker__position">{index + 1}</span>
                    <span className="prayer-picker__person">
                      <strong>{persona.nombre}</strong>
                      <small>
                        {persona.tipoPersona === "nombrado" ? "Nombrado" : "Matriculado"}
                        {" · "}
                        {fecha ? `Última oración: ${formatoFechaOracion.format(fecha)}` : "Sin oraciones registradas"}
                      </small>
                    </span>
                    {index === 0 && <span className="prayer-picker__next">Siguiente</span>}
                    <i className="fas fa-chevron-right" aria-hidden="true"></i>
                  </button>
                );
              })
              : <div className="p-6 text-center rounded-lg border-2 border-dashed border-purple-200">
                <i className="fas fa-hands-praying text-3xl text-purple-400" aria-hidden="true"></i>
                <p className="mt-3 text-gray-700">No hay personas configuradas para hacer oración.</p>
                <small className="text-gray-500">Agrégalas desde la nueva lista “Oración final” en Personas.</small>
              </div>
            }
          </div>
          : <>
            <div className="person-picker-tabs" role="tablist" aria-label="Tipo de persona">
              <button
                type="button"
                id="tab-personas-nombrados"
                role="tab"
                aria-selected={personasPage === "NOMBRADOS"}
                aria-controls="panel-personas-nombrados"
                className={personasPage === "NOMBRADOS" ? "active" : ""}
                onClick={() => setPersonasPage("NOMBRADOS")}
              >
                <i className="fas fa-user-tie" aria-hidden="true"></i>
                Nombrados
              </button>
              <button
                type="button"
                id="tab-personas-matriculados"
                role="tab"
                aria-selected={personasPage === "MATRICULADOS"}
                aria-controls="panel-personas-matriculados"
                className={personasPage === "MATRICULADOS" ? "active" : ""}
                onClick={() => setPersonasPage("MATRICULADOS")}
              >
                <i className="fas fa-users" aria-hidden="true"></i>
                Matriculados
              </button>
            </div>

            {personasPage === "NOMBRADOS" &&
              <div
                id="panel-personas-nombrados"
                role="tabpanel"
                aria-labelledby="tab-personas-nombrados"
                className="p-2 sm:p-5"
              >
                {nombradosSeleccionables.length === 0 &&
                  <div className="p-5 rounded-lg border-dashed border-2 border-purple-300">
                    <p className="text-center text-gray-700">No hay nombrados agregados. Ve a la seccion de nombrados para administrar la lista.</p>
                  </div>
                }
                {nombradosSeleccionables.length > 0 && (
                  <CrudNombrados
                    agregarNombrado={setPersona}
                    tipoAsignacionPermitida={getTipoAsignacionNombrado(modalPersonas)}
                    opcionesExtra={opcionesNombrados}
                    assignedIds={assignedIds}
                  />
                )}
              </div>
            }

            {personasPage === "MATRICULADOS" &&
              <div
                id="panel-personas-matriculados"
                role="tabpanel"
                aria-labelledby="tab-personas-matriculados"
                className="p-2 sm:p-5"
              >
                {matriculados.length === 0 &&
                  <div className="p-5 rounded-lg border-dashed border-2 border-purple-300">
                    <p className="text-center text-gray-700">No hay matriculados agregados. Ve a la seccion de matriculados para administrar la lista.</p>
                  </div>
                }
                {matriculados.length > 0 && (
                  <CrudMatriculados
                    agregarMatriculado={setPersona}
                    tipoAsignacionPermitida={getTipoAsignacionMatriculado(modalPersonas)}
                    assignedIds={assignedIds}
                  />
                )}
              </div>
            }
          </>
        }
      </Modal>
    </div>
  );
}
