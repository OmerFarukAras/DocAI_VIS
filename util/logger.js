import chalk from "chalk";
import FsExtra from "fs-extra"
import fs from "fs"
import moment from "moment";
import IP from "request-ip"

moment.locale('tr');

import { runAtSpecificTimeOfDay, appendToFile, stringify, getTime, getTimeLts } from "./index.js";

export class Logger {
    dir = process.cwd() + "/logs/";
    ptx = chalk.bgBlackBright("QR Cafe") + " %HD %TX %TM"
    darry = ["debug", "ignore", "info", "error", "warn", "request"]

    init() {
        this.info("Logger initialized. OS: " + process.platform)
        this.checkFiles()
        runAtSpecificTimeOfDay(0, 1, () => {
            this.checkFiles()
            let time = moment().format("DD-MM-YYYY")
            let dirTime = this.dir + time
            fs.readdir(dirTime, (err, files) => {
                if (!files) {
                    FsExtra.ensureDir(dirTime, err => {
                        if (err) this.error(err)
                    })
                } else {
                    FsExtra.emptyDir(dirTime, err => {
                        if (err) this.error(err)
                    })
                    FsExtra.ensureDir(dirTime, err => {
                        if (err) this.error(err)
                    })
                }
            })
            this.darry.forEach(x => {
                FsExtra.move(this.dir + x + ".log", dirTime + "/" + x + ".log." + time, err => {
                    if (err) this.error(err)
                })
            })
            setTimeout(() => {
                this.checkFiles()
                this.info("Today's logs moved to " + time + " folder.")
            }, 1000 * 5)

        });
        setInterval(() => {
            this.checkFiles()
        }, 1000 * 60 * 20)
        return this;
    }

    debug(msg, data) {
        this.sendLog("debug", msg, data, chalk.bgBlackBright, chalk.gray)
    }

    ignore(msg, data) {
        this.sendLog("ignore", msg, data, chalk.bgBlackBright, chalk.gray)
    }

    info(msg, data) {
        this.sendLog("info", msg, data, chalk.bgBlueBright, chalk.blue)
    }

    error(msg, data) {
        this.sendLog("error", msg, data, chalk.bgRedBright, chalk.redBright)

    }

    warn(msg, data) {
        this.sendLog("warn", msg, data, chalk.bgYellowBright, chalk.yellowBright)
    }

    express() {
        let ltf = appendToFile;
        let dir = this.dir
        let date = getTime;
        let dateLts = getTimeLts;
        let str = stringify
        return function (req, res, next) {
            const ipAddress = IP.getClientIp(req);
            console.log(chalk.bold.gray(req.method) + chalk.bold.blue(' Request') + chalk.gray(' from ') + chalk.bold(ipAddress) + chalk.gray(' to ') + chalk.bold(req.path) + chalk.gray(' at ') + chalk.gray(date()));
            ltf(dir + "request.log", req.method + " Request from " + ipAddress + " to " + req.path + " at " + dateLts() + " / \\ " + date() + "\nHeaders :" + str(req.headers) + "\n" + (req.method === "POST" ? ("Body :" + str(req.body) + "\n") : ""));
            next();
        }
    }


    sendLog(type, msg, data, color1, color2) {
        let basicStr = type.toUpperCase() + " " + msg + " at " + getTimeLts() + " / \\ " + getTime() + "\n"
        let fileName = this.dir + type + ".log"
        console.log(this.ptx.replace("%HD", color1(type.toUpperCase())).replace("%TX", color2(msg)).replace("%TM", chalk.gray(getTimeLts())));
        if (data) {
            console.log(chalk.gray(stringify(data)));
            appendToFile(fileName, basicStr + stringify(data) + "\n");
        } else {
            appendToFile(fileName, basicStr);

        }
    }

    checkFiles() {
        this.darry.forEach(x => {
            FsExtra.ensureFile(this.dir + x + ".log", err => {
                if (err) this.error(err)
            })
        })
    }
}