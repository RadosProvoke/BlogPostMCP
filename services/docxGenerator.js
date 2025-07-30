const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

async function createDocx({ title, body }) {
  const templatePath = path.join(__dirname, '..', 'templates', 'blog_template.docx');
  const content = fs.readFileSync(templatePath, 'binary');

  // PizZip učitava DOCX kao zip
  const zip = new PizZip(content);

  // Inicijalizujemo docxtemplater sa zip-om
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Postavljamo podatke u template
  doc.setData({
    TITLE: title,
    CONTENT: body,
  });

  try {
    // Generišemo dokument sa popunjenim podacima
    doc.render();
  } catch (error) {
    // Obrada greške prilikom renderovanja
    const e = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      properties: error.properties,
    };
    console.error(JSON.stringify({ error: e }));
    throw error;
  }

  // Dobijamo generisani buffer dokumenta
  const buf = doc.getZip().generate({ type: 'nodebuffer' });
  return buf;
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
