import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

// ─── QUESTION BANK ────────────────────────────────────────────────────────────

const QUESTION_BANK = [
  // NUMBER SEQUENCES
  { id: 'ns1', type: 'sequence', difficulty: 1, question: 'What comes next?\n\n2,  4,  6,  8,  ?', options: ['9', '10', '11', '12'], answer: '10', explanation: 'Add 2 each time. 8 + 2 = 10.' },
  { id: 'ns2', type: 'sequence', difficulty: 1, question: 'What comes next?\n\n5,  10,  15,  20,  ?', options: ['22', '24', '25', '30'], answer: '25', explanation: 'Multiples of 5. 20 + 5 = 25.' },
  { id: 'ns3', type: 'sequence', difficulty: 2, question: 'What comes next?\n\n1,  4,  9,  16,  ?', options: ['20', '24', '25', '36'], answer: '25', explanation: 'Perfect squares: 1², 2², 3², 4², 5² = 25.' },
  { id: 'ns4', type: 'sequence', difficulty: 2, question: 'What comes next?\n\n2,  6,  18,  54,  ?', options: ['108', '162', '180', '216'], answer: '162', explanation: 'Multiply by 3 each time. 54 × 3 = 162.' },
  { id: 'ns5', type: 'sequence', difficulty: 3, question: 'What comes next?\n\n1,  1,  2,  3,  5,  8,  ?', options: ['11', '12', '13', '14'], answer: '13', explanation: 'Fibonacci — each term is the sum of the two before it. 5 + 8 = 13.' },
  { id: 'ns6', type: 'sequence', difficulty: 3, question: 'What comes next?\n\n3,  5,  10,  12,  24,  26,  ?', options: ['28', '48', '50', '52'], answer: '52', explanation: 'Alternating operations: +2 then ×2. 26 × 2 = 52.' },
  { id: 'ns7', type: 'sequence', difficulty: 4, question: 'What comes next?\n\n2,  3,  5,  9,  17,  ?', options: ['25', '31', '33', '34'], answer: '33', explanation: 'Each term = (previous × 2) − 1. (17 × 2) − 1 = 33.' },
  { id: 'ns8', type: 'sequence', difficulty: 4, question: 'What comes next?\n\n1,  2,  6,  24,  120,  ?', options: ['240', '480', '600', '720'], answer: '720', explanation: 'Factorials: 1!, 2!, 3!, 4!, 5!, 6! = 720.' },
  { id: 'ns9', type: 'sequence', difficulty: 5, question: 'What comes next?\n\n4,  7,  13,  25,  49,  ?', options: ['73', '97', '98', '100'], answer: '97', explanation: 'Each term = (previous × 2) − 1. (49 × 2) − 1 = 97.' },
  { id: 'ns10', type: 'sequence', difficulty: 5, question: 'What comes next?\n\n1,  3,  7,  15,  31,  ?', options: ['47', '57', '63', '65'], answer: '63', explanation: 'Each term = (previous × 2) + 1. (31 × 2) + 1 = 63.' },

  // VERBAL ANALOGIES
  { id: 'va1', type: 'verbal', difficulty: 1, question: 'Dog is to Puppy\nas\nCat is to ?', options: ['Cub', 'Kitten', 'Foal', 'Calf'], answer: 'Kitten', explanation: 'A puppy is a young dog. A kitten is a young cat.' },
  { id: 'va2', type: 'verbal', difficulty: 1, question: 'Hot is to Cold\nas\nDay is to ?', options: ['Dusk', 'Dark', 'Night', 'Evening'], answer: 'Night', explanation: 'Hot and cold are opposites. Day and night are opposites.' },
  { id: 'va3', type: 'verbal', difficulty: 2, question: 'Pen is to Writer\nas\nBrush is to ?', options: ['Canvas', 'Painter', 'Colour', 'Art'], answer: 'Painter', explanation: 'A pen is the tool of a writer. A brush is the tool of a painter.' },
  { id: 'va4', type: 'verbal', difficulty: 2, question: 'Library is to Books\nas\nGallery is to ?', options: ['Frames', 'Artists', 'Paintings', 'Museums'], answer: 'Paintings', explanation: 'A library houses books. A gallery houses paintings.' },
  { id: 'va5', type: 'verbal', difficulty: 3, question: 'Novella is to Novel\nas\nStream is to ?', options: ['Ocean', 'Pond', 'River', 'Lake'], answer: 'River', explanation: 'A novella is a shorter novel. A stream is a smaller river.' },
  { id: 'va6', type: 'verbal', difficulty: 3, question: 'Epilogue is to Book\nas\nCoda is to ?', options: ['Film', 'Music', 'Dance', 'Poem'], answer: 'Music', explanation: 'An epilogue concludes a book. A coda concludes a piece of music.' },
  { id: 'va7', type: 'verbal', difficulty: 4, question: 'Prolific is to Output\nas\nTaciturn is to ?', options: ['Speed', 'Words', 'Thought', 'Action'], answer: 'Words', explanation: 'Prolific means producing much output. Taciturn means using very few words.' },
  { id: 'va8', type: 'verbal', difficulty: 4, question: 'Soliloquy is to Actor\nas\nMonograph is to ?', options: ['Scholar', 'Reader', 'Publisher', 'Editor'], answer: 'Scholar', explanation: 'A soliloquy is an actor\'s solo speech. A monograph is a scholar\'s focused written work.' },
  { id: 'va9', type: 'verbal', difficulty: 5, question: 'Heuristic is to Algorithm\nas\nIntuition is to ?', options: ['Emotion', 'Memory', 'Logic', 'Instinct'], answer: 'Logic', explanation: 'A heuristic is a practical shortcut vs. a formal algorithm. Intuition is a gut-feel shortcut vs. formal logic.' },
  { id: 'va10', type: 'verbal', difficulty: 5, question: 'Enervate is to Vigour\nas\nObfuscate is to ?', options: ['Knowledge', 'Truth', 'Light', 'Clarity'], answer: 'Clarity', explanation: 'To enervate is to drain vigour. To obfuscate is to obscure clarity.' },

  // PATTERN RECOGNITION
  { id: 'pr1', type: 'pattern', difficulty: 1, question: 'Which number completes the grid?\n\n[ 2  |  4 ]\n[ 3  |  ? ]', options: ['5', '6', '7', '8'], answer: '6', explanation: 'The right column doubles the left. 3 × 2 = 6.' },
  { id: 'pr2', type: 'pattern', difficulty: 2, question: 'Which number completes the grid?\n\n[ 9   |  3 ]\n[ 16  |  4 ]\n[ 25  |  ? ]', options: ['4', '5', '6', '7'], answer: '5', explanation: 'The right column is the square root of the left. √25 = 5.' },
  { id: 'pr3', type: 'pattern', difficulty: 2, question: 'Which number completes the grid?\n\n[ 1  |  2  |  3 ]\n[ 4  |  5  |  6 ]\n[ 7  |  8  |  ? ]', options: ['8', '9', '10', '11'], answer: '9', explanation: 'Sequential numbers in a 3×3 grid. After 8 comes 9.' },
  { id: 'pr4', type: 'pattern', difficulty: 3, question: 'Which number completes the grid?\n\n[ 2  |  4  |  8  ]\n[ 3  |  9  |  27 ]\n[ 4  |  16 |  ?  ]', options: ['32', '48', '64', '128'], answer: '64', explanation: 'Each row: n, n², n³. So 4, 16, 4³ = 64.' },
  { id: 'pr5', type: 'pattern', difficulty: 3, question: 'Which number completes the grid?\n\n[ 1  |  4  |  9  ]\n[ 16 |  25 |  36 ]\n[ 49 |  64 |  ?  ]', options: ['72', '81', '100', '121'], answer: '81', explanation: 'Perfect squares in order. The 9th is 9² = 81.' },
  { id: 'pr6', type: 'pattern', difficulty: 4, question: 'Which number completes the grid?\n\n[ 3  |  6  |  18 ]\n[ 4  |  8  |  32 ]\n[ 5  |  10 |  ?  ]', options: ['15', '25', '50', '100'], answer: '50', explanation: 'Pattern: n, 2n, 2n×n. So 5, 10, 10×5 = 50.' },
  { id: 'pr7', type: 'pattern', difficulty: 5, question: 'Which number completes the grid?\n\n[ 2  |  5  |  11 ]\n[ 3  |  7  |  15 ]\n[ 4  |  9  |  ?  ]', options: ['17', '18', '19', '20'], answer: '19', explanation: 'Pattern: n, (2n+1), (4n+3). So 4, 9, (4×4)+3 = 19.' },

  // LOGICAL REASONING
  { id: 'lr1', type: 'logic', difficulty: 1, question: 'Tom is taller than Sam.\nSam is taller than Alex.\n\nWho is the shortest?', options: ['Tom', 'Sam', 'Alex', 'Cannot tell'], answer: 'Alex', explanation: 'Tom > Sam > Alex. Alex is shortest.' },
  { id: 'lr2', type: 'logic', difficulty: 2, question: 'All Bloops are Razzies.\nAll Razzies are Lazzies.\n\nTherefore:', options: ['Some Bloops are Lazzies', 'No Bloops are Lazzies', 'All Bloops are Lazzies', 'All Lazzies are Bloops'], answer: 'All Bloops are Lazzies', explanation: 'Bloops → Razzies → Lazzies. By transitivity, all Bloops are Lazzies.' },
  { id: 'lr3', type: 'logic', difficulty: 2, question: 'If it rains, the ground gets wet.\nThe ground is wet.\n\nTherefore:', options: ['It definitely rained', 'It definitely did not rain', 'It may or may not have rained', 'The rain caused flooding'], answer: 'It may or may not have rained', explanation: 'The ground could be wet for other reasons. This is the logical fallacy of affirming the consequent.' },
  { id: 'lr4', type: 'logic', difficulty: 3, question: 'All roses are flowers.\nSome flowers fade quickly.\n\nTherefore:', options: ['All roses fade quickly', 'No roses fade quickly', 'Some roses may fade quickly', 'Roses are not flowers'], answer: 'Some roses may fade quickly', explanation: 'Since only "some" flowers fade quickly, roses may or may not be among them.' },
  { id: 'lr5', type: 'logic', difficulty: 3, question: 'No fish are mammals.\nAll dolphins are mammals.\n\nTherefore:', options: ['Some dolphins are fish', 'No dolphins are fish', 'All fish are dolphins', 'Some mammals are fish'], answer: 'No dolphins are fish', explanation: 'All dolphins are mammals. No fish are mammals. So dolphins and fish are entirely separate.' },
  { id: 'lr6', type: 'logic', difficulty: 4, question: 'Five people sit in a row.\nAnna sits right of Ben.\nCarlos sits left of Ben.\nDiana sits right of Anna.\n\nWho sits in the middle?', options: ['Anna', 'Ben', 'Carlos', 'Diana'], answer: 'Anna', explanation: 'Order: Carlos, Ben, Anna, Diana, [5th]. Anna is 3rd — the middle position.' },
  { id: 'lr7', type: 'logic', difficulty: 4, question: '"If I study, I pass."\n"I did not pass."\n\nWhat can we conclude?', options: ['I did not study', 'I studied but failed anyway', 'Studying does not help', 'Nothing can be concluded'], answer: 'I did not study', explanation: 'Modus tollens: If P → Q, and not Q, then not P. No pass means no study.' },
  { id: 'lr8', type: 'logic', difficulty: 5, question: 'Some A are B.\nAll B are C.\nNo C are D.\n\nWhich must be true?', options: ['Some A are D', 'No A are D', 'Some A are not D', 'All A are C'], answer: 'Some A are not D', explanation: 'Some A are B → those A are also C → those A are not D. So some A are not D.' },

  // WORKING MEMORY
  { id: 'wm1', type: 'memory', difficulty: 1, question: 'What letter comes next?\n\nB,  D,  F,  H,  ?', options: ['I', 'J', 'K', 'L'], answer: 'J', explanation: 'Every other letter: B(2), D(4), F(6), H(8), J(10).' },
  { id: 'wm2', type: 'memory', difficulty: 2, question: 'If A=1, B=2, C=3...\n\nWhat does CAB equal as a number?', options: ['123', '312', '321', '213'], answer: '312', explanation: 'C=3, A=1, B=2. Written in order: 312.' },
  { id: 'wm3', type: 'memory', difficulty: 2, question: 'Which number is missing?\n\nList 1:  3,  7,  12,  19,  28\nList 2:  3,  12,  19,  28', options: ['3', '7', '12', '19'], answer: '7', explanation: '7 appears in List 1 but is absent from List 2.' },
  { id: 'wm4', type: 'memory', difficulty: 3, question: 'A shop sells apples for 30p\nand oranges for 45p.\n\nYou buy 3 apples and 2 oranges.\nWhat is the total?', options: ['£1.50', '£1.65', '£1.70', '£1.80'], answer: '£1.80', explanation: '3 × 30p = 90p. 2 × 45p = 90p. Total = £1.80.' },
  { id: 'wm5', type: 'memory', difficulty: 3, question: 'Reverse the word SMART.\nThen take the 3rd letter.\n\nWhat do you get?', options: ['A', 'M', 'R', 'T'], answer: 'A', explanation: 'SMART reversed = TRAMS. The 3rd letter is A.' },
  { id: 'wm6', type: 'memory', difficulty: 4, question: 'A train leaves at 09:45.\nIt takes 1h 35min to City A,\nthen 50min to City B.\n\nWhat time does it arrive at City B?', options: ['11:50', '12:00', '12:10', '12:20'], answer: '12:10', explanation: '09:45 + 1h35m = 11:20. 11:20 + 50m = 12:10.' },
  { id: 'wm7', type: 'memory', difficulty: 5, question: 'Remember this sequence:\n7,  3,  9,  1,  5,  8,  2\n\nWhat is the sum of the\n3rd and 5th numbers?', options: ['10', '12', '14', '16'], answer: '14', explanation: '3rd number = 9. 5th number = 5. 9 + 5 = 14.' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const TYPE_LABELS = {
  sequence: 'Number Sequences',
  verbal:   'Verbal Reasoning',
  pattern:  'Pattern Recognition',
  logic:    'Logical Reasoning',
  memory:   'Working Memory',
};

const DIFFICULTY_WEIGHTS = { 1: 1, 2: 1.5, 3: 2.2, 4: 3, 5: 4 };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function selectQuestions(count) {
  const types = ['sequence', 'verbal', 'pattern', 'logic', 'memory'];
  const perType = Math.floor(count / types.length);
  const extra = count % types.length;
  let selected = [];
  types.forEach((type, i) => {
    const pool = QUESTION_BANK.filter(q => q.type === type);
    const need = perType + (i < extra ? 1 : 0);
    selected = selected.concat(shuffle(pool).slice(0, Math.min(need, pool.length)));
  });
  return shuffle(selected);
}

function calculateIQ(answers, questions) {
  let raw = 0, max = 0;
  questions.forEach(q => {
    const w = DIFFICULTY_WEIGHTS[q.difficulty];
    max += w;
    if (answers[q.id] === q.answer) raw += w;
  });
  const pct = raw / max;
  const z = (pct - 0.5) * 3;
  return Math.max(55, Math.min(145, Math.round(100 + z * 15)));
}

function getIQBand(iq) {
  if (iq >= 130) return { label: 'Very Superior',  color: '#7DF9FF' };
  if (iq >= 120) return { label: 'Superior',        color: '#7DF9FF' };
  if (iq >= 110) return { label: 'High Average',    color: '#7DF9FF' };
  if (iq >= 90)  return { label: 'Average',         color: 'rgba(255,255,255,0.75)' };
  if (iq >= 80)  return { label: 'Low Average',     color: '#FF6B35' };
  if (iq >= 70)  return { label: 'Borderline',      color: '#FF6B35' };
  return                 { label: 'Below Average',  color: '#FF6B35' };
}

function getPercentile(iq) {
  const table = [[145,99.9],[140,99.6],[135,99],[130,98],[125,95],[120,91],[115,84],[110,75],[105,63],[100,50],[95,37],[90,25],[85,16],[80,9],[75,5],[70,2]];
  for (const [score, pct] of table) { if (iq >= score) return pct; }
  return 1;
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, '0')}`;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function IQTest() {
  const [phase, setPhase]         = useState('intro');
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx]             = useState(0);
  const [selected, setSelected]   = useState(null);
  const [answers, setAnswers]     = useState({});
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed]     = useState(0);
  const [result, setResult]       = useState(null);
  const [mounted, setMounted]     = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (phase !== 'test') return;
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [phase, startTime]);

  const startTest = (count) => {
    const qs = selectQuestions(count);
    setQuestions(qs);
    setIdx(0);
    setSelected(null);
    setAnswers({});
    setStartTime(Date.now());
    setElapsed(0);
    setResult(null);
    setPhase('test');
  };

  const handleNext = () => {
    const q = questions[idx];
    const newAnswers = { ...answers, [q.id]: selected };
    setAnswers(newAnswers);

    if (idx < questions.length - 1) {
      setIdx(i => i + 1);
      setSelected(null);
    } else {
      const iq = calculateIQ(newAnswers, questions);
      const catScores = {};
      questions.forEach(q => {
        if (!catScores[q.type]) catScores[q.type] = { correct: 0, total: 0 };
        catScores[q.type].total++;
        if (newAnswers[q.id] === q.answer) catScores[q.type].correct++;
      });
      const correctCount = questions.filter(q => newAnswers[q.id] === q.answer).length;
      const bestCat = Object.entries(catScores).sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total))[0]?.[0];
      setResult({ iq, correctCount, catScores, bestCat, answers: newAnswers, time: Math.floor((Date.now() - startTime) / 1000) });
      setPhase('results');
    }
  };

  if (!mounted) return null;

  // ── INTRO ─────────────────────────────────────────────────────────────────

  if (phase === 'intro') return (
    <Layout>
      <div className="page">
        <div className="hero">
          <div className="eyebrow">// IQ_ASSESSMENT</div>
          <h1>Measure Your <span className="highlight">Intelligence.</span></h1>
          <p className="subtext">Free. No signup. No paywall. Instant results.</p>

          <div className="cat-grid">
            {Object.entries(TYPE_LABELS).map(([, label]) => (
              <div key={label} className="cat-chip">
                <span className="cat-dot" />{label}
              </div>
            ))}
          </div>

          <p className="choose-label">// SELECT_TEST_LENGTH</p>

          <div className="length-grid">
            <button className="length-card" onClick={() => startTest(15)}>
              <span className="length-num">15</span>
              <span className="length-name">Quick Test</span>
              <span className="length-meta">~8 minutes · Estimate</span>
              <span className="length-cta">Initialise →</span>
            </button>
            <button className="length-card length-card--warm" onClick={() => startTest(25)}>
              <div className="featured-badge">RECOMMENDED</div>
              <span className="length-num">25</span>
              <span className="length-name">Standard Test</span>
              <span className="length-meta">~15 minutes · Accurate</span>
              <span className="length-cta length-cta--warm">Initialise →</span>
            </button>
          </div>

          <p className="disclaimer">Results are indicative only. Average IQ = 100, SD = 15.</p>
        </div>

        <style jsx>{`
          .page { max-width: 900px; margin: 0 auto; padding: 80px 20px 100px; }

          .hero { text-align: center; cursor: default; }

          .eyebrow {
            font-family: 'JetBrains Mono';
            color: var(--accent);
            font-size: 11px;
            letter-spacing: 0.2em;
            margin-bottom: 20px;
            display: inline-block;
            transition: all 0.4s ease;
          }
          .hero:hover .eyebrow {
            color: var(--warm);
            letter-spacing: 0.3em;
            text-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
          }

          h1 {
            font-size: 48px;
            font-weight: 800;
            color: #fff;
            margin-bottom: 16px;
            letter-spacing: -0.03em;
            transition: all 0.4s ease;
          }
          .hero:hover h1 { transform: translateY(-2px) scale(1.01); }

          .highlight {
            color: var(--warm);
            transition: all 0.4s ease;
          }
          .hero:hover .highlight {
            text-shadow: 0 0 25px rgba(255, 107, 53, 0.6);
            filter: brightness(1.2);
          }

          .subtext {
            font-family: 'JetBrains Mono';
            font-size: 12px;
            color: var(--text-2);
            margin-bottom: 40px;
            letter-spacing: 0.05em;
          }

          .cat-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
            margin-bottom: 48px;
          }

          .cat-chip {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border);
            border-radius: 999px;
            padding: 7px 16px;
            font-size: 13px;
            color: var(--text-2);
          }

          .cat-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: var(--accent);
            opacity: 0.6;
            flex-shrink: 0;
          }

          .choose-label {
            font-family: 'JetBrains Mono';
            font-size: 10px;
            letter-spacing: 0.2em;
            color: var(--text-2);
            margin-bottom: 20px;
          }

          .length-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            max-width: 600px;
            margin: 0 auto 32px;
          }

          .length-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 40px 28px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
            position: relative;
            color: inherit;
            backdrop-filter: blur(10px);
          }

          .length-card:hover {
            transform: translateY(-8px);
            border-color: rgba(125, 249, 255, 0.3);
            background: rgba(255,255,255,0.06);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          }

          .length-card--warm {
            border-color: rgba(255, 107, 53, 0.2);
          }
          .length-card--warm:hover {
            border-color: rgba(255, 107, 53, 0.5);
            box-shadow: 0 20px 40px rgba(255, 107, 53, 0.12);
          }

          .featured-badge {
            position: absolute;
            top: -1px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--warm);
            color: #000;
            font-family: 'JetBrains Mono';
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.15em;
            padding: 4px 14px;
            border-radius: 0 0 10px 10px;
            white-space: nowrap;
          }

          .length-num {
            font-size: 56px;
            font-weight: 900;
            color: #fff;
            letter-spacing: -0.05em;
            line-height: 1;
          }

          .length-name {
            font-size: 16px;
            font-weight: 700;
            color: #fff;
          }

          .length-meta {
            font-family: 'JetBrains Mono';
            font-size: 10px;
            color: var(--text-2);
            letter-spacing: 0.04em;
          }

          .length-cta {
            font-family: 'JetBrains Mono';
            font-size: 11px;
            color: var(--accent);
            margin-top: 8px;
            letter-spacing: 0.1em;
          }
          .length-cta--warm { color: var(--warm); }

          .disclaimer {
            font-family: 'JetBrains Mono';
            font-size: 10px;
            color: rgba(255,255,255,0.18);
            letter-spacing: 0.04em;
          }

          @media (max-width: 520px) {
            h1 { font-size: 34px; }
            .length-grid { grid-template-columns: 1fr; }
          }
        `}</style>
      </div>
    </Layout>
  );

  // ── TEST ──────────────────────────────────────────────────────────────────

  if (phase === 'test') {
    const q = questions[idx];
    const progress = (idx / questions.length) * 100;
    const letters = ['A', 'B', 'C', 'D'];

    return (
      <Layout>
        <div className="page">

          {/* Top bar */}
          <div className="topbar">
            <div className="progress-wrap">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="counter">{idx + 1} / {questions.length}</span>
            </div>
            <div className="topbar-meta">
              <span className="type-tag">{TYPE_LABELS[q.type]}</span>
              <span className="timer">⏱ {formatTime(elapsed)}</span>
            </div>
          </div>

          {/* Question card */}
          <div className="q-card">
            <div className="diff-row">
              {[1,2,3,4,5].map(d => (
                <div key={d} className="diff-dot" style={{ opacity: d <= q.difficulty ? 1 : 0.1 }} />
              ))}
              <span className="diff-label">Difficulty {q.difficulty}/5</span>
            </div>

            <div className="question-wrap">
              <p className="question-text">{q.question}</p>
            </div>

            <div className="options-grid">
              {q.options.map((opt, i) => (
                <button
                  key={opt}
                  className={`option ${selected === opt ? 'option--selected' : ''}`}
                  onClick={() => setSelected(opt)}
                >
                  <span className="option-letter">{letters[i]}</span>
                  <span className="option-text">{opt}</span>
                </button>
              ))}
            </div>

            <button
              className={`next-btn ${selected ? 'next-btn--ready' : ''}`}
              onClick={handleNext}
              disabled={!selected}
            >
              {idx < questions.length - 1 ? 'Next Question →' : 'View Results →'}
            </button>
          </div>

          <style jsx>{`
            .page { max-width: 680px; margin: 0 auto; padding: 80px 20px 100px; }

            .topbar { margin-bottom: 24px; }

            .progress-wrap {
              display: flex;
              align-items: center;
              gap: 16px;
              margin-bottom: 12px;
            }

            .progress-track {
              flex: 1;
              height: 2px;
              background: rgba(255,255,255,0.06);
              border-radius: 999px;
              overflow: hidden;
            }

            .progress-fill {
              height: 100%;
              background: var(--accent);
              border-radius: 999px;
              transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
            }

            .counter {
              font-family: 'JetBrains Mono';
              font-size: 11px;
              color: var(--text-2);
              white-space: nowrap;
            }

            .topbar-meta {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .type-tag {
              font-family: 'JetBrains Mono';
              font-size: 10px;
              letter-spacing: 0.15em;
              color: var(--accent);
              text-transform: uppercase;
            }

            .timer {
              font-family: 'JetBrains Mono';
              font-size: 11px;
              color: rgba(255,255,255,0.2);
            }

            /* Intentionally minimal vs brand cards — clinical focus mode */
            .q-card {
              background: rgba(255,255,255,0.025);
              border: 1px solid rgba(255,255,255,0.07);
              border-radius: 20px;
              padding: 44px 40px;
            }

            .diff-row {
              display: flex;
              align-items: center;
              gap: 5px;
              margin-bottom: 28px;
            }

            .diff-dot {
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background: var(--accent);
            }

            .diff-label {
              font-family: 'JetBrains Mono';
              font-size: 9px;
              color: rgba(255,255,255,0.18);
              margin-left: 8px;
              letter-spacing: 0.1em;
            }

            .question-wrap {
              margin-bottom: 32px;
              padding-bottom: 32px;
              border-bottom: 1px solid rgba(255,255,255,0.05);
            }

            .question-text {
              font-size: 20px;
              font-weight: 600;
              color: rgba(255,255,255,0.9);
              line-height: 1.7;
              white-space: pre-line;
              letter-spacing: -0.01em;
            }

            .options-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-bottom: 28px;
            }

            .option {
              display: flex;
              align-items: center;
              gap: 14px;
              background: rgba(255,255,255,0.03);
              border: 1px solid rgba(255,255,255,0.07);
              border-radius: 12px;
              padding: 16px 18px;
              cursor: pointer;
              transition: all 0.2s ease;
              text-align: left;
              color: rgba(255,255,255,0.6);
            }

            .option:hover {
              background: rgba(255,255,255,0.06);
              border-color: rgba(255,255,255,0.15);
              color: #fff;
            }

            .option--selected {
              background: rgba(125, 249, 255, 0.06);
              border-color: rgba(125, 249, 255, 0.35);
              color: #fff;
            }

            .option-letter {
              font-family: 'JetBrains Mono';
              font-size: 10px;
              font-weight: 700;
              color: var(--accent);
              opacity: 0.5;
              width: 14px;
              flex-shrink: 0;
            }

            .option--selected .option-letter { opacity: 1; }

            .option-text {
              font-size: 15px;
              font-weight: 500;
              line-height: 1.4;
            }

            .next-btn {
              width: 100%;
              padding: 16px;
              background: transparent;
              border: 1px solid rgba(255,255,255,0.08);
              border-radius: 12px;
              color: rgba(255,255,255,0.2);
              font-family: 'JetBrains Mono';
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.08em;
              cursor: not-allowed;
              transition: all 0.3s ease;
              text-transform: uppercase;
            }

            .next-btn--ready {
              background: var(--accent);
              border-color: var(--accent);
              color: #000;
              cursor: pointer;
            }

            .next-btn--ready:hover {
              box-shadow: 0 0 25px rgba(125, 249, 255, 0.35);
              transform: scale(1.01);
            }

            @media (max-width: 520px) {
              .q-card { padding: 28px 20px; }
              .options-grid { grid-template-columns: 1fr; }
              .question-text { font-size: 17px; }
            }
          `}</style>
        </div>
      </Layout>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────

  if (phase === 'results' && result) {
    const { iq, correctCount, catScores, bestCat, answers: finalAnswers, time } = result;
    const { label, color } = getIQBand(iq);
    const percentile = getPercentile(iq);

    return (
      <Layout>
        <div className="page">

          <div className="eyebrow">// ASSESSMENT_COMPLETE</div>
          <h1>Your Results<span className="highlight">.</span></h1>

          {/* Score hero card */}
          <div className="score-card">
            <p className="score-meta-label">// IQ_SCORE</p>
            <div className="score-num" style={{ color }}>{iq}</div>
            <div className="score-band" style={{ color }}>{label}</div>
            <p className="score-context">
              You scored higher than{' '}
              <strong style={{ color: 'var(--accent)' }}>{percentile}%</strong>{' '}
              of the population.
            </p>
          </div>

          {/* Stats row */}
          <div className="stats-row">
            {[
              { num: `${correctCount}/${questions.length}`, label: '// CORRECT' },
              { num: `${percentile}th`, label: '// PERCENTILE' },
              { num: formatTime(time), label: '// TIME' },
            ].map(({ num, label: lbl }) => (
              <div key={lbl} className="stat-card">
                <span className="stat-num">{num}</span>
                <span className="stat-label">{lbl}</span>
              </div>
            ))}
          </div>

          {/* Best category */}
          {bestCat && (
            <div className="best-cat-card">
              <span className="best-cat-eyebrow">// YOUR_STRONGEST_AREA</span>
              <span className="best-cat-value">⭐ {TYPE_LABELS[bestCat]}</span>
            </div>
          )}

          {/* Category breakdown */}
          <div className="section-card">
            <p className="section-label">// CATEGORY_BREAKDOWN</p>
            {Object.entries(catScores).map(([type, { correct, total }]) => {
              const pct = correct / total;
              const barColor = pct >= 0.7 ? 'var(--accent)' : pct >= 0.4 ? 'var(--warm)' : 'rgba(255,255,255,0.18)';
              return (
                <div key={type} className="bar-row">
                  <span className="bar-label">{TYPE_LABELS[type]}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct * 100}%`, background: barColor }} />
                  </div>
                  <span className="bar-score" style={{ color: barColor }}>{correct}/{total}</span>
                </div>
              );
            })}
          </div>

          {/* Question review */}
          <div className="section-card">
            <p className="section-label">// QUESTION_REVIEW</p>
            {questions.map((q, i) => {
              const userAns = finalAnswers[q.id];
              const correct = userAns === q.answer;
              return (
                <div key={q.id} className="review-row">
                  <div className="review-header">
                    <span className="review-q">Q{i + 1}</span>
                    <span className="review-type">{TYPE_LABELS[q.type]}</span>
                    <span className={`review-mark ${correct ? 'correct' : 'wrong'}`}>{correct ? '✓' : '✗'}</span>
                  </div>
                  {!correct && (
                    <div className="review-detail">
                      <div className="review-answers">
                        <span className="review-yours">Your answer: <em>{userAns || 'Skipped'}</em></span>
                        <span className="review-correct">Correct: <em>{q.answer}</em></span>
                      </div>
                      <p className="review-explanation">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="footer-actions">
            <button className="btn-retake" onClick={() => setPhase('intro')}>
              ↺ Take Test Again
            </button>
          </div>

          <p className="disclaimer">Indicative assessment only. For clinical evaluation, consult a certified psychologist.</p>

          <style jsx>{`
            .page { max-width: 680px; margin: 0 auto; padding: 80px 20px 100px; }

            .eyebrow {
              font-family: 'JetBrains Mono';
              color: var(--accent);
              font-size: 11px;
              letter-spacing: 0.2em;
              margin-bottom: 16px;
              display: block;
            }

            h1 {
              font-size: 48px;
              font-weight: 800;
              color: #fff;
              margin-bottom: 40px;
              letter-spacing: -0.03em;
            }

            .highlight { color: var(--warm); }

            /* Score card — full brand treatment */
            .score-card {
              background: var(--surface);
              border: 1px solid var(--border);
              border-radius: 24px;
              padding: 52px 40px 44px;
              text-align: center;
              margin-bottom: 16px;
              backdrop-filter: blur(10px);
              transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
              cursor: default;
            }

            .score-card:hover {
              transform: translateY(-6px);
              border-color: rgba(125, 249, 255, 0.25);
              box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            }

            .score-meta-label {
              font-family: 'JetBrains Mono';
              font-size: 10px;
              color: var(--text-2);
              letter-spacing: 0.2em;
              margin-bottom: 12px;
            }

            .score-num {
              font-size: 108px;
              font-weight: 900;
              letter-spacing: -0.05em;
              line-height: 1;
              margin-bottom: 8px;
            }

            .score-band {
              font-size: 22px;
              font-weight: 800;
              margin-bottom: 12px;
              letter-spacing: -0.02em;
            }

            .score-context {
              font-size: 14px;
              color: var(--text-2);
              line-height: 1.6;
            }

            /* Stats */
            .stats-row {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 12px;
              margin-bottom: 12px;
            }

            .stat-card {
              background: var(--surface);
              border: 1px solid var(--border);
              border-radius: 16px;
              padding: 24px 16px;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 8px;
              backdrop-filter: blur(10px);
              transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
              cursor: default;
            }

            .stat-card:hover {
              transform: translateY(-4px);
              border-color: rgba(125, 249, 255, 0.2);
            }

            .stat-num {
              font-size: 26px;
              font-weight: 800;
              color: #fff;
              letter-spacing: -0.03em;
            }

            .stat-label {
              font-family: 'JetBrains Mono';
              font-size: 9px;
              color: var(--text-2);
              letter-spacing: 0.15em;
            }

            /* Best category */
            .best-cat-card {
              background: rgba(125,249,255,0.03);
              border: 1px solid rgba(125,249,255,0.1);
              border-radius: 16px;
              padding: 20px 24px;
              display: flex;
              flex-direction: column;
              gap: 6px;
              margin-bottom: 12px;
            }

            .best-cat-eyebrow {
              font-family: 'JetBrains Mono';
              font-size: 9px;
              color: var(--text-2);
              letter-spacing: 0.15em;
            }

            .best-cat-value {
              font-size: 16px;
              font-weight: 700;
              color: var(--accent);
            }

            /* Section cards */
            .section-card {
              background: var(--surface);
              border: 1px solid var(--border);
              border-radius: 20px;
              padding: 32px;
              margin-bottom: 12px;
              backdrop-filter: blur(10px);
            }

            .section-label {
              font-family: 'JetBrains Mono';
              font-size: 10px;
              letter-spacing: 0.2em;
              color: var(--text-2);
              margin-bottom: 24px;
            }

            /* Breakdown bars */
            .bar-row {
              display: flex;
              align-items: center;
              gap: 14px;
              margin-bottom: 14px;
            }
            .bar-row:last-child { margin-bottom: 0; }

            .bar-label {
              font-size: 13px;
              color: var(--text-2);
              width: 160px;
              flex-shrink: 0;
            }

            .bar-track {
              flex: 1;
              height: 4px;
              background: rgba(255,255,255,0.05);
              border-radius: 2px;
              overflow: hidden;
            }

            .bar-fill {
              height: 100%;
              border-radius: 2px;
              transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
            }

            .bar-score {
              font-family: 'JetBrains Mono';
              font-size: 11px;
              width: 28px;
              text-align: right;
              flex-shrink: 0;
            }

            /* Question review */
            .review-row {
              padding-bottom: 14px;
              margin-bottom: 14px;
              border-bottom: 1px solid rgba(255,255,255,0.04);
            }
            .review-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

            .review-header {
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .review-q {
              font-family: 'JetBrains Mono';
              font-size: 10px;
              color: var(--text-2);
              width: 28px;
              flex-shrink: 0;
            }

            .review-type {
              font-size: 13px;
              color: var(--text-2);
              flex: 1;
            }

            .review-mark {
              font-family: 'JetBrains Mono';
              font-size: 13px;
              font-weight: 700;
            }
            .review-mark.correct { color: #34D399; }
            .review-mark.wrong   { color: var(--warm); }

            .review-detail {
              margin-top: 10px;
              padding: 14px 16px;
              background: rgba(255,107,53,0.04);
              border: 1px solid rgba(255,107,53,0.1);
              border-radius: 10px;
            }

            .review-answers {
              display: flex;
              flex-wrap: wrap;
              gap: 16px;
              margin-bottom: 10px;
            }

            .review-yours, .review-correct {
              font-family: 'JetBrains Mono';
              font-size: 11px;
              color: var(--text-2);
            }
            .review-yours em  { color: #fff; font-style: normal; }
            .review-correct em { color: #34D399; font-style: normal; }

            .review-explanation {
              font-size: 13px;
              color: rgba(255,255,255,0.45);
              line-height: 1.6;
              padding-top: 10px;
              border-top: 1px solid rgba(255,255,255,0.05);
              margin: 0;
            }

            /* Footer */
            .footer-actions {
              margin-top: 28px;
              display: flex;
              justify-content: center;
            }

            .btn-retake {
              padding: 16px 40px;
              background: var(--accent);
              color: #000;
              border: none;
              border-radius: 12px;
              font-family: 'JetBrains Mono';
              font-size: 12px;
              font-weight: 800;
              letter-spacing: 0.1em;
              cursor: pointer;
              transition: all 0.2s;
              text-transform: uppercase;
            }

            .btn-retake:hover {
              box-shadow: 0 0 25px rgba(125,249,255,0.4);
              transform: scale(1.02);
            }

            .disclaimer {
              font-family: 'JetBrains Mono';
              font-size: 10px;
              color: rgba(255,255,255,0.14);
              text-align: center;
              margin-top: 32px;
              letter-spacing: 0.04em;
            }

            @media (max-width: 520px) {
              h1 { font-size: 34px; }
              .stats-row { grid-template-columns: 1fr 1fr; }
              .score-num { font-size: 80px; }
              .section-card { padding: 24px 18px; }
              .bar-label { width: 110px; font-size: 12px; }
            }
          `}</style>
        </div>
      </Layout>
    );
  }

  return null;
}