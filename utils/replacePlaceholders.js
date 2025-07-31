const createReport = require('docx-templates');

async function replacePlaceholders(templateBuffer, data) {
  try {
    return await createReport({
      template: templateBuffer,
      data,
      cmdDelimiter: ['{', '}'],
      processLineBreaks: true,
    });
  } catch (error) {
    console.error("Error replacing placeholders:", error);
    throw error;
  }
}

module.exports = { replacePlaceholders };
