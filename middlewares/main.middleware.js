import jwt from "jsonwebtoken";
import requestip from "request-ip";

import { findUserById } from "../models/user.model.js";
import { checkLastAccess } from "./checkLastAccess.js";

export default function mainMiddleware(logger) {
  return async function main(req, res, next) {
    let ip = requestip.getClientIp(req);
    let data = jwt.decode(req.headers.authorization ? req.headers.authorization.split(" ")[1] : req.cookies.AUTH_TOKEN);
    if (data) {
      let user = await findUserById(data.id);
      if (user) {
        req.user = user.data;
        logger.ignore(
          await checkLastAccess(
            req.headers["user-agent"],
            req.headers["cookie"],
            ip,
            user.data
          )
        );
      } else {
        req.user = null;
      }
    } else {
      req.user = null;
    }

    res.error = (status, message) => {
      logger.ignore(ip + " / " + message);
      res.status(status).json({ error: message });
    };

    res.success = (status, message) => {
      res.status(status).json({ success: message });
    };

    res.result = (status, result) => {
      res.status(status).json(result);
    };

    req.ip = ip
    next();
  };
}

export function userRoute() {
  return async function user(req, res, next) {
    if (req.user) {
      next();
    } else {
      res.error(500, "User not found");
    }
  };
}

export function creatorRoute() {
  return async function creator(req, res, next) {
    if (req.user && req.user.role == "creator") {
      next();
    } else {
      res.error(500, "User is not exist & creator");
    }
  };
}
