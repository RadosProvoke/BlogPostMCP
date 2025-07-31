const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

function createDocx({ title, body }) {
  const templatePath = path.join(__dirname, '../templates/blog_template.docx');
  const content = fs.readFileSync(templatePath, 'binary');

  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.setData({
    TITLE: title,
    CONTENT: body,
  });

  try {
    doc.render();
  } catch (error) {
    console.error("Error rendering docx:", error);
    throw error;
  }

  const buffer = doc.getZip().generate({ type: 'nodebuffer' });
  return buffer;
}

module.exports = { createDocx };

/*
const fs = require('fs');
const path = require('path');
const { replacePlaceholders } = require('../utils/replacePlaceholders');

async function createDocx({ title, body }) {
  const templatePath = path.join(__dirname, '..', 'templates', 'blog_template.docx');
  console.log(templatePath);
  const templateBuffer = fs.readFileSync(templatePath);
  const filledBuffer = await replacePlaceholders(templateBuffer, { TITLE: title, CONTENT: body });
  return filledBuffer;
}

module.exports = { createDocx };
*/
