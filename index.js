const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const { generateBlogContent } = require('./services/openai');
//const { createDocxFromBuffer } = require('./services/docxGenerator');
console.log("Blog content:", blogContent);
const docBuffer = await createDocx(blogContent);
const { createDocx } = require('./services/docxGenerator');
//const { uploadToSharePoint, downloadTemplate } = require('./services/sharepoint');
const { uploadToBlob } = require('./services/storage');
const { extractTextFromTranscript } = require('./utils/parseTranscript');

dotenv.config();
const app = express();
const upload = multer();

app.post('/generate-blogpost', upload.single('transcript'), async (req, res) => {
  try {
    /*
    const transcript = extractTextFromTranscript(req.file.buffer, req.file.originalname);
    const blog = await generateBlogContent(transcript);
    const templateBuffer = await downloadTemplate();
    const docx = await createDocxFromBuffer(templateBuffer, blog);
    const sharepointUrl = await uploadToSharePoint(docx, blog.title);
    res.json({ title: blog.title, url: sharepointUrl });
*/
    const buffer = req.file.buffer;
    const filename = req.file.originalname;
    const transcript = extractTextFromTranscript(buffer, filename);

    const blogContent = await generateBlogContent(transcript);
    const docBuffer = await createDocx({ title: blogContent.title, body: blogContent.content });

    const blobURL = await uploadToBlob(docBuffer, blogContent.title);
    res.json({ title: blogContent.title, url: blobURL });

    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`MCP server running on ${port}`));
