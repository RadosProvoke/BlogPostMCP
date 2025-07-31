const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ExternalHyperlink
} = require('docx');

function parseMarkdownToDocxParagraphs(markdown) {
  const lines = markdown.split('\n');
  const paragraphs = [];

  lines.forEach(line => {
    // Detekcija markdown podnaslova
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
    }

    // Detekcija markdown hyperlinka u listi: - [text](url)
    else if (line.match(/^- \[.*\]\(.*\)/)) {
      const match = line.match(/^- \[(.*?)\]\((.*?)\)/);
      if (match) {
        const [_, label, url] = match;

        paragraphs.push(new Paragraph({
          children: [
            new ExternalHyperlink({
              children: [
                new TextRun({
                  text: label,
                  style: "Hyperlink",
                  font: "Segoe UI",
                  size: 24,
                }),
              ],
              link: url,
            })
          ],
          bullet: { level: 0 },
          spacing: { after: 100 }
        }));
      }
    }

    // Prazne linije – pravi se prazni red sa razmakom
    else if (line.trim() === '') {
      paragraphs.push(new Paragraph({ text: "", spacing: { after: 200 } }));
    }

    // Običan tekst
    else {
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
