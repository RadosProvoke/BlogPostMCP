require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, HeadingLevel } = require('docx');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/generate-docx', async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Both title and content are required.' });
  }

  try {
    const doc = new Document();
    doc.addSection({
      children: [
        new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
        ...content.split('\n').map((line) => new Paragraph({ text: line, spacing: { after: 200 } })),
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const fileName = `blogpost_${Date.now()}.docx`;
    const filePath = path.join(__dirname, 'public', fileName);

    fs.writeFileSync(filePath, buffer);

    const downloadUrl = `${req.protocol}://${req.get('host')}/${fileName}`;
    res.status(200).json({ downloadUrl });
  } catch (error) {
    console.error('Failed to generate docx:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.send('✅ MCP BlogPost Generator is running.');
});

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
