const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');

function parseMarkdownToDocxParagraphs(markdown, doc) {
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
      const parts = [];
      const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(new TextRun({
            text: line.substring(lastIndex, match.index),
            font: "Segoe UI",
            size: 24,
          }));
        }

        // Kreiramo hyperlink koristeći doc.createHyperlink
        const hyperlink = doc.createHyperlink(match[2]);
        parts.push(new TextRun({
          text: match[1],
          style: "Hyperlink",
          hyperlink,
        }));

        lastIndex = regex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push(new TextRun({
          text: line.substring(lastIndex),
          font: "Segoe UI",
          size: 24,
        }));
      }

      paragraphs.push(new Paragraph({
        children: parts,
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
            size: 28,
            bold: true,
          },
          paragraph: {
            spacing: { after: 300 }
          }
        },
        {
          id: "sectionHeading",
          name: "Section Heading",
          basedOn: "Normal",
          next: "Normal",
          run: {
            font: "Segoe UI",
            size: 26,
            bold: true,
          },
          paragraph: {
            spacing: { before: 200, after: 100 }
          }
        },
        {
          id: "Hyperlink",
          name: "Hyperlink",
          basedOn: "Normal",
          next: "Normal",
          run: {
            font: "Segoe UI",
            color: "0000FF",
            underline: "single",
            size: 24,
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
        ...parseMarkdownToDocxParagraphs(body, doc),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

module.exports = { createDocx };
