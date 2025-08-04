const { Document, Packer, Paragraph, TextRun, HeadingLevel, ExternalHyperlink } = require('docx');

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
      const children = [];
      const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(line)) !== null) {
        const textBefore = line.substring(lastIndex, match.index);
        if (textBefore) {
          children.push(new TextRun({
            text: textBefore,
            font: "Segoe UI",
            size: 24,
          }));
        }

        const displayText = match[1];
        const url = match[2];

        children.push(new ExternalHyperlink({
          children: [
            new TextRun({
              text: displayText,
              style: "Hyperlink",
            })
          ],
          link: url
        }));

        lastIndex = regex.lastIndex;
      }

      const remainingText = line.substring(lastIndex);
      if (remainingText) {
        children.push(new TextRun({
          text: remainingText,
          font: "Segoe UI",
          size: 24,
        }));
      }

      paragraphs.push(new Paragraph({
        children,
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
            size: 28, // 14pt
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
            size: 26, // 13pt
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
        ...parseMarkdownToDocxParagraphs(body),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

module.exports = { createDocx };
