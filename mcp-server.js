// mcp-server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs/promises');
const mammoth = require('mammoth');

const { generateBlogContent } = require('./services/openai');
const { createDocx } = require('./services/docxGenerator');
const { uploadToBlob } = require('./services/storage');
const { extractTextFromTranscript } = require('./utils/parseTranscript');

dotenv.config();

const app = express();

// Multer setup for file upload in memory
const upload = multer({ storage: multer.memoryStorage() });

// Enable CORS for all origins (adjust if needed)
app.use(cors());

// Parse JSON bodies (for transcriptText in JSON fallback)
app.use(express.json());

// Health check endpoint
app.get('/v1/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// POST /v1/context - main MCP endpoint
app.post('/v1/context', upload.single('file'), async (req, res) => {
  try {
    let transcript = '';

    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();

      if (ext === '.docx') {
        // Extract text from docx using mammoth
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        transcript = result.value.trim();
        if (!transcript) {
          return res.status(400).json({ error: 'No text extracted from the uploaded .docx file.' });
        }
      } else if (ext === '.txt' || ext === '.srt' || ext === '.vtt') {
        transcript = extractTextFromTranscript(req.file.buffer, req.file.originalname);
      } else {
        return res.status(400).json({ error: `Unsupported file type: ${ext}. Supported types: .txt, .srt, .vtt, .docx` });
      }
    } else if (req.body.transcriptText && typeof req.body.transcriptText === 'string') {
      transcript = req.body.transcriptText.trim();
    } else {
      return res.status(400).json({ error: 'No file uploaded and no transcriptText provided in JSON body.' });
    }

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript text is empty after extraction.' });
    }

    console.log('Transcript (preview):', transcript.slice(0, 500));

    // Generate blog content from transcript
    const blogContent = await generateBlogContent(transcript);
    console.log('Generated blog title:', blogContent.title);

    // Create DOCX buffer
    const docBuffer = await createDocx({ title: blogContent.title, body: blogContent.body });

    // Upload to Azure Blob Storage
    const docxUrl = await uploadToBlob(docBuffer, blogContent.title);

    console.log('Uploaded docx URL:', docxUrl);

    // Respond with MCP context object
    res.json({
      type: 'blogpost',
      title: blogContent.title,
      content: blogContent.body,
      output: {
        docxUrl,
      },
      metadata: {
        source: 'Azure OpenAI',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Error in /v1/context:', err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`MCP server listening on port ${port}`);
});
