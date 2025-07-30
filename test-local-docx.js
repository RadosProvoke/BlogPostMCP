const fs = require('fs');
const path = require('path');
const createReport = require('docx-templates').createReport;

(async () => {
  const templatePath = path.join(__dirname, 'templates', 'blog_template.docx');
  const outputPath = path.join(__dirname, 'output.docx');

  const templateBuffer = fs.readFileSync(templatePath);

  const result = await createReport({
    template: templateBuffer,
    data: {
      TITLE: 'Test Blog Title',
      CONTENT: 'This is a test blog content generated locally to verify placeholder replacement.'
    }
  });

  fs.writeFileSync(outputPath, result);
  console.log('✅ output.docx je uspešno kreiran.');
})();
