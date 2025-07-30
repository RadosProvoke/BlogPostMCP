const { createReport } = require('docx-templates');

console.log('createReport:', createReport);


async function replacePlaceholders(templateBuffer, data) {
  return await createReport({
    template: templateBuffer,
    data,
  });
}

module.exports = { replacePlaceholders };
