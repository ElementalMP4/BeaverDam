/*

Beaver - Node.JS logger
By ElementalMP4 - https://github.com/Elementalmp4/Beaver

*/


//If a bannerfile exists, then we will slap it into the console
const fs = require("fs");
if (fs.existsSync("banner.txt")) {
    let banner = fs.readFileSync("banner.txt");
    console.log("\n" + banner + "\n");
}

//Color definition
const Color = {
    "BLUE": "\x1b[34m",
    "GREEN": "\x1b[32m",
    "RED": "\x1b[31m",
    "YELLOW": "\x1b[33m",
    "RESET": "\x1b[0m"
}

//Adds zeroes to the numbers to make the logs e v e n
function addDigitPadding(number, length) {
    let buffer = '' + number;
    while (buffer.length < length) {
        buffer = '0' + buffer;
    }
    return buffer;
}

//Level definition
const Level = {
    "ERROR": Color.RED + "[ ERROR ] ",
    "SUCCESS": Color.GREEN + "[SUCCESS] ",
    "INFO": Color.BLUE + "[ INFO  ] ",
    "WARN": Color.YELLOW + "[ WARN  ] ",
    "LOG": Color.RESET + "[ LOGS  ] "
}

//Timestamp function
function getTimeStamp() {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = addDigitPadding(date_ob.getHours(), 2);
    let minutes = addDigitPadding(date_ob.getMinutes(), 2);
    let seconds = addDigitPadding(date_ob.getSeconds(), 2);
    let milliseconds = addDigitPadding(date_ob.getMilliseconds(), 3);
    return "[" + year + "-" +
        month + "-" +
        date + " " +
        hours + ":" +
        minutes + ":" +
        seconds + "." +
        milliseconds + "]";
}

//The logger itself
function logToConsole(mode, message) {
    console.log(`${Color.RESET}${getTimeStamp()} ${mode}${message}${Color.RESET}`);
}

//Export the logger stuff
module.exports = {
    Color: Color,
    Level: Level,
    Log: logToConsole,
}