const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { exec } = require('child_process');

require('dotenv').config();
const API_URL = process.env.API_URL || "http://localhost:5000";

let mainWindow;

//démarrer le serv node.js
let server = exec('node server.js', (error, stdout, stderr) => {
    if (error) {
        console.error(`SERVER ERROR: ${error}`);
        return;
    }
    console.log(`SERVER: ${stdout}`);
});

server.stdout.on('data', (data) => {
    console.log(`SERVER: ${data}`);
});

// Fonction pour créer la fenêtre principale
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadURL(API_URL);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

const customMenu = Menu.buildFromTemplate([
    {
        label: "Application",
        submenu: [
            { label: "A propos", click: () => console.log("A propos cliqué") },
            { type: "separator" },
            { label: "Quitter", role: "quit" }
        ]
    },
    {
        label: "Affichage",
        submenu: [
            { label: "Recharger", role: "reload" },
            { label: "Outils de dev", role: "toggleDevTools" }
        ]
    }
]);

// Attendre que l'application soit prête
app.whenReady().then(() => {
    createWindow();
    Menu.setApplicationMenu(customMenu); //supp totalement le menu

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Fermer l'application quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});