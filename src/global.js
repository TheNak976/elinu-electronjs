const {app, BrowserWindow, ipcMain, dialog, globalShortcut} = require('electron');
const path = require('path');
const fs = require("fs");
const Store = require('electron-store');
const notifier = require('node-notifier');
const langStrings = require('../langStrings.json');
const { basename } = require("path");
const currentDirectory = basename(process.cwd());
const axios = require('axios');
const { tcpPingPort } = require("tcp-ping-port");


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
    let response = await axios.get("https://teraelinu.surge.sh/" + 'version.json');
    return response.data;
})();


module.exports = { launcherConfig, remoteJsonVersion };