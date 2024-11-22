import express from "express";
import { registerValidator } from "../validators/register.validator.js";
import {
  createUser,
  filterUser,
  findUserById,
  findUserByMail,
  findUserByName,
} from "../models/user.model.js";
import { loginValidator } from "../validators/login.validator.js";
import ValidateToken from "../util/otpAuth.js";

import jwt from "jsonwebtoken";

const router = express.Router();

export function authRoute(logger, mailer) {
  router.post("/register", async (req, res) => {
    if (req.user) res.clearCookie("AUTH_TOKEN");
    let value = registerValidator.validate(req.body);
    if (value.error) {
      res.error(500, value.error.details[0].message);
    } else {
      let data = await createUser(value.value);
      if (data.error) {
        res.error(500, data.error);   
      } else {
        let user = data.data;
        res.cookie("AUTH_TOKEN", user.generateToken());
        logger.ignore("User created", user);
        mailer.sendRegisterMail({
          email: user.email,
          username: user.username,
        });
        res.result(200, {
          data: {
            token: user.generateToken(),
          },
        });
      }
    }
  });

  router.post("/login", async (req, res) => {
    let { username, password } = req.body;
    let value = loginValidator.validate({ username, password });
    if (value.error) {
      res.error(500, value.error.details[0].message);
    } else {
      let data = await findUserByName(value.value.username);
      if (data.error) {
        data = await findUserByMail(value.value.username);
        if (data.error) {
          res.error(500, "User not found");
        }
      } else {
        if (data.data) {
          let user = data.data;
          let result = await user.comparePassword(value.value.password);
          if (result) {
            if (user.otpActive) {
              let data = ValidateToken(user.secret, req.body.token);
              if (data.error) {
                res.error(400, "Invalid token");
                return;
              }
            }
            res.cookie("AUTH_TOKEN", user.generateToken());
            logger.ignore("User logged in as ", user);
            res.result(200, {
              data: {
                token: user.generateToken(),
              },
            });
          } else {
            res.error(500, "Password is incorrect");
          }
        } else {
          res.error(500, "User not found");
        }
      }
    }
  });

  router.post("/verify", async (req, res) => {
    let { token } = req.body;
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          res.error(500, "Token is invalid");
        } else {
          res.result(200, { data: decoded });
        }
      });
    }
  });

  router.post("/", async (req, res) => {
    if (req.user) {
      let user = req.user.toObject();
      res.result(200, {
        data: filterUser(user),
      });
    } else {
      res.error(500, "Usxr not found");
    }
  });

  router.get("/check", async (req, res) => {
    let { username } = req.body;
    if (username.includes("@")) {
      let data = await findUserByMail(username);
      if (data.error) {
        res.error(500, "User not found");
      } else if (data.data) {
        res.result(200, { data: "User found" });
      } else {
        res.error(500, "User not found");
      }
    } else {
      let data = await findUserByName(username);
      if (data.error) {
        res.error(500, "User not found");
      } else if (data.data) {
        res.result(200, { data: "User found" });
      } else {
        res.error(500, "User not found");
      }
    }
  });

  router.get("/logout", async (req, res) => {
    res.clearCookie("AUTH_TOKEN");
    res.success(200, "Logout success");
  });

  return router;
}
