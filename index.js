const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const { generateBlogContent } = require('./services/openai');
const { createDocx } = require('./services/docxGenerator');
const { uploadToSharePoint } = require('./services/sharepoint');
const { extractTextFromTranscript } = require('./utils/parseTranscript');

dotenv.config();
const app = express();
const upload = multer();

app.post('/generate-blogpost', upload.single('transcript'), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const filename = req.file.originalname;
    const transcript = extractTextFromTranscript(buffer, filename);

    const blogContent = await generateBlogContent(transcript);
    const docBuffer = await createDocx(blogContent);

    const sharepointURL = await uploadToSharePoint(docBuffer, blogContent.title);
    res.json({ title: blogContent.title, url: sharepointURL });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`MCP server running on ${port}`));
