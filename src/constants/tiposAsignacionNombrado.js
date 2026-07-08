export const TIPOS_ASIGNACION_NOMBRADO = [
  { id: "presidente", label: "Presidente" },
  { id: "tesoros", label: "Tesoros de la Biblia" },
  { id: "perlas", label: "Perlas escondidas" },
  { id: "analisis", label: "Análisis con el auditorio" },
  { id: "necesidades", label: "Necesidades" },
  { id: "estudio", label: "Estudio bíblico" },
]

export function getTiposAsignacionNombradoLabels(tipos = []) {
  return TIPOS_ASIGNACION_NOMBRADO
    .filter((tipo) => tipos.includes(tipo.id))
    .map((tipo) => tipo.label)
}

export function puedePasarTipoNombrado(persona = {}, tipo = null) {
  if (!tipo) return true
  if (!Array.isArray(persona.tiposAsignacion)) return true
  return persona.tiposAsignacion.includes(tipo)
}
