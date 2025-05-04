export default function getLunesAnterior(fecha) {
  const fechaInput = new Date(fecha);
  const diaSemana = fechaInput.getDay(); // 0 (Domingo) a 6 (Sábado)
  
  // Calculamos la diferencia de días para retroceder al lunes
  let diff = 1 - diaSemana; // 1 porque lunes es el día 1 en getDay()
  if (diff > 0) {
      diff -= 7;
  }
  
  const lunes = new Date(fechaInput);
  lunes.setDate(fechaInput.getDate() + diff);
  // Aseguramos que la hora sea 00:00:00 para evitar problemas de comparación
  lunes.setHours(0, 0, 0, 0);
  
  return lunes;
}
