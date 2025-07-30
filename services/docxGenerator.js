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
const { Document, Packer } = require('docx');
const { replacePlaceholders } = require('../utils/replacePlaceholders');
const { readFileSync } = require('fs');
const { readDocxTemplate } = require('../utils/readDocxTemplate');

async function createDocx({ title, body }) {
  const templatePath = path.join(__dirname, 'templates', 'blog_template.docx');
  const templateBuffer = readFileSync(templatePath);
  const filledBuffer = await replacePlaceholders(templateBuffer, { CONTENT: body });
  return filledBuffer;
}

module.exports = { createDocxFromBuffer };
