
//login resp on success
ipcRenderer.on("loginSuccess", (event, successMsg) => {
    document.getElementById("log-msg").innerHTML = successMsg;
    setTimeout(function () {
        elementSetDisplay("loginLoader","none");
        elementSetDisplay("log-msg","none");
    }, 3000);
});

//login resp on error
ipcRenderer.on("authError", (event, msg) => {
    setLoginError(msg);
    elementSetDisplay("loginLoader","none");
    elementSetDisplay("log-msg","none");

});

function setLoginError(msg) {
    elementSetDisplay("error-msg","block");
    return (document.getElementById("error-msg").innerHTML = msg);
}

//login request
function executeLoginRequest() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let stayConnected = document.querySelector("input[name=stayConnected]");
    
    ipcRenderer.send("loginRequest", username, password, stayConnected.checked);

    _TEXT_TRANSLATE(document.getElementById("log-msg"), 'UI_TEXT_LOGIN_ATTEMPT')
    elementSetDisplay("loginLoader","block");
    elementSetDisplay("log-msg","block");
    elementSetDisplay("error-msg","none");
}

//set display style to this element. ex: {display:block) 
function elementSetDisplay(elementNameId, elementDisplay) {
    document.getElementById(elementNameId).style.display = elementDisplay;
}