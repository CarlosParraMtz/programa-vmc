const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopAPI", Object.freeze({
  isDesktop: true,
  platform: process.platform,
  exportPeriodPdf: (suggestedName) => ipcRenderer.invoke("export-period-pdf", suggestedName),
}));
