import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import fs from "node:fs/promises";

const MONTHS = {
  ENERO: 0,
  FEBRERO: 1,
  MARZO: 2,
  ABRIL: 3,
  MAYO: 4,
  JUNIO: 5,
  JULIO: 6,
  AGOSTO: 7,
  SEPTIEMBRE: 8,
  OCTUBRE: 9,
  NOVIEMBRE: 10,
  DICIEMBRE: 11,
};

const SECTION_MARKERS = [
  { text: "TESOROS", section: 1 },
  { text: "SEAMOS", section: 2 },
  { text: "NUESTRA", section: 3 },
];

function cleanText(value) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u0002\u0003\u0005]/g, " ")
    .replace(/[]/g, " ")
    .replace(/[´`]/g, "")
    .replace(/˜/g, "")
    .replace(/ı/g, "i")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeKnownWords(value) {
  return cleanText(value)
    .replace(/\bCancion\b/gi, "Canción")
    .replace(/\boracion\b/gi, "oración")
    .replace(/\bintroduccion\b/gi, "introducción")
    .replace(/\bleccion\b/gi, "lección")
    .replace(/\bconclusion\b/gi, "conclusión")
    .replace(/\bCancio n\b/gi, "Canción")
    .replace(/\boracio n\b/gi, "oración")
    .replace(/\bintroduccio n\b/gi, "introducción")
    .replace(/\bleccio n\b/gi, "lección")
    .replace(/\bconversacio n\b/gi, "conversación")
    .replace(/\bPREDICACIO N\b/g, "PREDICACIÓN")
    .replace(/\bAna lisis\b/g, "Análisis")
    .replace(/\bap endice\b/gi, "apéndice")
    .replace(/\bTıtulo\b/g, "Título")
    .replace(/\bJehova\b/g, "Jehová")
    .replace(/\bJeremias\b/g, "Jeremías")
    .replace(/\bJesus\b/g, "Jesús")
    .replace(/\bSau l\b/g, "Saúl")
    .replace(/\bb ıblico\b/g, "bíblico")
    .replace(/\bbiblico\b/gi, "bíblico")
    .replace(/\bcongregaci on\b/gi, "congregación")
    .replace(/\badivinacio n\b/gi, "adivinación")
    .replace(/\bpa rr/g, "párr")
    .replace(/\bpa rrs/g, "párrs")
    .replace(/\bp ag/g, "pág")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeHeader(value) {
  return cleanText(value)
    .replace(/\bD E\b/g, "DE")
    .replace(/\bA\b/g, "A")
    .replace(/J U LI O/g, "JULIO")
    .replace(/J U LIO/g, "JULIO")
    .replace(/J U LIO/g, "JULIO")
    .replace(/AG OSTO/g, "AGOSTO")
    .replace(/SEPTI EMB RE/g, "SEPTIEMBRE")
    .replace(/SEPTIEMB RE/g, "SEPTIEMBRE")
    .replace(/J E R E M IAS/g, "JEREMIAS")
    .replace(/JER EMIAS/g, "JEREMIAS")
    .replace(/^(\d+)\s+(?=\d+\s*(?:-|D E|DE))/, "")
    .replace(/(JEREMIAS .*\d)\s+\d{1,2}$/, "$1")
    .replace(/(?<=\d)\s+(?=\d)/g, "")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function parseYear(lines) {
  const cover = lines.map((line) => line.text).join(" ");
  const match = cover.match(/\b(20\d{2})\b/);
  return match ? Number(match[1]) : new Date().getFullYear();
}

function toDateKey(day, monthName, year) {
  const month = MONTHS[monthName];
  if (month == null) return "";
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseMeetingHeader(text, year) {
  const header = normalizeHeader(text);
  if (!header.includes("DE") || !header.includes("JEREMIAS")) return null;

  const studyMatch = header.match(/(JEREMIAS\s+.+)$/);
  if (!studyMatch) return null;

  const beforeStudy = header.slice(0, studyMatch.index).trim();
  let dateMatch = beforeStudy.match(/^(\d+)(?:-(\d+))?\s+DE\s+([A-Z]+)$/);
  if (!dateMatch) {
    dateMatch = beforeStudy.match(/^(\d+)\s+DE\s+([A-Z]+)\s+A\s+\d+\s+DE\s+[A-Z]+$/);
    if (!dateMatch) return null;
    return {
      fecha: toDateKey(Number(dateMatch[1]), dateMatch[2], year),
      estudio: normalizeKnownWords(studyMatch[1].replace(/\s+/g, " ")),
    };
  }

  return {
    fecha: toDateKey(Number(dateMatch[1]), dateMatch[3], year),
    estudio: normalizeKnownWords(studyMatch[1].replace(/\s+/g, " ")),
  };
}

function groupItemsIntoLines(items, pageNumber) {
  const printableItems = items
    .map((item) => ({
      text: item.str,
      x: item.transform[4],
      y: item.transform[5],
      width: item.width,
    }))
    .filter((item) => cleanText(item.text));

  const buildLines = (lineItems, column) => {
    const grouped = [];
    lineItems.forEach((item) => {
      let line = grouped.find((candidate) => Math.abs(candidate.y - item.y) < 2.5);
      if (!line) {
        line = { y: item.y, items: [] };
        grouped.push(line);
      }
      line.items.push(item);
    });

    return grouped
      .sort((a, b) => b.y - a.y)
      .map((line) => {
        line.items.sort((a, b) => a.x - b.x);
        let text = "";
        let previous = null;
        line.items.forEach((item) => {
          const gap = previous ? item.x - (previous.x + previous.width) : 0;
          if (previous && gap > 2.5) text += " ";
          text += item.text;
          previous = item;
        });
        return {
          page: pageNumber,
          column,
          y: line.y,
          text: normalizeKnownWords(text),
          rawText: cleanText(text),
        };
      })
      .filter((line) => line.text && !/^[-–—_.\s\d]+$/.test(line.text));
  };

  const headerLines = buildLines(printableItems.filter((item) => item.y > 625), -1);
  const bodyItems = printableItems.filter((item) => item.y <= 625);
  const columns = [
    bodyItems.filter((item) => item.x < 270),
    bodyItems.filter((item) => item.x >= 270),
  ];

  return [
    ...headerLines,
    ...columns.flatMap((columnItems, column) => buildLines(columnItems, column)),
  ];
}

async function extractPdfLines(file) {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data, disableWorker: true }).promise;
  const lines = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    lines.push(...groupItemsIntoLines(content.items, pageNumber));
  }

  return lines;
}

function isSectionMarker(text) {
  const upper = text.toUpperCase();
  return SECTION_MARKERS.find((marker) => upper === marker.text);
}

function parseAssignmentStart(text) {
  const match = text.match(/^(\d+)\.\s*(.+?)(?:\s+\((\d+)\s+mins?\.\))?$/i);
  if (!match) return null;
  return {
    number: Number(match[1]),
    title: normalizeKnownWords(match[2]),
    duration: match[3] || "",
  };
}

function shouldSkipDescriptionLine(text) {
  return (
    !text ||
    /^Canción \d+/i.test(text) ||
    /^Palabras de introducción/i.test(text) ||
    /^VIDA CRISTIANA$/i.test(text) ||
    /^DE LA BIBLIA$/i.test(text) ||
    /^MEJORES MAESTROS$/i.test(text) ||
    /^Christian Congregation/i.test(text) ||
    /^˘?\s*2026Christian Congregation/i.test(text) ||
    /^Guia de actividades/i.test(text) ||
    /^una publicación/i.test(text)
  );
}

function finalizeAssignment(meeting, assignment) {
  if (!meeting || !assignment) return;

  const descripcion = assignment.descriptionLines.join(" ").replace(/\s+/g, " ").trim();
  const payload = {
    titulo: assignment.title,
    seccion: assignment.section,
    video: /video/i.test(`${assignment.title} ${descripcion}`),
    duracion: assignment.duration || "",
  };

  if (!(assignment.section === 1 && assignment.number <= 2) && descripcion) {
    payload.descripcion = descripcion;
  }

  meeting.asignaciones.push(payload);
}

function parseLinesToMeetings(lines) {
  const year = parseYear(lines);
  const meetings = [];
  let currentMeeting = null;
  let currentSection = null;
  let currentAssignment = null;

  lines.forEach((line) => {
    const header = parseMeetingHeader(line.rawText, year);
    if (header?.fecha) {
      finalizeAssignment(currentMeeting, currentAssignment);
      currentAssignment = null;
      currentSection = null;
      currentMeeting = { ...header, canciones: [], asignaciones: [] };
      meetings.push(currentMeeting);
      return;
    }

    if (!currentMeeting) return;

    const songMatch = line.text.match(/Canción\s+(\d+)/i);
    if (songMatch) {
      const song = Number(songMatch[1]);
      if (!currentMeeting.canciones.includes(song) && currentMeeting.canciones.length < 3) {
        currentMeeting.canciones.push(song);
      }
      return;
    }

    const marker = isSectionMarker(line.text);
    if (marker) {
      finalizeAssignment(currentMeeting, currentAssignment);
      currentAssignment = null;
      currentSection = marker.section;
      return;
    }

    const assignmentStart = parseAssignmentStart(line.text);
    if (assignmentStart && currentSection) {
      finalizeAssignment(currentMeeting, currentAssignment);
      currentAssignment = {
        section: currentSection,
        number: assignmentStart.number,
        title: assignmentStart.title,
        duration: assignmentStart.duration,
        descriptionLines: [],
      };
      return;
    }

    if (!currentAssignment || shouldSkipDescriptionLine(line.text)) return;

    const durationOnly = line.text.match(/^\((\d+)\s+mins?\.\)$/i);
    if (durationOnly && !currentAssignment.duration) {
      currentAssignment.duration = durationOnly[1];
      return;
    }

    currentAssignment.descriptionLines.push(line.text);
  });

  finalizeAssignment(currentMeeting, currentAssignment);

  return meetings
    .filter((meeting) => meeting.fecha && meeting.asignaciones.length > 0)
    .map((meeting) => ({
      ...meeting,
      canciones: meeting.canciones.slice(0, 3),
      estudio: meeting.estudio.replace(/\s+([,.-])/g, "$1"),
    }));
}

export async function parseMwbPdf(file) {
  const lines = await extractPdfLines(file);
  return parseLinesToMeetings(lines);
}

const bytes=await fs.readFile('C:/Users/carlo/Downloads/mwb_S_202607.pdf'); const file={arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)}; const lines=await extractPdfLines(file); for(const l of lines.filter(l=>l.page===11)) console.log(l.column,Math.round(l.y),JSON.stringify(l.text));