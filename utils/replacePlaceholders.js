const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

function replacePlaceholders(templateBuffer, data) {
  // Load the docx file as binary content
  const zip = new PizZip(templateBuffer);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Set the template variables
  doc.setData(data);

  try {
    // Perform the rendering
    doc.render();
  } catch (error) {
    // Handle errors (optional: improve error logging)
    console.error('Error rendering docxtemplater template:', error);
    throw error;
  }

  // Generate buffer with the rendered document
  const buffer = doc.getZip().generate({ type: 'nodebuffer' });

  return buffer;
}

module.exports = { replacePlaceholders };
