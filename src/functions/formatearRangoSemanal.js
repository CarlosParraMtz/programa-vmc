import { meses } from '../constants/meses'

export default function formatearRangoSemanal(fecha) {
  let fechaInicio = new Date(fecha);
  const diaSemana = fechaInicio.getDay(); // 0 (domingo) a 6 (sábado)
  const ajusteLunes = diaSemana === 0 ? 1 : diaSemana === 1 ? 0 : 1 - diaSemana;
  fechaInicio = new Date(fechaInicio);
  fechaInicio.setDate(fechaInicio.getDate() + ajusteLunes);

  const fechaFin = new Date(fechaInicio);
  fechaFin.setDate(fechaInicio.getDate() + 6);

  const diaInicio = fechaInicio.getDate();
  const mesInicio = meses[fechaInicio.getMonth()];
  const añoInicio = fechaInicio.getFullYear();

  const diaFin = fechaFin.getDate();
  const mesFin = meses[fechaFin.getMonth()];
  const añoFin = fechaFin.getFullYear();

  // Si es el mismo mes y año
  if (fechaInicio.getMonth() === fechaFin.getMonth() &&
    fechaInicio.getFullYear() === fechaFin.getFullYear()) {
    return `del ${diaInicio} al ${diaFin} de ${mesInicio} de ${añoInicio}`;
  }
  // Si es diferente mes pero mismo año
  else if (fechaInicio.getFullYear() === fechaFin.getFullYear()) {
    return `del ${diaInicio} de ${mesInicio} al ${diaFin} de ${mesFin} de ${añoInicio}`;
  }
  // Si es diferente año (caso extremo de fin de año)
  else {
    return `del ${diaInicio} de ${mesInicio} de ${añoInicio} al ${diaFin} de ${mesFin} de ${añoFin}`;
  }
}