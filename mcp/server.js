// mcp/server.js
require('dotenv').config();
const express = require('express');
const { MCPServer } = require('@modelcontextprotocol/sdk');
const { extractTextFromTranscript } = require('../utils/parseTranscript');
const { generateBlogContent } = require('../services/openai');
const { createDocx } = require('../services/docxGenerator');
const { uploadToBlob } = require('../services/storage');

const app = express();
const port = process.env.PORT || 3000;

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

// Register MCP as middleware on the route /mcp
app.use('/mcp', mcp.middleware());

app.listen(port, () => {
  console.log(`MCP server running on port ${port}`);
});
