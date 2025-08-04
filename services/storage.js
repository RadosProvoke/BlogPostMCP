const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_CONTAINER_NAME);

async function uploadToBlob(buffer) {
  const blobName = `blog-${uuidv4()}.docx`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
  });
  return blockBlobClient.url;
}

module.exports = { uploadToBlob };
