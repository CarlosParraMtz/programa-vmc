export const diasSemana = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miercoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sabado" },
  { value: 0, label: "Domingo" },
];

export function getDiaSemanaLabel(value) {
  return diasSemana.find((dia) => dia.value === Number(value))?.label || "Lunes";
}
