import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
const app = express();

let corsOptions = {
   origin : ['http://localhost:5173'],
};

//Middleware
app.use(cors());
app.use(express.json());

//File Upload Config
const allowedMimeTypes = ['text/csv', 'application/vnd.ms-excel'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // The folder where files will be stored
  },
  filename: function (req, file, cb) {
    // Use the original filename
    cb(null, file.originalname); 
  }
});


const upload = multer({
  storage: storage,
  filename: function (req, file, cb) {
    // Use the original filename and extension
    cb(null, (file.originalname).trim().toLowerCase()); 
  },
  limits:{fileSize:'1000000'},
  fileFilter: (req, file, callback) => {
    const isMimeType = allowedMimeTypes.includes(file.mimetype);
    const isExtName = path.extname(file.originalname).toLowerCase() === '.csv';

    if (isMimeType && isExtName) {
      return callback(null, true); // Accept the file
    } else {
      callback("Only .csv files are allowed"); // Reject the file
    }
  }
});

app.get('/', (req, res) => {
    res.set('Content-Type', 'text/html');
    res.send('Hello world !!');
});

app.post("/upload", (req, res) => {
  upload.single("csv")(req, res, function (err) {
    if (err) {
      console.error("Multer error:", err.message);  // log for debug
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

export default app;