const fetch = require('node-fetch');
const lStorage = require("./storageServices")
console.log("Init AuthServices");

async function login(credentials) {
    let url = "https://tera-elinu.eu/tera/LauncherLoginAction";
    let response = await fetch(url, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(credentials),
    });
    return await response.json();
}

function getServerGameStr() {


}

module.exports = { login, getServerGameStr};