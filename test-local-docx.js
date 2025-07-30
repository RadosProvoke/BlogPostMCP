require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createDocx } = require('./services/docxGenerator');

async function test() {
  try {
    // Primer dummy podataka za test
    const blogContent = {
      title: 'Test Blog Title',
      body: 'Ovo je testni sadržaj koji treba da zameni {{CONTENT}} u šablonu.'
    };

    const buffer = await createDocx(blogContent);

    // Upisujemo generisani .docx u fajl da proverimo rezultat
    const outputPath = path.join(__dirname, 'output.docx');
    fs.writeFileSync(outputPath, buffer);

    console.log('Fajl je uspešno generisan:', outputPath);
  } catch (err) {
    console.error('Greška pri generisanju .docx fajla:', err);
  }
}

test();
