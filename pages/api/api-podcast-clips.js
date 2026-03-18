const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
const MAX_CHARS = 90000;

// ── Transcript cleaner ──
// Strips bare speaker label lines, reformats timestamp lines inline with the text that follows
function cleanTranscript(raw) {
  const lines = raw.split('\n');
  const cleaned = [];
  let pendingTimestamp = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect timestamp-only lines: e.g. "00:01:10" / "00:01:10,500" / "[00:01:10]"
    const timestampOnly = /^[\[\(]?\d{1,2}:\d{2}(:\d{2})?(,\d+)?[\]\)]?\s*$/.test(line);
    if (timestampOnly) {
      pendingTimestamp = line.replace(/[\[\]\(\)]/g, '').split(',')[0].trim();
      continue;
    }

    // Detect bare speaker labels: single word / "Speaker 1" / "Unknown" / "Guest:" with no real text after
    const bareLabel = /^(Unknown|Speaker\s*\d*|Host|Guest|Interviewer|Interviewee|[A-Z][a-z]+):?\s*$/.test(line);
    if (bareLabel) {
      continue;
    }

    // If we have a pending timestamp, prepend it inline
    if (pendingTimestamp) {
      cleaned.push(`[${pendingTimestamp}] ${line}`);
      pendingTimestamp = null;
    } else {
      // Check if the line itself starts with a timestamp — normalise it
      const inlineTs = line.match(/^(\d{1,2}:\d{2}(:\d{2})?)\s+(.*)/);
      if (inlineTs) {
        cleaned.push(`[${inlineTs[1]}] ${inlineTs[3]}`);
      } else {
        cleaned.push(line);
      }
    }
  }

  return cleaned.join('\n');
}

function buildPrompt(transcript, clipStyle, context, previousTitles) {
  const styleInstructions = {
    viral:         'Find the 5 moments with the absolute highest viral potential for short-form social media. Optimise purely for what stops the scroll, drives shares, and performs on Instagram Reels, TikTok and YouTube Shorts. No category constraints — just raw performance potential.',
    emotional:     'Find the 5 most emotionally powerful moments — peak vulnerability, raw feeling, human connection, grief, joy, breakthrough. These are the moments that make people stop and feel something.',
    actionable:    'Find the 5 moments that contain the most concrete, usable advice or insight. These clips should leave the viewer with something specific they can apply immediately. Clarity and practicality are the priority.',
    controversial: 'Find the 5 most provocative, opinion-led moments — takes that will make people react, disagree, debate or share to argue about. The goal is reaction, not consensus.',
    raw:           'Find the 5 most unfiltered, candid moments — where the guest drops their guard, admits something difficult, or speaks with unusual directness. Authenticity and rawness are the priority.',
    surprising:    'Find the 5 most unexpected moments — surprising facts, reversals of expectation, admissions the audience would not see coming, or revelations that reframe something.',
  };

  const avoidBlock = previousTitles.length > 0
    ? `\n\nIMPORTANT: The following clips have already been suggested. Do NOT suggest any of these moments or anything closely related to them:\n${previousTitles.map(t => `- ${t}`).join('\n')}\nFind 5 entirely different moments from the transcript.`
    : '';

  const contextBlock = context
    ? `\n\nAdditional context from the user: ${context}`
    : '';

  return `You are an expert short-form content strategist specialising in podcast clips. Your job is to identify the best moments from a transcript to cut as short-form video content for social media.

Infer the podcast name, guest, topic and tone directly from the transcript. Do not ask for clarification.${contextBlock}

CLIP STRATEGY: ${styleInstructions[clipStyle] || styleInstructions.viral}${avoidBlock}

TRANSCRIPT:
${transcript}

Identify exactly 5 clip moments. For each clip return:
- start_time: the timestamp where the clip should begin (use the inline timestamps from the transcript, formatted as MM:SS or HH:MM:SS — if no timestamps exist use "—")
- end_time: the timestamp where the clip should end
- title: a short, punchy clip title (max 8 words)
- hook: a caption hook written to stop the scroll — lead with the most compelling line from the moment, written as a standalone social caption (1-3 sentences max)
- reason: 1-2 sentences explaining why this moment works as a clip and why it will perform
- transcript_excerpt: the verbatim words spoken in this moment, as they appear in the transcript (50-120 words)

Respond ONLY with a valid JSON object. No preamble, no explanation, no markdown fences. Exactly this structure:
{
  "clips": [
    {
      "start_time": "MM:SS",
      "end_time": "MM:SS",
      "title": "Clip title here",
      "hook": "Caption hook here",
      "reason": "Why this works as a clip",
      "transcript_excerpt": "Verbatim words from the transcript"
    }
  ]
}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript, clipStyle = 'viral', context = '', previousTitles = [] } = req.body;

  if (!transcript || transcript.trim().length < 100) {
    return res.status(400).json({ error: 'Transcript is too short or missing.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured.' });
  }

  // Clean and truncate
  const cleaned   = cleanTranscript(transcript);
  const truncated = cleaned.length > MAX_CHARS ? cleaned.slice(0, MAX_CHARS) : cleaned;
  const prompt    = buildPrompt(truncated, clipStyle, context, previousTitles);

  try {
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature:     0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', errText);
      return res.status(502).json({ error: 'Gemini API request failed. Please try again.' });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(502).json({ error: 'No response from Gemini. Please try again.' });
    }

    // Strip any accidental markdown fences
    const cleanJson = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr, '\nRaw:', rawText);
      return res.status(502).json({ error: 'Failed to parse clip suggestions. Please try again.' });
    }

    if (!parsed.clips || !Array.isArray(parsed.clips)) {
      return res.status(502).json({ error: 'Unexpected response format. Please try again.' });
    }

    return res.status(200).json({ clips: parsed.clips });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}