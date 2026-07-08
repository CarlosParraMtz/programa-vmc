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

export function isAuxRoomAssignment(asignacion = {}, index = -1) {
  return index === 2 || asignacion.seccion === 2;
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
  };
}

export function parseDateValue(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value.seconds) return new Date(value.seconds * 1000);
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

export function isStudentAssignment(asignacion = {}) {
  return asignacion.seccion === 2 || getAssignmentType(asignacion) === "lectura";
}

export function getPublicProgramUrl(congregacionId, reunionId) {
  if (!congregacionId || !reunionId) return "";
  return `${window.location.origin}/programa/${congregacionId}/${reunionId}`;
}

export function getCurrentWeekPublicProgramUrl(congregacionId) {
  if (!congregacionId) return "";
  return `${window.location.origin}/programa/${congregacionId}`;
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
    if (!nombre) warnings.push(`Falta asignado en la parte ${index + 1}.`);
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
  const fecha = toDateKey(reunion.fecha);
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

    matriculadosById.set(ref.id, {
      ...current,
      fechas,
      ultimaSala: salaIndex,
      ultimaAsignacion: fecha,
      ultimoTipo: getAssignmentType(asignacion),
      ayudantes: field === "asignado" && ayudante?.id
        ? Array.from(new Set([...(current.ayudantes || []), ayudante.id]))
        : current.ayudantes || [],
    });
  };

  const touchNombrado = (person, role) => {
    const ref = getPersonRef(person);
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

  touchNombrado(reunion.presidente, "presidir");
  if (usaSalaB) touchNombrado(reunion.presidenteB, "salaAux");
  touchNombrado(reunion.oracionFinal, "oracion");

  reunion.asignaciones?.forEach((asignacion, index) => {
    if (isStudentAssignment(asignacion)) {
      touchMatriculado(asignacion.asignado, asignacion, "asignado", 0, asignacion.ayudante);
      touchMatriculado(asignacion.ayudante, asignacion, "ayudante", 0);
      if (usaSalaB && isAuxRoomAssignment(asignacion, index)) {
        touchMatriculado(asignacion.asignadoB, asignacion, "asignado", 1, asignacion.ayudanteB);
        touchMatriculado(asignacion.ayudanteB, asignacion, "ayudante", 1);
      }
    } else {
      touchNombrado(asignacion.asignado, getNombradoRole(asignacion));
    }
  });

  return {
    matriculados: Array.from(matriculadosById.values()),
    nombrados: Array.from(nombradosById.values()),
  };
}
