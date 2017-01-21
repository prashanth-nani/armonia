const electron = require('electron');
const path = require('path');
const storage = require(path.join(__dirname, "app", "utils", "storage"));
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const url = require('url');

let mainWindow;

function createWindow() {
    // Create the browser window.
    var lastWindowState = storage.get("lastWindowState");
    if (lastWindowState === null) {
        lastWindowState = {
            width: 800,
            height: 600,
            maximized: true
        }
    }

    mainWindow = new BrowserWindow({x: lastWindowState.x, y: lastWindowState.y, width: lastWindowState.width, height: lastWindowState.height, minWidth: 800, minHeight: 600, darkTheme: false, title: "Armonia"});

    if (lastWindowState.maximized) {
        mainWindow.maximize();
    }

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'ui', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    mainWindow.on('close', function () {
        var bounds = mainWindow.getBounds();
        var size = mainWindow.getSize();
        storage.set("lastWindowState", {
            x: bounds.x,
            y: bounds.y,
            width: size[0],
            height: size[1],
            maximized: mainWindow.isMaximized()
        });

    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});