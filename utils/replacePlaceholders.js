const { createReport } = require('docxtemplater');

async function replacePlaceholders(templateBuffer, data) {
  console.log(data);
  return await createReport({
    template: templateBuffer,
    data,
  });
}

module.exports = { replacePlaceholders };
