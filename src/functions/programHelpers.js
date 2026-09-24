import { getFechaReunionDesdeSemana } from "./meetingDates.js";

export function getPersonName(person) {
  if (!person) return "";
  if (typeof person === "string") return person;
  return person.nombre || "";
}

export function getRoomCount(congregacion = {}) {
  const salas = Number(congregacion?.salas || congregacion?.numeroSalas || 1);
  return salas === 2 ? 2 : 1;
}

export function hasAuxRoom(congregacion = {}, reunion = {}) {
  return getRoomCount(congregacion) === 2 && !reunion?.semanaVisita;
}

export function isWhatWouldYouSayAssignment(asignacion = {}) {
  if (Number(asignacion.seccion) !== 2) return false;

  const title = String(asignacion.titulo || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return /\bque\s+diria\b/.test(title);
}

export function isAuxRoomAssignment(asignacion = {}, index = -1) {
  return !isWhatWouldYouSayAssignment(asignacion)
    && (index === 2 || asignacion.seccion === 2);
}

export function stripUndefined(value) {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (!value || typeof value !== "object" || value instanceof Date) return value;

  return Object.entries(value).reduce((acc, [key, item]) => {
    if (item !== undefined) acc[key] = stripUndefined(item);
    return acc;
  }, {});
}

export function getPersonRef(person) {
  if (!person) return null;
  if (typeof person === "string") return { id: null, nombre: person };
  return {
    id: person.id || null,
    nombre: person.nombre || "",
    genero: person.genero || null,
    nombramiento: person.nombramiento || null,
    tipoPersona: person.tipoPersona || null,
  };
}

export function parseDateValue(value) {
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

export function toDateKey(value) {
  const date = parseDateValue(value);
  if (!date) return null;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getAssignmentType(asignacion = {}) {
  const text = `${asignacion.titulo || ""} ${asignacion.descripcion || ""}`.toLowerCase();

  if (text.includes("lectura")) return "lectura";
  if (text.includes("discurso")) return "discurso";
  if (text.includes("revisita")) return "revisita";
  if (text.includes("convers")) return "conversacion";
  if (text.includes("curso")) return "curso";
  if (text.includes("creencias")) return "creencias";
  if (text.includes("discíp") || text.includes("discip")) return "discipulos";
  if (asignacion.seccion === 1) {
    if (text.includes("perlas")) return "perlas";
    return "tesoros";
  }
  if (asignacion.seccion === 3) {
    if (text.includes("estudio")) return "estudio";
    if (text.includes("necesidades")) return "necesidades";
    return "vida";
  }
  return "demostracion";
}

export function getNombradoRole(asignacion = {}) {
  const type = getAssignmentType(asignacion);
  if (type === "perlas") return "perlas";
  if (type === "tesoros") return "tesoros";
  if (type === "estudio") return "estudio";
  if (type === "necesidades") return "necesidades";
  if (type === "vida") return "analisis";
  return "analisis";
}

export function getLastAssignmentDate(person, role = null) {
  if (!person) return null;

  if (role && person.ultimasAsignaciones?.[role]?.length) {
    const dates = person.ultimasAsignaciones[role].map(parseDateValue).filter(Boolean);
    if (dates.length) return new Date(Math.max(...dates.map((date) => date.getTime())));
  }

  return parseDateValue(person.ultimaAsignacion);
}

export function sortByOldestAssignment(people = [], role = null) {
  return [...people].sort((a, b) => {
    const dateA = getLastAssignmentDate(a, role);
    const dateB = getLastAssignmentDate(b, role);
    if (!dateA && !dateB) return (a.nombre || "").localeCompare(b.nombre || "");
    if (!dateA) return -1;
    if (!dateB) return 1;
    return dateA - dateB || (a.nombre || "").localeCompare(b.nombre || "");
  });
}

export function getLastPrayerDate(person = {}) {
  const dates = [
    ...(person.ultimasAsignaciones?.oracion || []),
    ...(person.ultimasOraciones || []),
  ].map(parseDateValue).filter(Boolean);
  const fallback = parseDateValue(person.ultimaOracion);

  if (fallback) dates.push(fallback);
  return dates.length
    ? new Date(Math.max(...dates.map((date) => date.getTime())))
    : null;
}

export function sortPrayerCandidates(people = []) {
  return [...people].sort((a, b) => {
    const dateA = getLastPrayerDate(a);
    const dateB = getLastPrayerDate(b);
    if (!dateA && !dateB) return (a.nombre || "").localeCompare(b.nombre || "");
    if (!dateA) return -1;
    if (!dateB) return 1;
    return dateA - dateB || (a.nombre || "").localeCompare(b.nombre || "");
  });
}

export function getStudentHistory(person = {}) {
  let lastParticipation = null;
  let lastRole = person.ultimoRol || null;
  let lastMainAssignment = parseDateValue(person.ultimaAsignacionPrincipal);
  let lastRoom = lastMainAssignment && Number.isInteger(person.ultimaSala)
    ? person.ultimaSala
    : null;
  const savedLastParticipation = parseDateValue(person.ultimaAsignacion);
  const savedLastRole = ["asignado", "ayudante"].includes(person.ultimoRol)
    ? person.ultimoRol
    : null;

  (Array.isArray(person.fechas) ? person.fechas : []).forEach((room = {}, roomIndex) => {
    (room.asignado || []).forEach((value) => {
      const date = parseDateValue(value);
      if (date && (!lastMainAssignment || date > lastMainAssignment)) {
        lastMainAssignment = date;
        lastRoom = roomIndex;
      }
      if (date && (!lastParticipation || date > lastParticipation)) {
        lastParticipation = date;
        lastRole = "asignado";
      }
    });
    (room.ayudante || []).forEach((value) => {
      const date = parseDateValue(value);
      if (date && (!lastParticipation || date > lastParticipation)) {
        lastParticipation = date;
        lastRole = "ayudante";
      }
    });
  });

  // When both buckets contain the latest date, use the role saved with that
  // participation instead of depending on the traversal order above.
  if (
    savedLastParticipation
    && savedLastRole
    && (!lastParticipation || savedLastParticipation >= lastParticipation)
  ) {
    lastParticipation = savedLastParticipation;
    lastRole = savedLastRole;
  }

  return {
    lastParticipation: lastParticipation || savedLastParticipation,
    lastRole,
    lastRoom,
    lastMainAssignment,
  };
}

export function sortStudentSuggestions(people = [], { role = "asignado", room = 0, useAuxRoom = false } = {}) {
  return [...people].sort((a, b) => {
    const historyA = getStudentHistory(a);
    const historyB = getStudentHistory(b);
    const desiredPreviousRole = role === "ayudante" ? "asignado" : "ayudante";
    const roleRankA = historyA.lastRole === desiredPreviousRole ? 0 : 1;
    const roleRankB = historyB.lastRole === desiredPreviousRole ? 0 : 1;
    if (roleRankA !== roleRankB) return roleRankA - roleRankB;

    if (role !== "ayudante" && useAuxRoom) {
      const roomRankA = historyA.lastRoom != null && historyA.lastRoom !== room ? 0 : 1;
      const roomRankB = historyB.lastRoom != null && historyB.lastRoom !== room ? 0 : 1;
      if (roomRankA !== roomRankB) return roomRankA - roomRankB;
    }

    const dateA = historyA.lastParticipation;
    const dateB = historyB.lastParticipation;
    if (!dateA && !dateB) return (a.nombre || "").localeCompare(b.nombre || "");
    if (!dateA) return -1;
    if (!dateB) return 1;
    return dateA - dateB || (a.nombre || "").localeCompare(b.nombre || "");
  });
}

export function getDraftAssignedPersonIds(reunion = {}, target = null, congregacion = {}) {
  const assignedIds = new Set();
  const isCurrentField = (type, field, index = null) => (
    target?.tipo === type
    && target.field === field
    && (type !== "asignacion" || target.index === index)
  );
  const addPerson = (person, type, field, index = null) => {
    if (isCurrentField(type, field, index)) return;
    const id = typeof person === "object" ? person?.id : null;
    if (id) assignedIds.add(id);
  };

  addPerson(reunion.presidente, "campo", "presidente");
  addPerson(reunion.presidenteB, "campo", "presidenteB");
  addPerson(reunion.oracionFinal, "campo", "oracionFinal");

  const usaSalaB = hasAuxRoom(congregacion, reunion);
  (reunion.asignaciones || []).forEach((asignacion, index) => {
    addPerson(asignacion.asignado, "asignacion", "asignado", index);
    addPerson(asignacion.ayudante, "asignacion", "ayudante", index);

    if (usaSalaB && isAuxRoomAssignment(asignacion, index)) {
      addPerson(asignacion.asignadoB, "asignacion", "asignadoB", index);
      addPerson(asignacion.ayudanteB, "asignacion", "ayudanteB", index);
    }
  });

  return assignedIds;
}

export function moveAssignedPeopleToEnd(people = [], assignedIds = new Set()) {
  const ids = assignedIds instanceof Set ? assignedIds : new Set(assignedIds);
  return [
    ...people.filter((person) => !ids.has(person.id)),
    ...people.filter((person) => ids.has(person.id)),
  ];
}

export function isStudentAssignment(asignacion = {}) {
  return !isWhatWouldYouSayAssignment(asignacion)
    && (asignacion.seccion === 2 || getAssignmentType(asignacion) === "lectura");
}

export function getPublicProgramUrl(congregacionId, reunionId) {
  if (!congregacionId || !reunionId) return "";
  const publicOrigin = (import.meta.env.VITE_PUBLIC_WEB_URL || window.location.origin).replace(/\/+$/, "");
  return `${publicOrigin}/programa/${congregacionId}/${reunionId}`;
}

export function getCurrentWeekPublicProgramUrl(congregacionId) {
  if (!congregacionId) return "";
  const publicOrigin = (import.meta.env.VITE_PUBLIC_WEB_URL || window.location.origin).replace(/\/+$/, "");
  return `${publicOrigin}/programa/${congregacionId}`;
}

export function validateProgram(programa, congregacion = {}) {
  const warnings = [];
  if (!programa) return warnings;

  const usaSalaB = hasAuxRoom(congregacion, programa);

  if (!programa.presidente) warnings.push("Falta presidente.");
  if (usaSalaB && !programa.presidenteB) warnings.push("Falta presidente de sala B.");
  if (!programa.oracionFinal) warnings.push("Falta oracion final.");

  const used = new Map();
  programa.asignaciones?.forEach((asignacion, index) => {
    const nombre = getPersonName(asignacion.asignado);
    // Un video puede ser la parte completa y, por ello, no requiere asignado.
    if (!nombre && !asignacion.video) warnings.push(`Falta asignado en la parte ${index + 1}.`);
    if (nombre) used.set(nombre, (used.get(nombre) || 0) + 1);

    const ayudante = getPersonName(asignacion.ayudante);
    if (ayudante) {
      used.set(ayudante, (used.get(ayudante) || 0) + 1);
      if (ayudante === nombre) warnings.push(`La parte ${index + 1} tiene la misma persona como asignado y ayudante.`);
    }

    if (usaSalaB && isAuxRoomAssignment(asignacion, index)) {
      const nombreB = getPersonName(asignacion.asignadoB);
      if (!nombreB) warnings.push(`Falta asignado de sala B en la parte ${index + 1}.`);
      if (nombreB) used.set(nombreB, (used.get(nombreB) || 0) + 1);

      const ayudanteB = getPersonName(asignacion.ayudanteB);
      if (ayudanteB) {
        used.set(ayudanteB, (used.get(ayudanteB) || 0) + 1);
        if (ayudanteB === nombreB) warnings.push(`La parte ${index + 1} tiene la misma persona como asignado y ayudante en sala B.`);
      }
    }
  });

  used.forEach((count, nombre) => {
    if (count > 1) warnings.push(`${nombre} aparece ${count} veces en esta reunion.`);
  });

  return warnings;
}

export function applyMeetingHistory({ reunion, matriculados = [], nombrados = [], congregacion = {} }) {
  const fechaReunion = getFechaReunionDesdeSemana(reunion.fecha, congregacion, reunion);
  const fecha = toDateKey(fechaReunion);
  if (!fecha) return { matriculados, nombrados };

  const usaSalaB = hasAuxRoom(congregacion, reunion);
  const matriculadosById = new Map(matriculados.map((persona) => [persona.id, { ...persona }]));
  const nombradosById = new Map(nombrados.map((persona) => [persona.id, { ...persona }]));

  const touchMatriculado = (person, asignacion, field, salaIndex = 0, ayudante = null) => {
    const ref = getPersonRef(person);
    if (!ref?.id || !matriculadosById.has(ref.id)) return;

    const current = matriculadosById.get(ref.id);
    const fechas = Array.isArray(current.fechas) && current.fechas.length
      ? [...current.fechas]
      : [{ asignado: [], ayudante: [] }];
    fechas[salaIndex] = {
      asignado: [...(fechas[salaIndex]?.asignado || [])],
      ayudante: [...(fechas[salaIndex]?.ayudante || [])],
    };
    const bucket = field === "ayudante" ? "ayudante" : "asignado";
    if (!fechas[salaIndex][bucket].includes(fecha)) fechas[salaIndex][bucket].push(fecha);

    const previousAssignment = parseDateValue(current.ultimaAsignacion);
    const isLatestParticipation = !previousAssignment || parseDateValue(fecha) >= previousAssignment;
    const previousMainAssignment = parseDateValue(current.ultimaAsignacionPrincipal)
      || getStudentHistory(current).lastMainAssignment;
    const isLatestMainAssignment = field === "asignado"
      && (!previousMainAssignment || parseDateValue(fecha) >= previousMainAssignment);

    matriculadosById.set(ref.id, {
      ...current,
      fechas,
      ultimaSala: isLatestMainAssignment ? salaIndex : current.ultimaSala,
      ultimaAsignacionPrincipal: isLatestMainAssignment ? fecha : current.ultimaAsignacionPrincipal,
      ultimaAsignacion: isLatestParticipation ? fecha : current.ultimaAsignacion,
      ultimoRol: isLatestParticipation ? bucket : current.ultimoRol,
      ultimoTipo: isLatestParticipation
        ? (bucket === "ayudante" ? "ayudante" : getAssignmentType(asignacion))
        : current.ultimoTipo,
      ayudantes: field === "asignado" && ayudante?.id
        ? Array.from(new Set([...(current.ayudantes || []), ayudante.id]))
        : current.ayudantes || [],
    });
  };

  const touchNombrado = (person, role) => {
    const ref = getPersonRef(person);
    if (ref?.tipoPersona === "matriculado") return;
    if (!ref?.id || !nombradosById.has(ref.id)) return;

    const current = nombradosById.get(ref.id);
    const ultimasAsignaciones = {
      presidir: [],
      salaAux: [],
      tesoros: [],
      perlas: [],
      analisis: [],
      estudio: [],
      necesidades: [],
      oracion: [],
      ...(current.ultimasAsignaciones || {}),
    };
    const dates = new Set([...(ultimasAsignaciones[role] || []), fecha]);
    ultimasAsignaciones[role] = Array.from(dates).sort();

    nombradosById.set(ref.id, {
      ...current,
      ultimasAsignaciones,
      ultimaAsignacion: fecha,
    });
  };

  const touchMatriculadoPrayer = (person) => {
    const ref = getPersonRef(person);
    if (ref?.tipoPersona === "nombrado") return;
    if (!ref?.id || !matriculadosById.has(ref.id)) return;

    const current = matriculadosById.get(ref.id);
    const dates = new Set([...(current.ultimasOraciones || []), fecha]);
    matriculadosById.set(ref.id, {
      ...current,
      ultimasOraciones: Array.from(dates).sort(),
      ultimaOracion: fecha,
    });
  };

  touchNombrado(reunion.presidente, "presidir");
  if (usaSalaB) touchNombrado(reunion.presidenteB, "salaAux");
  touchNombrado(reunion.oracionFinal, "oracion");
  touchMatriculadoPrayer(reunion.oracionFinal);

  reunion.asignaciones?.forEach((asignacion, index) => {
    if (isStudentAssignment(asignacion)) {
      touchMatriculado(asignacion.asignado, asignacion, "asignado", 0, asignacion.ayudante);
      touchNombrado(
        asignacion.asignado,
        ["lectura", "discurso"].includes(getAssignmentType(asignacion))
          ? getAssignmentType(asignacion)
          : "demostracion"
      );
      touchMatriculado(asignacion.ayudante, asignacion, "ayudante", 0);
      touchNombrado(asignacion.ayudante, "ayudante");
      if (usaSalaB && isAuxRoomAssignment(asignacion, index)) {
        touchMatriculado(asignacion.asignadoB, asignacion, "asignado", 1, asignacion.ayudanteB);
        touchNombrado(
          asignacion.asignadoB,
          ["lectura", "discurso"].includes(getAssignmentType(asignacion))
            ? getAssignmentType(asignacion)
            : "demostracion"
        );
        touchMatriculado(asignacion.ayudanteB, asignacion, "ayudante", 1);
        touchNombrado(asignacion.ayudanteB, "ayudante");
      }
    } else {
      touchNombrado(asignacion.asignado, getNombradoRole(asignacion));
      touchMatriculado(asignacion.asignado, asignacion, "asignado", 0);
    }
  });

  return {
    matriculados: Array.from(matriculadosById.values()),
    nombrados: Array.from(nombradosById.values()),
  };
}

export function rebuildMeetingHistory({
  reuniones = [],
  matriculados = [],
  nombrados = [],
  congregacion = {},
}) {
  const roomCount = getRoomCount(congregacion);
  let history = {
    matriculados: matriculados.map((persona) => ({
      ...persona,
      fechas: Array.from({ length: roomCount }, () => ({ asignado: [], ayudante: [] })),
      ultimaSala: null,
      ultimaAsignacionPrincipal: null,
      ultimaAsignacion: null,
      ultimoRol: null,
      ultimoTipo: null,
      ayudantes: [],
      ultimasOraciones: [],
      ultimaOracion: null,
    })),
    nombrados: nombrados.map((persona) => ({
      ...persona,
      ultimasAsignaciones: {},
      ultimaAsignacion: null,
    })),
  };

  const reunionesOrdenadas = [...reuniones].sort((a, b) => {
    const fechaA = parseDateValue(getFechaReunionDesdeSemana(a.fecha, congregacion, a));
    const fechaB = parseDateValue(getFechaReunionDesdeSemana(b.fecha, congregacion, b));
    if (!fechaA && !fechaB) return 0;
    if (!fechaA) return -1;
    if (!fechaB) return 1;
    return fechaA - fechaB;
  });

  reunionesOrdenadas.forEach((reunion) => {
    history = applyMeetingHistory({
      reunion,
      matriculados: history.matriculados,
      nombrados: history.nombrados,
      congregacion,
    });
  });

  return history;
}
