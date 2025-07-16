function extractTextFromTranscript(buffer, filename) {
  const content = buffer.toString('utf-8');
  const ext = filename.split('.').pop().toLowerCase();

  if (ext === 'txt') {
    return content;
  }

  if (ext === 'srt' || ext === 'vtt') {
    return content
      .split('\n')
      .filter(line =>
        !line.match(/^\d+$/) &&             // Brojevi linija
        !line.match(/\d{2}:\d{2}:\d{2}/)    // Timestampovi
      )
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

module.exports = { extractTextFromTranscript };
