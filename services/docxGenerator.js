const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

async function createDocx({ title, body }) {
  const templatePath = path.join(__dirname, '..', 'templates', 'blog_template.docx');
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
    doc.compile();  // calling compile() on the same doc object
  } catch (error) {
    if (error.properties && error.properties.errors instanceof Array) {
      const errors = error.properties.errors
        .map(e => e.properties.explanation)
        .join("\n");
      console.error("Errors:", errors);
    } else {
      console.error(error);
    }
    throw error;
  }

  const buf = doc.getZip().generate({ type: 'nodebuffer' });
  return buf;
}

module.exports = { createDocx };
