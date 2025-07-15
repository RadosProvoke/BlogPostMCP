function extractTextFromTranscript(buffer, filename) {
  const content = buffer.toString('utf-8');
  const ext = filename.split('.').pop().toLowerCase();

  if (ext === 'txt') {
    return content;
  }

  // Remove timestamps and indexes for .srt or .vtt
  if (ext === 'srt' || ext === 'vtt') {
    return content
      .split('\n')
      .filter(line => !line.match(/^\d+$/) && !line.match(/\d{2}:\d{2}:\d{2}/))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

module.exports = { extractTextFromTranscript };
