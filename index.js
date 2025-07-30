const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const { generateBlogContent } = require('./services/openai');
const { createDocx } = require('./services/docxGenerator');
const { uploadToBlob } = require('./services/storage');
const { extractTextFromTranscript } = require('./utils/parseTranscript');

dotenv.config();

const app = express();
const upload = multer();

app.post('/generate-blogpost', upload.single('transcript'), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const filename = req.file.originalname;
    const transcript = extractTextFromTranscript(buffer, filename);

    // generating blog post content
    const blogContent = await generateBlogContent(transcript);
    console.log("Blog content:", blogContent); // blog content

    // creating .docx file with field names 
    const docBuffer = await createDocx({ title: blogContent.title, body: blogContent.body });

    // Upload to Blob storage
    const blobURL = await uploadToBlob(docBuffer, blogContent.title);

    // sending URL-a to the client
    res.json({ title: blogContent.title, url: blobURL });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`MCP server running on ${port}`));
