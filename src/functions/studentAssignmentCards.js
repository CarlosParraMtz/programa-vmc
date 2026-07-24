import { meses } from "../constants/meses";
import { getFechaReunionDesdeSemana } from "./meetingDates";
import { getPersonName, hasAuxRoom, isAuxRoomAssignment } from "./programHelpers";

const CARD_WIDTH = 536;
const CARD_HEIGHT = 700;
const FONT_FAMILY = "Arial, Helvetica, sans-serif";

function getFont(size, weight = 400, style = "normal") {
  return `${style} ${weight} ${size}px ${FONT_FAMILY}`;
}

function formatDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return String(value || "");
  return `${day} de ${meses[month - 1]} de ${year}`;
}

function sanitizeFileName(value) {
  return String(value || "asignaciones")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function drawLine(ctx, x1, y, x2) {
  ctx.save();
  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.restore();
}

function drawCheckbox(ctx, x, y, checked = false) {
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, 18, 18);
  if (!checked) return;

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 9);
  ctx.lineTo(x + 8, y + 14);
  ctx.lineTo(x + 15, y + 4);
  ctx.stroke();
}

function drawField(ctx, label, value, x, y, lineStart, lineEnd) {
  ctx.fillStyle = "#000";
  ctx.font = getFont(26, 700);
  ctx.fillText(label, x, y);
  drawLine(ctx, lineStart, y, lineEnd);

  if (!value) return;
  ctx.font = getFont(24);
  ctx.fillText(value, lineStart + 8, y - 5, lineEnd - lineStart - 12);
}

function drawParagraphLine(ctx, segments, x, y, lineEnd, justify = true) {
  const words = segments.flatMap((segment) => (
    segment.keepTogether
      ? [{ ...segment, text: segment.text.trim() }]
      : segment.text.trim().split(/\s+/).filter(Boolean).map((text) => ({
        ...segment,
        text,
      }))
  ));

  const measuredWords = words.map((word) => {
    ctx.font = getFont(20, word.weight || 400, word.style || "normal");
    return {
      ...word,
      width: ctx.measureText(word.text).width,
    };
  });
  const wordsWidth = measuredWords.reduce((total, word) => total + word.width, 0);
  const defaultSpace = ctx.measureText(" ").width;
  const gap = justify && measuredWords.length > 1
    ? Math.max(defaultSpace, (lineEnd - x - wordsWidth) / (measuredWords.length - 1))
    : defaultSpace;

  let cursor = x;
  measuredWords.forEach((word, index) => {
    const nextWord = measuredWords[index + 1];
    ctx.font = getFont(20, word.weight || 400, word.style || "normal");

    if (word.highlight) {
      const highlightWidth = word.width + (nextWord?.highlight ? gap : 0);
      ctx.fillStyle = "#fff39a";
      ctx.fillRect(cursor - 1, y - 19, highlightWidth + 2, 23);
    }

    ctx.fillStyle = "#000";
    ctx.fillText(word.text, cursor, y);
    cursor += word.width + gap;
  });
}

function drawCard(ctx, card, x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.fillStyle = "#000";
  ctx.font = getFont(28, 700);
  ctx.textAlign = "center";
  ctx.fillText("ASIGNACIÓN PARA LA REUNIÓN", CARD_WIDTH / 2, 45);
  ctx.fillText("VIDA Y MINISTERIO CRISTIANOS", CARD_WIDTH / 2, 78);

  ctx.textAlign = "left";
  drawField(ctx, "Nombre:", card.nombre, 24, 125, 145, 508);
  drawField(ctx, "Ayudante:", card.ayudante, 24, 177, 164, 508);
  drawField(ctx, "Fecha:", card.fecha, 24, 229, 120, 508);
  drawField(ctx, "Intervención núm.:", card.numero, 24, 281, 270, 508);

  ctx.font = getFont(25, 700);
  ctx.fillText("Se presentará en:", 24, 355);

  ctx.font = getFont(24);
  drawCheckbox(ctx, 56, 377, card.sala !== "B");
  ctx.fillText("Sala principal", 94, 394);
  drawCheckbox(ctx, 56, 409, card.sala === "B");
  ctx.fillText("Sala auxiliar núm. 1", 94, 426);
  drawCheckbox(ctx, 56, 441, false);
  ctx.fillText("Sala auxiliar núm. 2", 94, 458);

  drawParagraphLine(ctx, [
    { text: "Nota al estudiante:", weight: 700, keepTogether: true },
    { text: "En la ", highlight: true },
    { text: "Guía de actividades", style: "italic", highlight: true },
  ], 24, 532, 510);
  drawParagraphLine(ctx, [
    { text: "encontrará la información que necesita para su", highlight: true },
  ], 24, 556, 510);
  drawParagraphLine(ctx, [
    { text: "intervención. Repase también las indicaciones que se" },
  ], 24, 580, 510);
  drawParagraphLine(ctx, [
    { text: "describen en las " },
    { text: "Instrucciones para la reunión Vida y", style: "italic" },
  ], 24, 604, 510);
  drawParagraphLine(ctx, [
    { text: "Ministerio Cristianos", style: "italic" },
    { text: " (S-38)." },
  ], 24, 628, 510, false);

  ctx.font = getFont(16);
  ctx.fillText("S-89-S   11/23", 24, 670);

  ctx.restore();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export function createStudentAssignmentCardCanvas(card) {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  drawCard(ctx, card, 0, 0);
  return canvas;
}

function makeCrcTable() {
  const table = [];
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

const crcTable = makeCrcTable();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(output, value) {
  output.push(value & 0xff, (value >>> 8) & 0xff);
}

function writeUint32(output, value) {
  output.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function dateToDosTime(date = new Date()) {
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosTime, dosDate };
}

function createZip(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { dosTime, dosDate } = dateToDosTime();

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const checksum = crc32(file.bytes);
    const local = [];

    writeUint32(local, 0x04034b50);
    writeUint16(local, 20);
    writeUint16(local, 0);
    writeUint16(local, 0);
    writeUint16(local, dosTime);
    writeUint16(local, dosDate);
    writeUint32(local, checksum);
    writeUint32(local, file.bytes.length);
    writeUint32(local, file.bytes.length);
    writeUint16(local, nameBytes.length);
    writeUint16(local, 0);
    localParts.push(new Uint8Array(local), nameBytes, file.bytes);

    const central = [];
    writeUint32(central, 0x02014b50);
    writeUint16(central, 20);
    writeUint16(central, 20);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, dosTime);
    writeUint16(central, dosDate);
    writeUint32(central, checksum);
    writeUint32(central, file.bytes.length);
    writeUint32(central, file.bytes.length);
    writeUint16(central, nameBytes.length);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint32(central, 0);
    writeUint32(central, offset);
    centralParts.push(new Uint8Array(central), nameBytes);

    offset += local.length + nameBytes.length + file.bytes.length;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = [];
  writeUint32(end, 0x06054b50);
  writeUint16(end, 0);
  writeUint16(end, 0);
  writeUint16(end, files.length);
  writeUint16(end, files.length);
  writeUint32(end, centralSize);
  writeUint32(end, offset);
  writeUint16(end, 0);

  return new Blob([...localParts, ...centralParts, new Uint8Array(end)], { type: "application/zip" });
}

export function getStudentAssignmentCards(reunion, congregacion = {}) {
  const usaSalaB = hasAuxRoom(congregacion, reunion);
  const fechaReunion = getFechaReunionDesdeSemana(reunion?.fecha, congregacion, reunion);

  return (reunion?.asignaciones || [])
    .map((asignacion, index) => ({ asignacion, index }))
    .filter(({ asignacion, index }) => index >= 2 && (index === 2 || asignacion.seccion === 2))
    .flatMap(({ asignacion, index }) => {
      const cards = [{
        sala: "A",
        nombre: getPersonName(asignacion.asignado) || asignacion.nombre || "",
        ayudante: getPersonName(asignacion.ayudante) || "",
        fecha: formatDate(fechaReunion),
        numero: String(index + 1),
        filename: `${String(index + 1).padStart(2, "0")}-sala-a-${sanitizeFileName(getPersonName(asignacion.asignado) || asignacion.nombre || "asignacion")}.png`,
      }];

      if (usaSalaB && isAuxRoomAssignment(asignacion, index) && getPersonName(asignacion.asignadoB)) {
        cards.push({
          sala: "B",
          nombre: getPersonName(asignacion.asignadoB),
          ayudante: getPersonName(asignacion.ayudanteB) || "",
          fecha: formatDate(fechaReunion),
          numero: String(index + 1),
          filename: `${String(index + 1).padStart(2, "0")}-sala-b-${sanitizeFileName(getPersonName(asignacion.asignadoB) || "asignacion")}.png`,
        });
      }

      return cards;
    });
}

export async function downloadStudentAssignmentCardsPng(reunion, congregacion = {}) {
  const cards = getStudentAssignmentCards(reunion, congregacion);
  if (!cards.length) return 0;

  const files = await Promise.all(cards.map(async (card) => {
    const canvas = createStudentAssignmentCardCanvas(card);
    const blob = await canvasToBlob(canvas);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return { name: card.filename, bytes };
  }));

  const zip = createZip(files);
  const fileName = `s89-${sanitizeFileName(reunion.fecha)}.zip`;
  downloadBlob(zip, fileName);

  return cards.length;
}
