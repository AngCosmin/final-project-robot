const url = require('url');
const path = require('path');
const electron = require('electron');
const { BrowserWindow, Menu, ipcMain } = electron;

class UI {
    constructor() {
        this.mainWindow = new BrowserWindow({
            width: 400,
            height: 200,
        });

        // Display html file in main window
        this.mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'mainWindow.html'),
            protocol: 'file:',
            slashes: true,
        })); 
    
        // Set menu
        const mainMenuTemplate = this.getMainMenuTemplate();
        const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
        Menu.setApplicationMenu(mainMenu);

    }

    sendToView(event, value) {
        this.mainWindow.webContents.send(event, value);        
    }

    getMainMenuTemplate() {
        return [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Quit',
                        click() {
                            app.quit();
                        }
                    }
                ]
            },
            {
                label: 'Developer tools',
                submenu: [
                    {
                        label: 'Toggle DevTools',
                        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                        click(item, focusedWindow) {
                            focusedWindow.toggleDevTools();
                        }
                    },
                    {
                        role: 'reload'
                    }
                ]
            },
        ];
    }
}

module.exports = UI;