export const TIPOS_ASIGNACION_MATRICULADO = [
  { id: "lectura", label: "Lectura" },
  { id: "demostracion", label: "Demostración" },
  { id: "discurso", label: "Discurso" },
  { id: "ayudante", label: "Ayudante" },
]

export function getTiposAsignacionLabels(tipos = []) {
  return TIPOS_ASIGNACION_MATRICULADO
    .filter((tipo) => tipos.includes(tipo.id))
    .map((tipo) => tipo.label)
}

export function puedePasarTipoAsignacion(persona = {}, tipo = null) {
  if (!tipo) return true
  if (!Array.isArray(persona.tiposAsignacion)) return true
  return persona.tiposAsignacion.includes(tipo)
}
