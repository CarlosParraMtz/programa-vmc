export default function obtenerDiaDeHoy(fecha) {
  const dia = fecha.getDate();
  const mes = fecha.getMonth();
  const ano = fecha.getFullYear();
  const mesFormateado = String(mes + 1).padStart(2, "0");
  const diaFormateado = String(dia).padStart(2, "0");
  return `${ano}-${mesFormateado}-${diaFormateado}`;
}
