const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
require('dotenv').config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const key = process.env.AZURE_OPENAI_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

// ✅ Fallback check for missing env variables
if (!endpoint || !key || !deployment) {
  throw new Error("❌ Missing required Azure OpenAI environment variables. Check .env or Azure App Service Configuration.");
}

const client = new OpenAIClient(endpoint, new AzureKeyCredential(key));

async function generateBlogContent(transcript) {
  const prompt = `You are a blog writer. Create a structured and engaging blog post from the following transcript:\n\n${transcript}`;

  const messages = [
    { role: "system", content: "You generate professional blog posts from meeting transcripts." },
    { role: "user", content: prompt }
  ];

  const result = await client.getChatCompletions(deployment, messages, {
    maxTokens: 1024,
    temperature: 0.7
  });

  const content = result.choices[0].message.content;

  // First line as title
  const lines = content.trim().split('\n');
  const title = lines[0].replace(/^#+\s*/, '').trim(); // Remove markdown header
  const body = lines.slice(1).join('\n').trim();

  return { title, body };
}

module.exports = { generateBlogContent };
