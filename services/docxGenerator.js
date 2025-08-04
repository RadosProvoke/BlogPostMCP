const { Document, Packer, Paragraph, HeadingLevel } = require("docx");

function createSection(title, content) {
  return [
    new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
    ...content.split('\n').map(line => new Paragraph(line))
  ];
}

async function createDocx(blogText) {
  const doc = new Document();

  const sections = blogText.split(/\n(?=[A-Z].+?:)/g); // Split by section headers

  sections.forEach(section => {
    const [titleLine, ...rest] = section.trim().split('\n');
    const title = titleLine.replace(/:$/, '');
    const content = rest.join('\n').trim();
    doc.addSection({ children: createSection(title, content) });
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

module.exports = { createDocx };
