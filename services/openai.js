const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
require('dotenv').config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const key = process.env.AZURE_OPENAI_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

const client = new OpenAIClient(endpoint, new AzureKeyCredential(key));

async function generateBlogContent(transcript) {
  const prompt = `
You are a technical blog writer.

From the transcript below, create a complete blog post with these rules:

- Start with a strong blog post title generated from transcript
- Then divide the body into 5–7 logical sections
- Each section should have a unique heading based on its content (for example: 1. Problem Framing, 2. The Solution, 3. How It Works, 4. Customer Evidence, 5. Conclusion, 6. Call to Action)
- Format each section using markdown:
  ## Section Heading
  <text>

Do not use generic section titles. Infer them from the actual transcript.

Transcript:
${transcript}
`;

  const messages = [
    { role: "system", content: "You generate well-structured blog posts from transcripts." },
    { role: "user", content: prompt }
  ];

  const result = await client.getChatCompletions(deployment, messages, {
    maxTokens: 1500,
    temperature: 0.7
  });

  const content = result.choices[0].message.content;
  const lines = content.trim().split('\n');

  // Pretpostavljamo da je prvi red naslov, počinje sa # ili ## ...
  const title = lines[0].replace(/^#+\s*/, '').trim();
  const body = lines.slice(1).join('\n').trim();

  return { title, body };
}

module.exports = { generateBlogContent };

