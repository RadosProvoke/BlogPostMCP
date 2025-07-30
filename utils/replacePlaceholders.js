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

async function replacePlaceholders(templateBuffer, data) {
  return await createReport({
    template: templateBuffer,
    data,
  });
}

module.exports = { replacePlaceholders };
