require('dotenv').config();
const { MCPServer } = require('@modelcontextprotocol/sdk');
const { extractTextFromTranscript } = require('../utils/parseTranscript');
const { generateBlogContent } = require('../services/openai');
const { createDocx } = require('../services/docxGenerator');
const { uploadToBlob } = require('../services/storage');

const server = new MCPServer({
  agentId: 'blogpost-generator',
  transport: 'streamable-http',
});

server.handle(async ({ input, files }) => {
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

server.listen(process.env.PORT || 3000);
