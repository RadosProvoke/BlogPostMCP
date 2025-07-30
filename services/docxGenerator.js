/*
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
*/

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
