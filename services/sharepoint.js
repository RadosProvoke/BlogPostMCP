const { Client } = require("@microsoft/microsoft-graph-client");
const { ClientSecretCredential } = require("@azure/identity");
require("isomorphic-fetch");
require("dotenv").config();

async function getGraphClient() {
  const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID,
    process.env.AZURE_CLIENT_ID,
    process.env.AZURE_CLIENT_SECRET
  );
  const token = await credential.getToken("https://graph.microsoft.com/.default");

  return Client.init({ authProvider: done => done(null, token.token) });
}

// 📥 Download template .docx from SharePoint
async function downloadTemplate() {
  const client = await getGraphClient();
  const siteId = process.env.SHAREPOINT_SITE_ID;
  const templatePath = process.env.SHAREPOINT_TEMPLATE_PATH;

  const downloadUrlResp = await client.api(`/sites/${siteId}/drive/root:${templatePath}`).get();
  const downloadUrl = downloadUrlResp['@microsoft.graph.downloadUrl'];
  const response = await fetch(downloadUrl);
  return Buffer.from(await response.arrayBuffer());
}

// 📤 Upload final docx to SharePoint "Draft Versions"
async function uploadToSharePoint(fileBuffer, filename) {
  const client = await getGraphClient();
  const siteId = process.env.SHAREPOINT_SITE_ID;
  const folderPath = process.env.SHAREPOINT_UPLOAD_FOLDER;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fullName = `${filename}-${timestamp}.docx`;
  const uploadPath = `/sites/${siteId}/drive/root:${folderPath}/${fullName}:/content`;

  const result = await client.api(uploadPath).put(fileBuffer);
  return result.webUrl;
}

module.exports = { downloadTemplate, uploadToSharePoint };
