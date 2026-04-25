const express = require("express");
const multer = require("multer");
const requireAuth = require("../middleware/requireAuth");
const {
  uploadPdf,
  chatWithDocument,
  getUserDocuments,
  getDocumentDetails
} = require("../controllers/aiController");

const router = express.Router();

// Setup Multer for memory storage (we just need the buffer to parse the PDF)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Require auth for all AI routes
router.use(requireAuth);

router.post("/upload", upload.single("pdf"), uploadPdf);
router.post("/chat/:documentId", chatWithDocument);
router.get("/documents", getUserDocuments);
router.get("/documents/:documentId", getDocumentDetails);

module.exports = router;
