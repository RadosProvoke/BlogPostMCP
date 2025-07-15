const { Document, Packer, Paragraph, HeadingLevel } = require("docx");

async function createDocx({ title, body }) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_1
        }),
        ...body.split('\n').map(
          line => new Paragraph(line.trim())
        )
      ]
    }]
  });

  return await Packer.toBuffer(doc);
}

module.exports = { createDocx };
