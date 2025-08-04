const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const cors = require('cors');
const { generateBlogContent } = require('./services/openai');
const { createDocx } = require('./services/docxGenerator');
const { uploadToBlob } = require('./services/storage');
const { extractTextFromTranscript } = require('./utils/parseTranscript');

dotenv.config();

const app = express();
const upload = multer();

app.use(cors());

app.post('/generate-blog', upload.single('transcript'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No transcript file provided.' });
    }

    const rawText = req.file.buffer.toString('utf-8');
    const transcriptText = extractTextFromTranscript(rawText);
    const blogContent = await generateBlogContent(transcriptText);
    const docxBuffer = await createDocx(blogContent);
    const blobUrl = await uploadToBlob(docxBuffer);

    res.json({ url: blobUrl });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MCP Server running on port ${PORT}`));
