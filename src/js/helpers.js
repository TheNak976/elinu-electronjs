function _TEXT_TRANSLATE(el, stringId) {
    el.dataset.stringLabel = stringId;
    el.innerHTML = window.langStrings[window.language][stringId];
}
function _TEXT_TRANSLATE_LABEL(stringId) {
    console.log(window.langStrings[window.language][stringId])
    return window.langStrings[window.language][stringId];
}
function capitalize(str){
    //capitalize the first letter
    return str.charAt(0).toUpperCase() + str.slice(1);
}

//Notification
function showNotification(notifTitle, notifBody) {
    let notif = new Notification(notifTitle, {
        body: notifBody,
        icon: "../../src/TeraElinuIcon.png",
    });
}