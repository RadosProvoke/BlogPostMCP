const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
require('dotenv').config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const key = process.env.AZURE_OPENAI_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

const client = new OpenAIClient(endpoint, new AzureKeyCredential(key));

async function testOpenAI() {
  const messages = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Summarize the following sentence: Microsoft Copilot uses OpenAI models to help automate tasks." }
  ];

  try {
    const result = await client.getChatCompletions(deployment, messages, {
      maxTokens: 200,
    });

    console.log("✅ Azure OpenAI response:");
    console.log(result.choices[0].message.content);
  } catch (err) {
    console.error("❌ Azure OpenAI test failed:");
    console.error(err.message);
  }
}

testOpenAI();
