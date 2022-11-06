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

function elementSetDisplay(elementNameId, elementDisplay) {
    document.getElementById(elementNameId).style.display = elementDisplay;
}
function elementSetInnerHtml(elementNameId, elementString) {
    document.getElementById(elementNameId).innerHTML = elementString;
}
function elementAddClass(elementNameId, className) {
    document.getElementById(elementNameId).classList.add(className);
}
function elementRemoveClass(elementNameId, className) {
    document.getElementById(elementNameId).classList.remove(className);
}