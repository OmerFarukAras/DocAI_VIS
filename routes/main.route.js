import express from "express";
import multer from "multer";

const router = express.Router();

export function mainRoute(logger) {
  const upload = multer({ storage: storage });
  app.post('/fileSum', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    if(req.file) {
      req
    }
    res.send({
        message: 'File uploaded successfully',
        file: req.file
    });
});

  router.get("/textSum", (req, res) => {
    res.send("hello world");
  });
  return router;
}
