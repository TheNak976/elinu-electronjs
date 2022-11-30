const {app, BrowserWindow, ipcMain, dialog, globalShortcut} = require('electron');
const path = require('path');
const fs = require("fs");
const authServices = require('./services/authServices');
const Store = require('electron-store');
const notifier = require('node-notifier');
const langStrings = require('../langStrings.json');
const global = require("./global");

//vars
let credentials;
const localStore = new Store();

async function doLogin(mainW, winLogin, event, username, password, stayConnectedValue ) {
    try {
        //call api
        credentials = {
            userID: username,
            password: password,
        };
        let stayConnectedResponse = {
            stayConnected: stayConnectedValue
        }
        let msg = ""
        try {
            let response = await authServices.login(credentials); //from http request in authServices.js
            if (response) {
                msg = response.ReturnCode;
                if (response.msg === "success") {
                    //we store all our user data here in localstorage session
                    localStore.set('users', JSON.stringify(response));
                    localStore.set('ifStayConnected', JSON.stringify(stayConnectedResponse));
                    console.log(stayConnectedResponse);

                    //send our user data to MainWindow render
                    mainW.webContents.send('users', JSON.parse(localStore.get('users')));
                    mainW.webContents.send('stayCo', JSON.parse(localStore.get('ifStayConnected')));

                    let successMsg = langStrings[global.launcherConfig.lang]["UI_TEXT_LOGIN_SUCCESS_MSG"]
                    winLogin.webContents.send('loginSuccess', successMsg);

                    //redirect if success
                    setTimeout(function () {
                        winLogin.hide();
                        mainW.center();
                        mainW.show();
                    }, 1000);

                } else {
                    if (msg === 2) {
                        event.reply('authError', langStrings[global.launcherConfig.lang]["UI_TEXT_LOGIN_ERROR_NAME_PASSWORD"]);//
                    }
                    if (msg === 50000) {
                        event.reply('authError', langStrings[global.launcherConfig.lang]["UI_TEXT_LOGIN_ERROR_CREDENTIALS"]);
                    }
                }
            }
        } catch (error) {
            console.error("err " + error);
        }


    } catch (err) {
        event.reply('loginResponse', err);
    }
}

module.exports = {doLogin};