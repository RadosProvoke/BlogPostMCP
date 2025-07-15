const { Client } = require("@microsoft/microsoft-graph-client");
require("isomorphic-fetch");
require("dotenv").config();
const { ClientSecretCredential } = require("@azure/identity");

async function getGraphClient() {
  const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID,
    process.env.AZURE_CLIENT_ID,
    process.env.AZURE_CLIENT_SECRET
  );

  const token = await credential.getToken("https://graph.microsoft.com/.default");

  return Client.init({
    authProvider: done => done(null, token.token)
  });
}

async function uploadToSharePoint(fileBuffer, filename) {
  const client = await getGraphClient();
  const siteId = process.env.SHAREPOINT_SITE_ID;
  const folderPath = process.env.SHAREPOINT_FOLDER_PATH;

  const now = new Date().toISOString().replace(/[:.]/g, '-');
  const fullName = `${filename}-${now}.docx`;

  const uploadPath = `/sites/${siteId}/drive/root:${folderPath}/${fullName}:/content`;

  const result = await client.api(uploadPath).put(fileBuffer);
  return result.webUrl;
}

module.exports = { uploadToSharePoint };
