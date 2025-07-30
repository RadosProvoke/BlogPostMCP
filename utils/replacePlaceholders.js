const createReport = require('docx-templates');

async function replacePlaceholders(templateBuffer, data) {
  return await createReport({
    template: templateBuffer,
    data,
  });
}

module.exports = { replacePlaceholders };
