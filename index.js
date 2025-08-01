require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { MCPServer } = require('@modelcontextprotocol/sdk');

const { generateBlogContent } = require('./services/openai');
const { createDocx } = require('./services/docxGenerator');
const { uploadToBlob } = require('./services/storage');
const { extractTextFromTranscript } = require('./utils/parseTranscript');

const app = express();
const upload = multer();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/**
 * REST API endpoint
 */
app.post('/generate-blogpost', upload.single('transcript'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No transcript file uploaded." });
    }

    const buffer = req.file.buffer;
    const filename = req.file.originalname;
    const transcript = extractTextFromTranscript(buffer, filename);

    const blogContent = await generateBlogContent(transcript);
    const docBuffer = await createDocx(blogContent);
    const blobURL = await uploadToBlob(docBuffer, blogContent.title);

    res.json({ title: blogContent.title, url: blobURL });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

/**
 * MCP endpoint
 */
const mcp = new MCPServer({
  agentId: 'blogpost-generator',
  transport: 'streamable-http',
});

mcp.handle(async ({ input, files }) => {
  const file = files?.transcript;
  if (!file) return { error: "No transcript file provided." };

  const transcript = extractTextFromTranscript(file.buffer, file.name);
  const blogContent = await generateBlogContent(transcript);
  const docBuffer = await createDocx(blogContent);
  const blobURL = await uploadToBlob(docBuffer, blogContent.title);

  return {
    title: blogContent.title,
    url: blobURL
  };
});

// Registruj MCP kao middleware na /mcp
app.use('/mcp', mcp.middleware());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
