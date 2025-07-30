const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob'); 
require('dotenv').config();

async function uploadToBlob(fileBuffer, filename) {
  const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const key = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

  // Timestamp za unikatan naziv fajla (izbegavaj dvotačke i tačke)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fullName = `${filename}-${timestamp}.docx`;

  const credential = new StorageSharedKeyCredential(account, key);
  const blobServiceClient = new BlobServiceClient(
    `https://${account}.blob.core.windows.net`,
    credential
  );

  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();

  const blockBlobClient = containerClient.getBlockBlobClient(fullName);
  await blockBlobClient.uploadData(fileBuffer);

  return blockBlobClient.url;  // vraća URL uploadovanog fajla
}

module.exports = { uploadToBlob };
