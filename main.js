const {
  app,
  BrowserWindow,
  dialog,
  shell,
  Menu,
  MenuItem,
  os,
  globalShortcut,
} = require("electron");
const path = require("path");
const url = require("url");
const ipc = require("electron").ipcMain;
const fs = require("fs");
// const { autoUpdater } = require("electron-updater");

let mainWindow,
  printWindow = null;

let isFullScreen = false;

function fullScrFun() {
  if (isFullScreen) {
    mainWindow.setFullScreen(false);
    isFullScreen = false;
  } else {
    mainWindow.setFullScreen(true);
    isFullScreen = true;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    center: true,
    show: false,
    icon: path.join(__dirname, "src/assets/app.png"),
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.maximize();
  mainWindow.show();

  // and load the index.html of the app.
  const startUrl = url.format({
    pathname: path.join(__dirname, "src/index.html"),
    protocol: "file:",
    slashes: true,
  });
  mainWindow.loadURL(startUrl);

  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  // dialog box
  mainWindow.webContents.on("crashed", () => {
    const options = {
      type: "info",
      title: "Renderer Process Crashed",
      message: "This process has crashed.",
      buttons: ["Reload", "Close"],
    };

    dialog.showMessageBox(options, (index) => {
      if (index === 0) win.reload();
      else win.close();
    });
  });

  // developer shortcut
  globalShortcut.register("CommandOrControl+Alt+D", () => {
    mainWindow.webContents.openDevTools();
    if (printWindow) {
      printWindow.webContents.openDevTools();
    }
  });

  // mainWindow.once("ready-to-show", () => {
  //   console.log("CheckforUpdate");
  //   autoUpdater.checkForUpdatesAndNotify();
  // });
}

const isMac = process.platform === "darwin";

const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []),
  // { role: 'fileMenu' }
  {
    label: "File",
    submenu: [isMac ? { role: "close" } : { role: "quit" }],
  },
  // { role: 'editMenu' }
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      ...(isMac
        ? [
            { role: "pasteAndMatchStyle" },
            { role: "delete" },
            { role: "selectAll" },
            { type: "separator" },
            {
              label: "Speech",
              submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
            },
          ]
        : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
    ],
  },
  // { role: 'viewMenu' }
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  // { role: 'windowMenu' }
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      ...(isMac
        ? [
            { type: "separator" },
            { role: "front" },
            { type: "separator" },
            { role: "window" },
          ]
        : [{ role: "close" }]),
    ],
  },
  {
    lable: "Contact Us",
    role: "help",
    submenu: [
      {
        label: "Website",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal("https://spyhunteritsolution.in/");
        },
      },
      {
        label: "Whatsapp",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal("https://wa.me/message/ASVAFGFR4VTNL1");
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

process.env.APPIMAGE = path.join(
  __dirname,
  "dist",
  `Installar_Mapeo_${app.getVersion()}_linux.AppImage`
);
Object.defineProperty(app, "isPackaged", {
  get() {
    return true;
  },
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// services ipc

ipc.on("app_version", (event) => {
  event.sender.send("app_version", { version: app.getVersion() });
});

ipc.on("show-print", function (event, arg) {
  printWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    show: true,
    icon: path.join(__dirname, "src/assets/app.png"),
    webPreferences: {
      nodeIntegration: true,
    },
    parent: mainWindow,
  });

  const startUrlPrint = url.format({
    pathname: path.join(__dirname, "src/Printer.html"),
    protocol: "file:",
    slashes: true,
  });
  printWindow.loadURL(startUrlPrint + "#!/" + arg.location);
});

ipc.on("print", function (event, arg) {
  const pdfpath = path.join(app.getPath("documents"), arg.path);
  const win = BrowserWindow.fromWebContents(event.sender);

  win.webContents.printToPDF({}, function (err, data) {
    // console.log(data);
    if (err) {
      console.log(err.message);
      return;
    }

    fs.writeFile(pdfpath, data, function (err) {
      if (err) {
        console.log(err.message);
        return;
      }
      shell.openExternal("file://" + pdfpath);
    });
  });
});

ipc.on("save", (event, arg) => {
  // console.log(arg);
  const pdfpath = path.join(__dirname, "src/assets/invoices/" + arg.path);
  path.join(__dirname, "src/" + arg.path);
  // console.log(pdfpath);

  const win = BrowserWindow.fromWebContents(event.sender);

  win.webContents.printToPDF({}, function (err, data) {
    // console.log(data);
    if (err) {
      console.log(err.message);
      return;
    }

    fs.writeFile(pdfpath, data, function (err) {
      if (err) {
        console.log(err.message);
        return;
      }
      // shell.openExternal("file://" + pdfpath);
    });
  });
});

ipc.on("show-full-screen", fullScrFun);

ipc.on("restart_app", () => {
  console.log("Restart App");
  autoUpdater.quitAndInstall();
});

// console.log(autoUpdater);
// autoUpdater.on("update-available", () => {
//   // console.log("Update Available")
//   mainWindow.webContents.send("update_available");
// });

// autoUpdater.on("update-downloaded", () => {
//   console.log("Update Downloaded");
//   mainWindow.webContents.send("update_downloaded");
// });
