const {app, BrowserWindow, ipcMain, dialog, globalShortcut} = require('electron');
const path = require('path');
const fs = require("fs");
const Store = require('electron-store');
const notifier = require('node-notifier');
const langStrings = require('../langStrings.json');
const { basename } = require("path");
const axios = require('axios');


global.launcherConfig = (function () {
    if (fs.existsSync(path.join(process.cwd(), 'teraElinu.json'))) {
        try {
            return require(path.join(process.cwd(), 'teraElinu.json'));
        } catch (e) {
            let defaultCfg = {
                lang: "uk",
                gamePath: "C:\\Client\\TL.exe"
            };
            fs.writeFileSync(path.join(process.cwd(), 'teraElinu.json'), JSON.stringify(defaultCfg, null, 4));
            return defaultCfg;
        }
    } else {
        fs.writeFileSync(path.join(process.cwd(), 'error.txt'), "teraElinu.json not found!");

        notifier.notify({
            title: 'Tera Elinu',
            message: 'teraElinu.json not found!',
            icon: path.join(__dirname, 'TeraElinuIcon.png'),
            appID: 'Tera-Elinu',
        });
    }
})();

global.remoteJsonVersion = (async function () {
    try {
        let response = await axios.get("http://127.0.0.1:3000/" + 'version.json');
        return response.data;
    }catch (e) {
        const options = {
            type: 'error',
            message: "Cannot access to remote server",
            buttons: ['OK'],
            title: 'Remote Server Error(2)',
        };
        dialog.showMessageBox(BrowserWindow.getAllWindows()[0], options).then((res) => {
            //when button "OK" clicked
            if(res.response === 0){
                app.quit();
            }
        });
    }

})();


module.exports = { launcherConfig, remoteJsonVersion };