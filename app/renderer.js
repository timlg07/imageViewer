const { remote } = require("electron");
const path = require("path");
const fs = require("fs")

const canvas = document.getElementById("app-content");
const context = canvas.getContext("2d");

let inputArgs = remote.process.argv;
const self = inputArgs.shift();


function slash(str) {
    return str.replace(/\\/g, "/");
}

function encodeChars(str) {
    return str.replace(/['()# ]/g, c => ('%' + c.charCodeAt(0).toString(16)));
}


document.getElementById("image").style.backgroundImage = "url(" + encodeChars(slash(path.normalize(inputArgs[0]))) + ")";
