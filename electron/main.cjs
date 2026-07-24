const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const { autoUpdater } = require("electron-updater");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const isDevelopment = !app.isPackaged;
const developmentUrl = "http://localhost:5173";
let applicationServer;
let updateCheckTimer;
let updatePromptOpen = false;

function checkForApplicationUpdates() {
  if (isDevelopment || process.platform !== "win32") return;
  autoUpdater.checkForUpdates().catch((error) => {
    console.error("No se pudo comprobar si hay actualizaciones:", error);
  });
}

function configureAutoUpdater(mainWindow) {
  if (isDevelopment || process.platform !== "win32") return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;

  autoUpdater.on("error", (error) => {
    console.error("Error de actualización:", error);
  });

  autoUpdater.on("update-downloaded", async (info) => {
    if (updatePromptOpen || mainWindow.isDestroyed()) return;
    updatePromptOpen = true;
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Actualización lista",
      message: `Programa VMC ${info.version} está listo para instalarse.`,
      detail: "Reinicia la aplicación para completar la actualización. Si eliges hacerlo después, se instalará al cerrar Programa VMC.",
      buttons: ["Reiniciar e instalar", "Después"],
      defaultId: 0,
      cancelId: 1,
      noLink: true,
    });
    updatePromptOpen = false;

    if (response === 0) {
      setImmediate(() => autoUpdater.quitAndInstall(false, true));
    }
  });

  setTimeout(checkForApplicationUpdates, 8_000);
  updateCheckTimer = setInterval(checkForApplicationUpdates, 6 * 60 * 60 * 1000);
}

ipcMain.handle("export-period-pdf", async (event, requestedName) => {
  const parentWindow = BrowserWindow.fromWebContents(event.sender);
  const safeBaseName = String(requestedName || "programa-del-periodo")
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
    .trim() || "programa-del-periodo";
  const defaultPath = safeBaseName.toLowerCase().endsWith(".pdf")
    ? safeBaseName
    : `${safeBaseName}.pdf`;

  const { canceled, filePath } = await dialog.showSaveDialog(parentWindow, {
    title: "Exportar programa del periodo",
    defaultPath,
    buttonLabel: "Exportar PDF",
    filters: [{ name: "Documento PDF", extensions: ["pdf"] }],
    properties: ["createDirectory", "showOverwriteConfirmation"],
  });

  if (canceled || !filePath) return { canceled: true };

  const pdf = await event.sender.printToPDF({
    pageSize: "Letter",
    printBackground: true,
    preferCSSPageSize: true,
    margins: {
      marginType: "none",
    },
  });

  await fs.promises.writeFile(filePath, pdf);
  return { canceled: false, filePath };
});

const mimeTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendFile(response, filePath, method) {
  const extension = path.extname(filePath).toLowerCase();

  response.writeHead(200, {
    "Content-Type": mimeTypes[extension] || "application/octet-stream",
    "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=31536000",
    "X-Content-Type-Options": "nosniff",
  });

  if (method === "HEAD") {
    response.end();
    return;
  }

  fs.createReadStream(filePath)
    .on("error", () => response.end())
    .pipe(response);
}

function startApplicationServer() {
  const distDirectory = path.resolve(__dirname, "..", "dist");
  const indexPath = path.join(distDirectory, "index.html");

  return new Promise((resolve, reject) => {
    applicationServer = http.createServer((request, response) => {
      if (!["GET", "HEAD"].includes(request.method)) {
        response.writeHead(405, { Allow: "GET, HEAD" });
        response.end();
        return;
      }

      let pathname = "/";
      try {
        pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      } catch {
        response.writeHead(400);
        response.end();
        return;
      }

      const requestedPath = path.resolve(distDirectory, `.${pathname}`);
      const staysInsideDist = requestedPath === distDirectory
        || requestedPath.startsWith(`${distDirectory}${path.sep}`);

      if (!staysInsideDist) {
        response.writeHead(403);
        response.end();
        return;
      }

      fs.stat(requestedPath, (error, stats) => {
        const filePath = !error && stats.isFile() ? requestedPath : indexPath;
        sendFile(response, filePath, request.method);
      });
    });

    applicationServer.once("error", reject);
    applicationServer.listen(0, "localhost", () => {
      const { port } = applicationServer.address();
      resolve(`http://localhost:${port}`);
    });
  });
}

function isFirebaseAuthenticationUrl(rawUrl) {
  try {
    const { hostname, protocol } = new URL(rawUrl);
    return protocol === "https:"
      && (hostname.endsWith(".firebaseapp.com") || hostname.endsWith(".web.app"));
  } catch {
    return false;
  }
}

async function createWindow() {
  const applicationUrl = isDevelopment
    ? developmentUrl
    : await startApplicationServer();

  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    backgroundColor: "#f7f4fa",
    title: "Programa VMC",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isFirebaseAuthenticationUrl(url)) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          autoHideMenuBar: true,
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
          },
        },
      };
    }

    if (url.startsWith("https://") || url.startsWith("http://")) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });

  await mainWindow.loadURL(`${applicationUrl}/dashboard`);
  configureAutoUpdater(mainWindow);
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.whenReady().then(createWindow);

  app.on("second-instance", () => {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow();
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (updateCheckTimer) clearInterval(updateCheckTimer);
  applicationServer?.close();
});
