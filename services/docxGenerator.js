const fs = require('fs');
const path = require('path');
const { createReport } = require('docx-templates');

async function createDocx({ title, body }) {
  const templatePath = path.join(__dirname, '../templates/blog_template.docx');
  const templateBuffer = fs.readFileSync(templatePath);

  try {
    const buffer = await createReport({
      template: templateBuffer,
      data: {
        TITLE: title,
        CONTENT: body,
      },
      cmdDelimiter: ['{', '}'],
      processLineBreaks: true,
    });

    return buffer;
  } catch (error) {
    console.error("Error generating document:", error);
    throw error;
  }
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
