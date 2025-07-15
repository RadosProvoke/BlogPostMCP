const express = require('express');
const dotenv = require('dotenv');
const { generateBlogContent } = require('./services/openai');
const { createDocx } = require('./services/docxGenerator');
const { uploadToSharePoint } = require('./services/sharepoint');
const { extractTextFromTranscript } = require('./utils/parseTranscript');

dotenv.config();
const app = express();

// Enable JSON body parsing with increased size limit
app.use(express.json({ limit: '10mb' }));

// Endpoint to generate blog post from base64-encoded file
app.post('/generate-blogpost', async (req, res) => {
  try {
    const { name, content } = req.body;

    if (!name || !content) {
      return res.status(400).json({ error: "Missing 'name' or 'content' in request body." });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(content, 'base64');

    // Parse transcript
    const transcript = extractTextFromTranscript(buffer, name);

    // Generate blog content using OpenAI
    const blogContent = await generateBlogContent(transcript);

    // Create DOCX file
    const docBuffer = await createDocx(blogContent);

    // Upload to SharePoint
    const sharepointURL = await uploadToSharePoint(docBuffer, blogContent.title);

    // Return result
    res.json({ title: blogContent.title, url: sharepointURL });

  } catch (err) {
    console.error('Error in /generate-blogpost:', err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`MCP server running on port ${port}`));
