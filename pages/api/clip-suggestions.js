const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Convert any HH:MM:SS:FF, HH:MM:SS.mmm, HH:MM:SS, MM:SS to clean M:SS
function formatTimestamp(raw) {
  if (!raw) return null;
  const clean = raw.trim().split('.')[0]; // drop milliseconds
  const parts = clean.split(':');
  if (parts.length === 4) {
    // HH:MM:SS:FF — drop frames
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const s = parts[2].padStart(2, '0');
    return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${s}` : `${m}:${s}`;
  }
  if (parts.length === 3) {
    // HH:MM:SS
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const s = parts[2].padStart(2, '0');
    return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${s}` : `${m}:${s}`;
  }
  if (parts.length === 2) {
    // MM:SS
    return `${parseInt(parts[0], 10)}:${parts[1].padStart(2,'0')}`;
  }
  return null;
}

// Detect and parse any CSV format — sniffs the header to find timestamp and text columns
function parseCSV(raw) {
  const lines = raw.split('\n');
  if (lines.length < 2) return null;

  // Parse a single CSV line respecting quoted fields
  const parseLine = (line) => {
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { fields.push(current.trim()); current = ''; }
      else { current += ch; }
    }
    fields.push(current.trim());
    return fields;
  };

  const header = parseLine(lines[0].trim()).map(h => h.toLowerCase());

  // Find column indices
  let startCol = -1, textCol = -1;

  // Named column detection
  for (let i = 0; i < header.length; i++) {
    const h = header[i];
    if (startCol === -1 && (h.includes('start') || h.includes('time') || h === 'in')) startCol = i;
    if (textCol === -1 && (h.includes('text') || h.includes('content') || h.includes('caption') || h.includes('transcript'))) textCol = i;
  }

  // Fallback: sniff first data row for a timestamp-shaped field
  if (startCol === -1 || textCol === -1) {
    const firstData = parseLine(lines[1]?.trim() || '');
    for (let i = 0; i < firstData.length; i++) {
      if (startCol === -1 && /\d{1,2}:\d{2}(:\d{2})?(:\d{2})?/.test(firstData[i])) startCol = i;
      if (textCol === -1 && firstData[i].split(' ').length > 4) textCol = i;
    }
  }

  if (startCol === -1 || textCol === -1) return null;

  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const fields = parseLine(line);
    if (fields.length <= Math.max(startCol, textCol)) continue;
    const ts   = formatTimestamp(fields[startCol]);
    const text = fields[textCol];
    if (!text || text.length < 3) continue;
    result.push(ts ? `[${ts}] ${text}` : text);
  }

  return result.length > 0 ? result.join('\n') : null;
}

// Parse SRT format
function parseSRT(raw) {
  const result = [];
  const blocks = raw.trim().split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;
    // Find the timecode line: 00:00:01,000 --> 00:00:04,000
    let tsLine = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/\d{2}:\d{2}:\d{2}[,\.]\d+ -->/.test(lines[i])) { tsLine = i; break; }
    }
    if (tsLine === -1) continue;
    const tsMatch = lines[tsLine].match(/(\d{2}:\d{2}:\d{2})/);
    const ts = tsMatch ? formatTimestamp(tsMatch[1]) : null;
    const text = lines.slice(tsLine + 1).join(' ').replace(/<[^>]+>/g, '').trim();
    if (!text) continue;
    result.push(ts ? `[${ts}] ${text}` : text);
  }
  return result.length > 0 ? result.join('\n') : null;
}

// Parse plain text — handles Premiere Pro .txt export and generic transcripts
// Premiere Pro .txt: "00:00:50:19 - 00:01:10:23\nUnknown\nText..."
function parsePlainText(raw) {
  const lines = raw.split('\n');
  const result = [];
  let pendingTs = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Premiere Pro .txt range line: 00:00:50:19 - 00:01:10:23
    const rangeMatch = line.match(/^(\d{2}:\d{2}:\d{2}[:\d]*)\s*[-–]\s*(\d{2}:\d{2}:\d{2}[:\d]*)$/);
    if (rangeMatch) {
      pendingTs = formatTimestamp(rangeMatch[1]);
      continue;
    }

    // Standalone timestamp line: [00:01:10] or 00:01:10
    const tsMatch = line.match(/^[\[\(]?(\d{1,2}:\d{2}(:\d{2})?(:\d{2})?)[\]\)]?$/);
    if (tsMatch) {
      pendingTs = formatTimestamp(tsMatch[1]);
      continue;
    }

    // Inline timestamp at start of line: 00:01:10 Some text...
    const inlineMatch = line.match(/^(\d{1,2}:\d{2}(:\d{2})?(:\d{2})?)\s+(.+)/);
    if (inlineMatch) {
      const ts = formatTimestamp(inlineMatch[1]);
      result.push(ts ? `[${ts}] ${inlineMatch[4]}` : inlineMatch[4]);
      pendingTs = null;
      continue;
    }

    // Bare speaker label — skip
    if (/^(Unknown|Speaker\s*\d*|Host|Guest|Interviewer|Interviewee)$/i.test(line)) continue;

    // Regular text line
    if (pendingTs) {
      result.push(`[${pendingTs}] ${line}`);
      pendingTs = null;
    } else {
      result.push(line);
    }
  }

  return result.length > 0 ? result.join('\n') : raw;
}

// Master parser — detects format and routes accordingly
function parseTranscript(raw, filename = '') {
  const ext = filename.toLowerCase().split('.').pop();

  if (ext === 'csv' || (ext !== 'srt' && ext !== 'vtt' && raw.includes('","'))) {
    const csv = parseCSV(raw);
    if (csv) return csv;
  }

  if (ext === 'srt' || ext === 'vtt' || /\d{2}:\d{2}:\d{2}[,\.]\d+ -->/.test(raw)) {
    const srt = parseSRT(raw);
    if (srt) return srt;
  }

  return parsePlainText(raw);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript, filename = '' } = req.body;

  if (!transcript || transcript.trim().length < 100) {
    return res.status(400).json({ error: 'Transcript too short or missing' });
  }

  const processed    = parseTranscript(transcript, filename);
  const hasTimestamps = /\[\d+:\d{2}\]/.test(processed);
  const truncated    = processed.slice(0, 90000);

  const prompt = `You are a podcast content strategist specialising in short-form social media clips.

Analyse this podcast transcript and identify exactly 5 of the most powerful, emotionally engaging moments that would perform well as short-form clips on Instagram Reels, YouTube Shorts, and TikTok.

${hasTimestamps
  ? 'The transcript contains inline timestamps in [M:SS] format. Use these EXACT timestamps for start_time and end_time — copy them verbatim from the transcript, including the brackets.'
  : 'This transcript has no timestamps. Use your best estimate of position in the episode for start_time and end_time — e.g. "around 5:00", "around 12:30" based on the content flow.'
}

For each clip return:
- start_time: ${hasTimestamps ? 'exact timestamp copied from the transcript e.g. "4:43"' : 'best estimate e.g. "around 5:00"'}
- end_time: ${hasTimestamps ? 'exact timestamp copied from the transcript' : 'best estimate'}
- title: a punchy, hook-driven title for the clip (max 10 words)
- hook: the opening caption line (max 20 words, no hashtags)
- reason: one sentence explaining why this moment will perform well
- transcript_excerpt: the exact spoken words from this moment — maximum 60 words

Focus on: personal revelations, surprising ironies, emotional turning points, raw honesty, counterintuitive insights.

Respond ONLY with a valid JSON array of exactly 5 objects. Start with [ and end with ]. No markdown, no backticks, no preamble.

TRANSCRIPT:
${truncated}`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return res.status(500).json({ error: 'API request failed — please try again' });
    }

    const data = await response.json();
    const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!raw) {
      return res.status(500).json({ error: 'No response from AI — please try again' });
    }

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error('No JSON array in response:', raw.slice(0, 500));
      return res.status(500).json({ error: 'Could not parse AI response — please try again' });
    }

    const clips = JSON.parse(match[0]);
    return res.status(200).json({ clips, hasTimestamps });

  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: 'Failed to process transcript — please try again' });
  }
}