const { Paragraph, HeadingLevel, Packer, Document, TextRun } = require('docx');

function parseMarkdownToDocxParagraphs(markdown) {
  const lines = markdown.split('\n');
  const paragraphs = [];

  lines.forEach(line => {
    if (line.startsWith('## ')) {
      paragraphs.push(new Paragraph({
        text: line.replace(/^##\s*/, ''),
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 200,
          after: 100,
        },
        style: "sectionHeading", 
      }));
    } else if (line.trim() === '') {
      paragraphs.push(new Paragraph({ text: "", spacing: { after: 200 } }));
    } else {
      paragraphs.push(new Paragraph({
        children: [new TextRun({
          text: line,
          font: "Segoe UI",
          size: 24,  // 24 half-points = 12pt
        })],
        spacing: { after: 120 },
      }));
    }
  });

  return paragraphs;
}

async function createDocx({ title, body }) {
  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: "titleStyle",
          name: "Title Style",
          basedOn: "Normal",
          next: "Normal",
          run: {
            font: "Segoe UI",
            size: 28, // 28 half-points = 14pt
            bold: true,
          },
          paragraph: {
            spacing: {
              after: 300,
            },
          },
        },
        {
          id: "sectionHeading",
          name: "Section Heading",
          basedOn: "Normal",
          next: "Normal",
          run: {
            font: "Segoe UI",
            size: 26, // 26 half-points = 13pt
            bold: true,
          },
          paragraph: {
            spacing: {
              before: 200,
              after: 100,
            },
          },
        },
        {
          id: "normalText",
          name: "Normal Text",
          basedOn: "Normal",
          next: "Normal",
          run: {
            font: "Segoe UI",
            size: 24, // 24 half-points = 12pt
          },
          paragraph: {
            spacing: {
              after: 120,
            },
          },
        }
      ]
    },
    sections: [{
      children: [
        new Paragraph({
          text: title,
          style: "titleStyle",
        }),
        ...parseMarkdownToDocxParagraphs(body),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

module.exports = { createDocx };
