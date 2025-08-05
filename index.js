const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { generateBlogContent } = require('./services/openai');
const { createDocx } = require('./services/docxGenerator');
const { uploadToBlob } = require('./services/storage');

dotenv.config();

const app = express();

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add JSON body parser
app.use(express.json());

/**
 * POST /generate-blogpost
 * Accepts JSON: { transcriptText: "some text" }
 */
app.post('/generate-blogpost', async (req, res) => {
  try {
    const transcript = req.body.transcriptText;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: "transcriptText (string) is required in JSON body." });
    }

    console.log("Transcript received (preview):", transcript.slice(0, 500));

    const blogContent = await generateBlogContent(transcript);

    console.log("Generated blog title:", blogContent.title);
    console.log("Generated blog body:", blogContent.body);

    const docBuffer = await createDocx({ title: blogContent.title, body: blogContent.body });
    const blobURL = await uploadToBlob(docBuffer, blogContent.title);

    console.log("File uploaded to Blob Storage. URL:", blobURL);

    res.json({ title: blogContent.title, url: blobURL });

  } catch (err) {
    console.error("Error during blog generation:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`MCP server running on ${port}`));
