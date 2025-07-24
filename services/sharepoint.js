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

    // Log paths for debug
    console.log("Downloading template from:", `/sites/${siteId}/drive/root:${templatePath}`);

    // Get the download URL
    const downloadUrlResp = await client.api(`/sites/${siteId}/drive/root:${templatePath}`).get();

    const downloadUrl = downloadUrlResp["@microsoft.graph.downloadUrl"];
    if (!downloadUrl) {
      throw new Error("Download URL not found in response");
    }

    // Fetch the file content from downloadUrl
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch template file: ${response.status} ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error("Error downloading template from SharePoint:", error);
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

    // Compose upload path correctly: no query params, no UI URLs, just drive API path
    const uploadPath = `/sites/${siteId}/drive/root:${folderPath}/${fullName}:/content`;

    console.log("Uploading to SharePoint path:", uploadPath);

    const result = await client.api(uploadPath).put(fileBuffer);

    if (!result.webUrl) {
      console.warn("Upload succeeded but webUrl missing from response", result);
    }

    return result.webUrl;
  } catch (error) {
    console.error("Error uploading file to SharePoint:", error);

    // Optional: inspect error.responseBody if present for more details
    if (error.responseBody) {
      console.error("Graph API response body:", error.responseBody);
    }

    throw error;
  }
}

module.exports = { downloadTemplate, uploadToSharePoint };
