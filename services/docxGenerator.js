const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

async function createDocxFromBuffer(templateBuffer, { title, body }) {
  const zip = new PizZip(templateBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true
  });

  doc.setData({
    TITLE: title,
    CONTENT: body
  });

  doc.render();

  return Buffer.from(doc.getZip().generate({ type: 'nodebuffer' }));
}

module.exports = { createDocxFromBuffer };
