import getDia from "./getDia.js";
import getLunesAnterior from "./getLunesAnterior.js";

export function parseLocalDate(value) {
  if (!value) return null;
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  if (value.seconds) return new Date(value.seconds * 1000);

  const dateOnly = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getDiaReunion(congregacion = {}) {
  const dia = Number(congregacion?.diaReunion);
  return Number.isInteger(dia) && dia >= 0 && dia <= 6 ? dia : 1;
}

export function getFechaReunionDesdeSemana(fechaSemana, congregacion = {}, reunion = {}) {
  const fecha = parseLocalDate(fechaSemana);
  if (!fecha) return fechaSemana;

  const lunes = getLunesAnterior(fecha);
  const diaReunion = reunion?.semanaVisita ? 2 : getDiaReunion(congregacion);
  const offset = diaReunion === 0 ? 6 : diaReunion - 1;
  lunes.setDate(lunes.getDate() + offset);

  return getDia(lunes);
}
