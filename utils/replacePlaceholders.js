/*
const createReport = require('docx-templates').default;

console.log('createReport:', createReport);


async function replacePlaceholders(templateBuffer, data) {
  return await createReport({
    template: templateBuffer,
    data,
  });
}

module.exports = { replacePlaceholders };
*/
const docxTemplates = require('docx-templates');
const createReport = docxTemplates.default || docxTemplates;

console.log('docxTemplates:', typeof docxTemplates, Object.keys(docxTemplates));
console.log('createReport:', typeof createReport);

async function replacePlaceholders(templateBuffer, data) {
  return await createReport({
    template: templateBuffer,
    data,
  });
}

module.exports = { replacePlaceholders };

