const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const { generateBlogContent } = require('./services/openai');
const { createDocxFromBuffer } = require('./services/docxGenerator');
const { uploadToSharePoint, downloadTemplate } = require('./services/sharepoint');
const { extractTextFromTranscript } = require('./utils/parseTranscript');

dotenv.config();
const app = express();
const upload = multer();

app.post('/generate-blogpost', upload.single('transcript'), async (req, res) => {
  try {
    const transcript = extractTextFromTranscript(req.file.buffer, req.file.originalname);
    const blog = await generateBlogContent(transcript);
    const templateBuffer = await downloadTemplate();
    const docx = await createDocxFromBuffer(templateBuffer, blog);
    const sharepointUrl = await uploadToSharePoint(docx, blog.title);
    res.json({ title: blog.title, url: sharepointUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ MCP server running on ${port}`));
