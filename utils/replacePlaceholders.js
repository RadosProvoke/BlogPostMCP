const { replaceTextPlaceholders } = require('docx-templates');

async function replacePlaceholders(templateBuffer, data) {
  return await replaceTextPlaceholders({
    template: templateBuffer,
    data,
  });
}

module.exports = { replacePlaceholders };
