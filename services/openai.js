const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY
});

async function generateBlogContent(transcriptText) {
  const prompt = `
You are a technical blog writer.

From the transcript below, create a complete blog post with these rules:

- Start with a strong blog post title generated from transcript
- Then divide the body into 5–7 logical sections
- Each section should have a unique heading based on its content (for example: 1. Problem Framing, 2. The Solution, 3. How It Works, 4. Customer Evidence, 5. Conclusion, 6. Call to Action)
- Format each section using markdown:
  ## Section Heading
  <text>

- Update "6. Call to Action" section with 2–4 **relevant, educational links** (Microsoft Learn, GitHub, spec, tutorials) focused on the document content.
- Format links in the last section as markdown list:  
  - [label](url)
  
Do not use generic section titles. Infer them from the actual transcript.

Transcript:
${transcriptText}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });

  return response.choices[0].message.content;
}

module.exports = { generateBlogContent };






}

module.exports = { generateBlogContent };
