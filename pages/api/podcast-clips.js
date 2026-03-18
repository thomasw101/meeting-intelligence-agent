const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ── Timestamp normaliser ──
// Converts any HH:MM:SS:FF / HH:MM:SS.mmm / HH:MM:SS / MM:SS to clean M:SS
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

// ── CSV parser — sniffs header to find timestamp and text columns ──
function parseCSV(raw) {
  const lines = raw.split('\n');
  if (lines.length < 2) return null;

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
  let startCol = -1, textCol = -1;

  for (let i = 0; i < header.length; i++) {
    const h = header[i];
    if (startCol === -1 && (h.includes('start') || h.includes('time') || h === 'in')) startCol = i;
    if (textCol === -1 && (h.includes('text') || h.includes('content') || h.includes('caption') || h.includes('transcript'))) textCol = i;
  }

  // Fallback: sniff first data row
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

// ── SRT / VTT parser ──
function parseSRT(raw) {
  const result = [];
  const blocks = raw.trim().split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;
    let tsLine = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/\d{2}:\d{2}:\d{2}[,\.]\d+ -->/.test(lines[i])) { tsLine = i; break; }
    }
    if (tsLine === -1) continue;
    const tsMatch = lines[tsLine].match(/(\d{2}:\d{2}:\d{2})/);
    const ts   = tsMatch ? formatTimestamp(tsMatch[1]) : null;
    const text = lines.slice(tsLine + 1).join(' ').replace(/<[^>]+>/g, '').trim();
    if (!text) continue;
    result.push(ts ? `[${ts}] ${text}` : text);
  }
  return result.length > 0 ? result.join('\n') : null;
}

// ── Plain text parser ──
// Handles Premiere Pro .txt (range lines), standalone timestamps, inline timestamps, plain paste
function parsePlainText(raw) {
  const lines = raw.split('\n');
  const result = [];
  let pendingTs = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Premiere Pro .txt range: 00:00:50:19 - 00:01:10:23
    const rangeMatch = line.match(/^(\d{2}:\d{2}:\d{2}[:\d]*)\s*[-–]\s*(\d{2}:\d{2}:\d{2}[:\d]*)$/);
    if (rangeMatch) {
      pendingTs = formatTimestamp(rangeMatch[1]);
      continue;
    }

    // Standalone timestamp: [00:01:10] or 00:01:10
    const tsMatch = line.match(/^[\[\(]?(\d{1,2}:\d{2}(:\d{2})?(:\d{2})?)[\]\)]?$/);
    if (tsMatch) {
      pendingTs = formatTimestamp(tsMatch[1]);
      continue;
    }

    // Inline timestamp at start: 00:01:10 Some text here
    const inlineMatch = line.match(/^(\d{1,2}:\d{2}(:\d{2})?(:\d{2})?)\s+(.+)/);
    if (inlineMatch) {
      const ts = formatTimestamp(inlineMatch[1]);
      result.push(ts ? `[${ts}] ${inlineMatch[4]}` : inlineMatch[4]);
      pendingTs = null;
      continue;
    }

    // Bare speaker label — skip
    if (/^(Unknown|Speaker\s*\d*|Host|Guest|Interviewer|Interviewee)$/i.test(line)) continue;

    // Regular text
    if (pendingTs) {
      result.push(`[${pendingTs}] ${line}`);
      pendingTs = null;
    } else {
      result.push(line);
    }
  }

  return result.length > 0 ? result.join('\n') : raw;
}

// ── Master parser — detects format and routes ──
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

// ── Clip style instructions ──
const STYLE_INSTRUCTIONS = {
  viral:         'Find the 5 moments with the absolute highest viral potential for short-form social media. Optimise purely for what stops the scroll, drives shares, and performs on Instagram Reels, TikTok and YouTube Shorts. No category constraints — just raw performance potential.',
  emotional:     'Find the 5 most emotionally powerful moments — peak vulnerability, raw feeling, human connection, grief, joy, breakthrough. These are the moments that make people stop and feel something.',
  actionable:    'Find the 5 moments that contain the most concrete, usable advice or insight. These clips should leave the viewer with something specific they can apply immediately.',
  controversial: 'Find the 5 most provocative, opinion-led moments — takes that will make people react, disagree, debate or share to argue about.',
  raw:           'Find the 5 most unfiltered, candid moments — where the guest drops their guard, admits something difficult, or speaks with unusual directness.',
  surprising:    'Find the 5 most unexpected moments — surprising facts, reversals of expectation, admissions the audience would not see coming, or revelations that reframe something.',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript, clipStyle = 'viral', context = '', previousTitles = [], filename = '' } = req.body;

  if (!transcript || transcript.trim().length < 100) {
    return res.status(400).json({ error: 'Transcript is too short or missing.' });
  }

  const processed     = parseTranscript(transcript, filename);
  const hasTimestamps = /\[\d+:\d{2}\]/.test(processed);
  const truncated     = processed.slice(0, 90000);

  const avoidBlock = previousTitles.length > 0
    ? `\n\nIMPORTANT: Do NOT suggest any of these moments already shown:\n${previousTitles.map(t => `- ${t}`).join('\n')}\nFind 5 entirely different moments.`
    : '';

  const contextBlock     = context ? `\n\nAdditional context: ${context}` : '';
  const styleInstruction = STYLE_INSTRUCTIONS[clipStyle] || STYLE_INSTRUCTIONS.viral;

  const prompt = `You are an expert short-form content strategist specialising in podcast clips. Infer the podcast name, guest, topic and tone directly from the transcript.${contextBlock}

CLIP STRATEGY: ${styleInstruction}${avoidBlock}

${hasTimestamps
  ? 'The transcript contains inline timestamps in [M:SS] format. Use these EXACT timestamps for start_time and end_time — copy them verbatim from the transcript.'
  : 'This transcript has no timestamps. Use your best estimate of position in the episode — e.g. "around 5:00", "around 12:30" based on content flow.'
}

For each clip return:
- start_time: ${hasTimestamps ? 'exact timestamp from the transcript e.g. "4:43"' : 'best estimate e.g. "around 5:00"'}
- end_time: ${hasTimestamps ? 'exact timestamp from the transcript' : 'best estimate'}
- title: punchy clip title, max 8 words
- hook: caption hook to stop the scroll, 1-3 sentences, no hashtags
- reason: 1-2 sentences on why this works as a clip
- transcript_excerpt: verbatim words spoken in this moment, max 60 words

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
      return res.status(502).json({ error: 'API request failed. Please try again.' });
    }

    const data = await response.json();
    const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!raw) {
      return res.status(502).json({ error: 'No response from AI. Please try again.' });
    }

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error('No JSON array in response:', raw.slice(0, 500));
      return res.status(502).json({ error: 'Could not parse clip suggestions. Please try again.' });
    }

    const clips = JSON.parse(match[0]);
    return res.status(200).json({ clips, hasTimestamps });

  } catch (err) {
    console.error('Handler error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}