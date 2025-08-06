import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const app = express();

let corsOptions = {
  origin: ["http://localhost:5173"],
};

const parsedDataStore = {};

//Middleware
app.use(cors());
app.use(express.json());

function checkDuplicates(req, res, next) {
  const rawFilename = req.headers["x-filename"];
  if (!rawFilename) {
    return res.status(400).json({ error: "filename not provided." });
  }
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const filename = rawFilename.trim().toLowerCase();
  const filepath = path.join(__dirname, "uploads", filename);
  if (fs.existsSync(filepath)) {
    return res.status(409).json({ error: "file already exists." });
  }

  return next();
}

//File Upload Config
const allowedMimeTypes = ["text/csv", "application/vnd.ms-excel"];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // The folder where files will be stored
  },
  filename: function (req, file, cb) {
    // Use the original filename
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: "1000000" },
  fileFilter: (req, file, callback) => {
    const isMimeType = allowedMimeTypes.includes(file.mimetype);
    const isExtName = path.extname(file.originalname).toLowerCase() === ".csv";

    if (isMimeType && isExtName) {
      return callback(null, true); // Accept the file
    } else {
      callback("Only .csv files are allowed"); // Reject the file
    }
  },
});

app.get("/", (req, res) => {
  res.set("Content-Type", "text/html");
  res.send("Hello world !!");
});

app.post("/upload", checkDuplicates, (req, res) => {
  upload.single("csv")(req, res, function (err) {
    if (err) {
      console.error("Multer error:", err.message); // log for debug
      return res.status(400).json({ error: err.message });
    }

    // Check if no file is provided
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("File uploaded:", req.file);
    return res.json({ message: "Successfully uploaded csv" });
  });
});

app.post("/store-valid-data", (req, res) => {
  const { filename, rows } = req.body;

  if (!filename || !rows) {
    return res.status(400).json({ error: "Missing filename or data" });
  }

  parsedDataStore[filename] = rows;
  console.log("Stored validRows for:", filename);

  return res.json({ message: "Data stored successfully" });
});

app.get('/data/:filename', (req, res) => {
  const filename = req.params.filename;
  const retrievedData = parsedDataStore[filename];
   if (!retrievedData) {
    return res.status(404).json({ error: "No data found for that file" });
  }

  return res.json(retrievedData);
});

export default app;
