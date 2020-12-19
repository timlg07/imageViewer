const { remote } = require("electron");
const canvas = document.getElementById("app-content");
const context = canvas.getContext("2d");
const inputArgs = remote.process.argv;
console.log(inputArgs);