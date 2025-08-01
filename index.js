const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

const { generateBlogContent } = require('./services/openai');
const { createDocx } = require('./services/docxGenerator');
const { uploadToBlob } = require('./services/storage');
const { extractTextFromTranscript } = require('./utils/parseTranscript');

dotenv.config();

const app = express();

// Parsiranje JSON tela sa velikim limitom za base64 fajlove
app.use(express.json({ limit: '10mb' }));

// Serve static files (e.g. /.well-known/ai-plugin.json)
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.post('/generate-blogpost', async (req, res) => {
  try {
    console.log("Received request to /generate-blogpost");

    const { filename, fileContent } = req.body;

    if (!filename || !fileContent) {
      console.error("Missing filename or fileContent in request body.");
      return res.status(400).json({ error: "Request body must include 'filename' and 'fileContent' (base64)." });
    }

    // Decode base64 content to buffer
    const buffer = Buffer.from(fileContent, 'base64');

    console.log(`Received file: ${filename} (${buffer.length} bytes)`);

    // Extract plain transcript text from buffer based on file extension
    const transcript = extractTextFromTranscript(buffer, filename);

    console.log("Transcript extracted:", transcript.slice(0, 500));

    // Generate blog content from transcript
    const blogContent = await generateBlogContent(transcript);

    console.log("Generated blog title:", blogContent.title);
    console.log("Generated blog body length:", blogContent.body.length);

    // Create docx buffer from generated content
    const docBuffer = await createDocx({ title: blogContent.title, body: blogContent.body });

    // Upload docx to Azure Blob Storage
    const blobURL = await uploadToBlob(docBuffer, blogContent.title);

    console.log("File uploaded to Blob Storage. URL:", blobURL);

    res.json({ title: blogContent.title, url: blobURL });

  } catch (err) {
    console.error("Error during blog generation:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Serve OpenAPI spec
app.get('/openapi.yaml', (req, res) => {
  res.type('application/yaml');
  res.sendFile(path.join(__dirname, 'openapi.yaml'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`MCP server running on ${port}`));
