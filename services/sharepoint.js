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

  console.log("Token: ", token.token);

  return Client.init({
    authProvider: (done) => {
      done(null, token.token);
    },
  });
}

// 📥 Download template .docx from SharePoint
async function downloadTemplate() {
  try {
    const client = await getGraphClient();
    const siteId = process.env.SHAREPOINT_SITE_ID;
    const templatePath = process.env.SHAREPOINT_TEMPLATE_PATH;

    console.log("Downloading template from:", `/sites/${siteId}/drive/root:${templatePath}`);

    const downloadUrlResp = await client.api(`/sites/${siteId}/drive/root:${templatePath}`).get();

    const downloadUrl = downloadUrlResp["@microsoft.graph.downloadUrl"];
    if (!downloadUrl) {
      throw new Error("Download URL not found in response");
    }

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch template file: ${response.status} ${response.statusText}`);
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    if (error.responseBody) {
      console.error("Graph API error response:", error.responseBody);
    }
    console.error("Error downloading template:", error);
    throw error;
  }
}

// 📤 Upload final docx to SharePoint "Draft Versions"
async function uploadToSharePoint(fileBuffer, filename) {
  try {
    const client = await getGraphClient();
    const siteId = process.env.SHAREPOINT_SITE_ID;
    const folderPath = process.env.SHAREPOINT_UPLOAD_FOLDER;

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fullName = `${filename}-${timestamp}.docx`;
    const uploadPath = `/sites/${siteId}/drive/root:${folderPath}/${fullName}:/content`;

    console.log("Uploading to SharePoint path:", uploadPath);

    const result = await client.api(uploadPath).put(fileBuffer);

    if (!result.webUrl) {
      console.warn("Upload succeeded but webUrl missing from response", result);
    }

    return result.webUrl;
  } catch (error) {
    if (error.responseBody) {
      console.error("Graph API error response:", error.responseBody);
    }
    console.error("Error uploading file:", error);
    throw error;
  }
}

module.exports = { downloadTemplate, uploadToSharePoint };
