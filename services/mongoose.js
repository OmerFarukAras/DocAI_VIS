import mongoose from "mongoose";

export default function loadDB(logger) {
  mongoose
    .connect("___")
    .then(() => {
      logger.info("Connected to DB");
    })
    .catch((err) => {
      logger.error(err);
    });
}