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
      // Prazan red sa razmakom
      paragraphs.push(new Paragraph({ text: "", spacing: { after: 200 } }));
    } else {
      // Provera da li je linija link u formatu: - [tekst](url)
      const linkMatch = line.match(/^\s*-\s*\[(.+?)\]\((https?:\/\/[^\s)]+)\)/);
      if (linkMatch) {
        const [, text, url] = linkMatch;
        const hyperlink = new ExternalHyperlink({
          children: [new TextRun({ text, style: "hyperlink" })],
          link: url,
        });
        paragraphs.push(new Paragraph({
          children: [hyperlink],
          spacing: { after: 120 }
        }));
      } else {
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: "Segoe UI",
              size: 24, // 12pt
            })
          ],
          spacing: { after: 120 }
        }));
      }
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
          id: "hyperlink",
          name: "Hyperlink",
          basedOn: "Normal",
          next: "Normal",
          run: {
            color: "0000FF",
            underline: "single",
            font: "Segoe UI",
            size: 24, // 12pt
          },
        },
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
