import fs from "fs";
import moment from "moment";

export function runAtSpecificTimeOfDay(hour, minutes, func) {
    const twentyFourHours = 86400000;
    const now = new Date();
    let eta_ms = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minutes, 0, 0).getTime() - now;
    if (eta_ms < 0) {
        eta_ms += twentyFourHours;
    }
    setTimeout(function () {
        //run once
        func();
        // run every 24 hours from now on
        setInterval(func, twentyFourHours);
    }, eta_ms);
}

export function appendToFile(dir, msg) {
    fs.appendFile(dir, msg, function (err) {
        if (err) return console.error(err)
    })
}

export function stringify(value) {
    switch (typeof value) {
        case 'string':
        case 'object':
            return JSON.stringify(value);
        default:
            return String(value);
    }
}

export function getTime() {
    return moment().format();
}

export function getTimeLts() {
    return moment().format("LTS")
}

export function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}
