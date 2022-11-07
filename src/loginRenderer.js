
//login resp on success
ipcRenderer.on("loginSuccess", (event, successMsg) => {
    
    //on success display success msg
    elementSetDisplay("error-msg","block");
    elementSetInnerHtml("error-msg", successMsg);
    elementAddClass("error-msg","success");

    
    setTimeout(function () {
        //after 3s remove some class
        elementRemoveClass("error-msg","error");
        elementRemoveClass("error-msg","success");

        //after connected hide elements
        elementSetDisplay("loginLoader","none");
        elementSetDisplay("log-msg","none");
        elementSetDisplay("error-msg","none");
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
    elementAddClass("error-msg","error");
    return (elementSetInnerHtml("error-msg", msg));
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