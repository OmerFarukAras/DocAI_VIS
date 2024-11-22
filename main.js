import Express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";

import { Logger } from "./util/logger.js";
import mainMiddleware from "./middlewares/main.middleware.js";
import loadDB from "./services/mongoose.js";
import { LoadAdmin } from "./services/admin.js";

import { mainRoute } from "./routes/main.route.js";
import { authRoute } from "./routes/auth.route.js";

const app = Express();

const $ = new Logger().init();

const port = 3000;

loadDB($);

app.use(cors());
app.use(cookieParser());
app.use(mainMiddleware($));
app.use($.express());
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

LoadAdmin(app);

app.use("/", mainRoute($));
app.use("/auth", authRoute($));

app.listen(port, () => {
  $.info("Server started on : " + port);
});