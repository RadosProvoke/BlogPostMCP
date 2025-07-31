const { Document, Packer, Paragraph, TextRun, HeadingLevel, ExternalHyperlink } = require("docx");

function parseMarkdownToDocxParagraphs(markdown) {
  const lines = markdown.split("\n");
  const paragraphs = [];

  lines.forEach(line => {
    if (line.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^##\s*/, ""),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          style: "sectionHeading",
        })
      );
    } else if (line.trim() === "") {
      paragraphs.push(new Paragraph({ text: "", spacing: { after: 200 } }));
    } else {
      const parts = [];
      const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(
            new TextRun({
              text: line.substring(lastIndex, match.index),
              font: "Segoe UI",
              size: 24,
            })
          );
        }

        parts.push(
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: match[1],
                style: "Hyperlink",
                font: "Segoe UI",
                size: 24,
                color: "0000FF",
                underline: { type: "single" },
              }),
            ],
            link: match[2],
          })
        );

        lastIndex = regex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push(
          new TextRun({
            text: line.substring(lastIndex),
            font: "Segoe UI",
            size: 24,
          })
        );
      }

      paragraphs.push(
        new Paragraph({
          children: parts,
          spacing: { after: 120 },
        })
      );
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
          run: {
            font: "Segoe UI",
            size: 28,
            bold: true,
          },
          paragraph: {
            spacing: { after: 300 },
          },
        },
        {
          id: "sectionHeading",
          name: "Section Heading",
          basedOn: "Normal",
          run: {
            font: "Segoe UI",
            size: 26,
            bold: true,
          },
          paragraph: {
            spacing: { before: 200, after: 100 },
          },
        },
        {
          id: "Hyperlink",
          name: "Hyperlink",
          basedOn: "Normal",
          run: {
            color: "0000FF",
            underline: "single",
            font: "Segoe UI",
            size: 24,
          },
        },
      ],
    },
    sections: [
      {
        children: [
          new Paragraph({
            text: title,
            style: "titleStyle",
          }),
          ...parseMarkdownToDocxParagraphs(body),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

module.exports = { createDocx };
