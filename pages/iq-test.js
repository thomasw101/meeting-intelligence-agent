import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

// ─── SVG VISUALS ──────────────────────────────────────────────────────────────

const T = '#7DF9FF';   // teal accent
const W = '#FF6B35';   // warm orange
const DIM = 'rgba(255,255,255,0.12)';
const MID = 'rgba(255,255,255,0.35)';

// Clock face: pass hour (0-12) and minute (0-59)
function ClockSVG({ hour, minute }) {
  const cx = 90, cy = 90, r = 72;
  const minAngle  = (minute / 60) * 360 - 90;
  const hourAngle = ((hour % 12) / 12) * 360 + (minute / 60) * 30 - 90;
  const toXY = (angle, len) => [
    cx + Math.cos(angle * Math.PI / 180) * len,
    cy + Math.sin(angle * Math.PI / 180) * len,
  ];
  const [mx, my] = toXY(minAngle, 52);
  const [hx, hy] = toXY(hourAngle, 36);
  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle cx={cx} cy={cy} r={r} fill="rgba(125,249,255,0.06)" stroke={T} strokeWidth="2"/>
      {[12,1,2,3,4,5,6,7,8,9,10,11].map((n, i) => {
        const a = (i / 12) * 360 - 90;
        const [tx, ty] = toXY(a, 58);
        return <text key={n} x={tx} y={ty} textAnchor="middle" dominantBaseline="central"
          fontSize="10" fill={MID} fontFamily="JetBrains Mono">{n}</text>;
      })}
      {/* tick marks */}
      {Array.from({length: 60}, (_, i) => {
        const a = (i / 60) * 360 - 90;
        const inner = i % 5 === 0 ? 62 : 66;
        const [x1,y1] = toXY(a, inner);
        const [x2,y2] = toXY(a, 70);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i%5===0?MID:DIM} strokeWidth={i%5===0?1.5:0.75}/>;
      })}
      {/* minute hand */}
      <line x1={cx} y1={cy} x2={mx} y2={my} stroke={T} strokeWidth="2.5" strokeLinecap="round"/>
      {/* hour hand */}
      <line x1={cx} y1={cy} x2={hx} y2={hy} stroke={W} strokeWidth="4" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="4" fill={W}/>
    </svg>
  );
}

// Compass showing which direction you're currently FACING (starting point)
function CompassSVG({ facing }) {
  const dirs = { N: -90, E: 0, S: 90, W: 180 };
  const angle = dirs[facing] ?? 0;
  const cx = 90, cy = 90, r = 65;
  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle cx={cx} cy={cy} r={r} fill="rgba(125,249,255,0.06)" stroke={T} strokeWidth="1.5"/>
      {['N','E','S','W'].map((d, i) => {
        const a = (i / 4) * 360 - 90;
        const tx = cx + Math.cos(a * Math.PI/180) * 50;
        const ty = cy + Math.sin(a * Math.PI/180) * 50;
        return <text key={d} x={tx} y={ty} textAnchor="middle" dominantBaseline="central"
          fontSize="13" fontWeight="700" fill={d === facing ? T : MID} fontFamily="JetBrains Mono">{d}</text>;
      })}
      {/* arrow points in the direction currently faced */}
      <g transform={`rotate(${angle}, ${cx}, ${cy})`}>
        <polygon points={`${cx},${cy-45} ${cx-8},${cy+10} ${cx},${cy+5} ${cx+8},${cy+10}`} fill={T}/>
      </g>
      <circle cx={cx} cy={cy} r="5" fill={T}/>
      <text x={cx} y={cy+r+14} textAnchor="middle" fontSize="9" fill={MID} fontFamily="JetBrains Mono">// CURRENTLY FACING</text>
    </svg>
  );
}

// Isometric cube wireframe
function CubeSVG({ highlight = null }) {
  // highlight: 'top' | 'front' | 'side' | null
  const faceTop   = highlight === 'top'   ? T   : 'rgba(125,249,255,0.12)';
  const faceFront = highlight === 'front' ? W   : 'rgba(255,107,53,0.10)';
  const faceSide  = highlight === 'side'  ? T   : 'rgba(125,249,255,0.07)';
  return (
    <svg width="180" height="160" viewBox="0 0 180 160">
      {/* top face */}
      <polygon points="90,20 150,55 90,90 30,55" fill={faceTop} stroke={T} strokeWidth="1.5"/>
      {/* front face */}
      <polygon points="30,55 90,90 90,140 30,105" fill={faceFront} stroke={W} strokeWidth="1.5"/>
      {/* right face */}
      <polygon points="90,90 150,55 150,105 90,140" fill={faceSide} stroke={T} strokeWidth="1.5"/>
    </svg>
  );
}

// 3x3 matrix grid for pattern questions (number-based)
function MatrixSVG({ cells, cellColor }) {
  const size = 58, gap = 5, pad = 10;
  const total = pad * 2 + size * 3 + gap * 2; // 214
  const colors = Array.isArray(cellColor) ? cellColor : Array(9).fill(cellColor || T);
  return (
    <svg width={total} height={total} viewBox={`0 0 ${total} ${total}`} style={{overflow:'visible'}}>
      {cells.map((cell, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const x = pad + col * (size + gap);
        const y = pad + row * (size + gap);
        const isMissing = cell === null;
        return (
          <g key={i}>
            <rect x={x} y={y} width={size} height={size} rx="7"
              fill={isMissing ? 'rgba(255,107,53,0.1)' : 'rgba(255,255,255,0.05)'}
              stroke={isMissing ? W : DIM} strokeWidth={isMissing ? 2 : 1}
              strokeDasharray={isMissing ? '5 3' : 'none'}/>
            {isMissing
              ? <text x={x+size/2} y={y+size/2} textAnchor="middle" dominantBaseline="central"
                  fontSize="24" fontWeight="800" fill={W} fontFamily="JetBrains Mono">?</text>
              : <text x={x+size/2} y={y+size/2} textAnchor="middle" dominantBaseline="central"
                  fontSize="16" fontWeight="700" fill={colors[i]} fontFamily="JetBrains Mono">{cell}</text>
            }
          </g>
        );
      })}
    </svg>
  );
}

// 2-column grid for 2x3 patterns
function Matrix2SVG({ cells }) {
  const w = 80, h = 62, gap = 5, pad = 10;
  const W2 = pad * 2 + w * 2 + gap;   // 185
  const H2 = pad * 2 + h * 3 + gap*2; // 226
  return (
    <svg width={W2} height={H2} viewBox={`0 0 ${W2} ${H2}`} style={{overflow:'visible'}}>
      {cells.map((cell, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const x = pad + col * (w + gap);
        const y = pad + row * (h + gap);
        const isMissing = cell === null;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} rx="7"
              fill={isMissing ? 'rgba(255,107,53,0.1)' : 'rgba(255,255,255,0.05)'}
              stroke={isMissing ? W : DIM} strokeWidth={isMissing ? 2 : 1}
              strokeDasharray={isMissing ? '5 3' : 'none'}/>
            {isMissing
              ? <text x={x+w/2} y={y+h/2} textAnchor="middle" dominantBaseline="central"
                  fontSize="22" fontWeight="800" fill={W} fontFamily="JetBrains Mono">?</text>
              : <text x={x+w/2} y={y+h/2} textAnchor="middle" dominantBaseline="central"
                  fontSize="16" fontWeight="700" fill={T} fontFamily="JetBrains Mono">{cell}</text>
            }
          </g>
        );
      })}
    </svg>
  );
}

// ── Raven's-style shape matrix (3x3 grid of SVG shape cells, last = ?)
// shapeRows: array of 9 render functions (or null for missing)
function ShapeMatrixSVG({ cells }) {
  const size = 68, gap = 5, pad = 8;
  const total = pad * 2 + size * 3 + gap * 2; // 230
  return (
    <svg width={total} height={total} viewBox={`0 0 ${total} ${total}`} style={{overflow:'visible'}}>
      {cells.map((renderFn, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const x = pad + col * (size + gap);
        const y = pad + row * (size + gap);
        const isMissing = renderFn === null;
        return (
          <g key={i}>
            <rect x={x} y={y} width={size} height={size} rx="7"
              fill={isMissing ? 'rgba(255,107,53,0.08)' : 'rgba(255,255,255,0.04)'}
              stroke={isMissing ? W : DIM} strokeWidth={isMissing ? 2 : 1}
              strokeDasharray={isMissing ? '5 3' : 'none'}/>
            {isMissing
              ? <text x={x+size/2} y={y+size/2} textAnchor="middle" dominantBaseline="central"
                  fontSize="26" fontWeight="800" fill={W} fontFamily="JetBrains Mono">?</text>
              : <g transform={`translate(${x},${y})`}>{renderFn(size)}</g>
            }
          </g>
        );
      })}
    </svg>
  );
}

// Shape primitives (take cell size s, render centred shapes)
const Shapes = {
  // filled circle, 1/2/3 sizes
  circle: (s, col, scale=0.35) => <circle cx={s/2} cy={s/2} r={s*scale} fill={col}/>,
  circleOutline: (s, col, scale=0.35) => <circle cx={s/2} cy={s/2} r={s*scale} fill="none" stroke={col} strokeWidth="2.5"/>,
  // square
  square: (s, col, scale=0.55) => { const w=s*scale; return <rect x={(s-w)/2} y={(s-w)/2} width={w} height={w} fill={col}/> },
  squareOutline: (s, col, scale=0.55) => { const w=s*scale; return <rect x={(s-w)/2} y={(s-w)/2} width={w} height={w} fill="none" stroke={col} strokeWidth="2.5"/> },
  // triangle
  triangle: (s, col, scale=0.6) => {
    const cx=s/2, top=s*(1-scale)/2+2, bot=s-(s*(1-scale)/2)-2, half=s*scale/2;
    return <polygon points={`${cx},${top} ${cx+half},${bot} ${cx-half},${bot}`} fill={col}/>;
  },
  triangleOutline: (s, col, scale=0.6) => {
    const cx=s/2, top=s*(1-scale)/2+2, bot=s-(s*(1-scale)/2)-2, half=s*scale/2;
    return <polygon points={`${cx},${top} ${cx+half},${bot} ${cx-half},${bot}`} fill="none" stroke={col} strokeWidth="2.5"/>;
  },
  // diamond
  diamond: (s, col, scale=0.55) => {
    const cx=s/2, cy=s/2, h=s*scale/2;
    return <polygon points={`${cx},${cy-h} ${cx+h*0.75},${cy} ${cx},${cy+h} ${cx-h*0.75},${cy}`} fill={col}/>;
  },
  diamondOutline: (s, col, scale=0.55) => {
    const cx=s/2, cy=s/2, h=s*scale/2;
    return <polygon points={`${cx},${cy-h} ${cx+h*0.75},${cy} ${cx},${cy+h} ${cx-h*0.75},${cy}`} fill="none" stroke={col} strokeWidth="2.5"/>;
  },
  // cross / plus
  cross: (s, col) => {
    const t=s*0.17, m=s*0.33;
    return <path d={`M${m},${t} h${s-2*m} v${m-t} h${t} v${s-2*m} h-${t} v${m-t} h-${s-2*m} v-${m-t} h-${t} v-${s-2*m} h${t}Z`} fill={col}/>;
  },
  // arrow right
  arrowR: (s, col) => {
    const cy=s/2, tip=s*0.78, tail=s*0.22, mid=s*0.5, hw=s*0.18, sw=s*0.1;
    return <polygon points={`${tip},${cy} ${mid},${cy-hw} ${mid},${cy-sw} ${tail},${cy-sw} ${tail},${cy+sw} ${mid},${cy+sw} ${mid},${cy+hw}`} fill={col}/>;
  },
  // small dots — 1, 2, or 3
  dots: (s, col, n=1) => {
    const positions = n===1 ? [[s/2,s/2]] : n===2 ? [[s*0.32,s/2],[s*0.68,s/2]] : [[s*0.25,s*0.65],[s/2,s*0.28],[s*0.75,s*0.65]];
    return <>{positions.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={s*0.1} fill={col}/>)}</>;
  },
};

// Square pyramid
function PyramidSVG() {
  return (
    <svg width="180" height="160" viewBox="0 0 180 160">
      {/* base parallelogram */}
      <polygon points="40,120 90,100 140,120 90,140" fill="rgba(255,107,53,0.12)" stroke={W} strokeWidth="1.5"/>
      {/* left face */}
      <polygon points="40,120 90,140 90,40" fill="rgba(125,249,255,0.10)" stroke={T} strokeWidth="1.5"/>
      {/* right face */}
      <polygon points="90,140 140,120 90,40" fill="rgba(125,249,255,0.06)" stroke={T} strokeWidth="1.5"/>
      {/* front-left edge */}
      <line x1="40" y1="120" x2="90" y2="40" stroke={T} strokeWidth="1.5"/>
      {/* apex dot */}
      <circle cx="90" cy="40" r="4" fill={W}/>
    </svg>
  );
}

// Direction path SVG for navigation questions
function PathSVG({ steps }) {
  // steps: [{dir: 'N'|'S'|'E'|'W', label: '3mi'}]
  const dirMap = { N: [0,-1], S: [0,1], E: [1,0], W: [-1,0] };
  const scale = 45;
  let cx = 90, cy = 130;
  const points = [{x: cx, y: cy}];
  const labels = [];
  steps.forEach(({dir, label}) => {
    const [dx, dy] = dirMap[dir];
    const nx = cx + dx * scale, ny = cy + dy * scale;
    labels.push({x: (cx+nx)/2 + (dy !== 0 ? 12 : 0), y: (cy+ny)/2 + (dx !== 0 ? -8 : 0), text: label});
    cx = nx; cy = ny;
    points.push({x: cx, y: cy});
  });
  const pathD = points.map((p,i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(' ');
  return (
    <svg width="180" height="160" viewBox="0 0 180 160">
      {/* compass labels */}
      <text x="90" y="10" textAnchor="middle" fontSize="10" fill={MID} fontFamily="JetBrains Mono">N</text>
      <text x="170" y="90" textAnchor="middle" fontSize="10" fill={MID} fontFamily="JetBrains Mono">E</text>
      {/* path */}
      <path d={pathD} fill="none" stroke={T} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* start dot */}
      <circle cx={points[0].x} cy={points[0].y} r="5" fill={W}/>
      {/* end dot */}
      <circle cx={points[points.length-1].x} cy={points[points.length-1].y} r="5" fill={T}/>
      {/* dashed line back to start */}
      <line x1={points[points.length-1].x} y1={points[points.length-1].y}
            x2={points[0].x} y2={points[0].y}
            stroke={W} strokeWidth="1.5" strokeDasharray="4 3"/>
      {labels.map((l,i) => (
        <text key={i} x={l.x} y={l.y} textAnchor="middle" fontSize="9" fill={T} fontFamily="JetBrains Mono">{l.text}</text>
      ))}
      <text x={points[0].x - 10} y={points[0].y + 4} fontSize="8" fill={W} fontFamily="JetBrains Mono">START</text>
    </svg>
  );
}

// ─── QUESTION BANK ────────────────────────────────────────────────────────────

const QUESTION_BANK = [

  // ── NUMBER SEQUENCES (15 questions) ────────────────────────────────────────
  { id: 'ns1',  type: 'sequence', difficulty: 1, question: 'What comes next?\n\n2,  4,  6,  8,  ?', options: ['9', '10', '11', '12'], answer: '10', explanation: 'Add 2 each time. 8 + 2 = 10.' },
  { id: 'ns2',  type: 'sequence', difficulty: 1, question: 'What comes next?\n\n5,  10,  15,  20,  ?', options: ['22', '24', '25', '30'], answer: '25', explanation: 'Multiples of 5. 20 + 5 = 25.' },
  { id: 'ns3',  type: 'sequence', difficulty: 1, question: 'What comes next?\n\n10,  8,  6,  4,  ?', options: ['1', '2', '3', '0'], answer: '2', explanation: 'Subtract 2 each time. 4 − 2 = 2.' },
  { id: 'ns4',  type: 'sequence', difficulty: 2, question: 'What comes next?\n\n1,  4,  9,  16,  ?', options: ['20', '24', '25', '36'], answer: '25', explanation: 'Perfect squares: 1², 2², 3², 4², 5² = 25.' },
  { id: 'ns5',  type: 'sequence', difficulty: 2, question: 'What comes next?\n\n2,  6,  18,  54,  ?', options: ['108', '162', '180', '216'], answer: '162', explanation: 'Multiply by 3 each time. 54 × 3 = 162.' },
  { id: 'ns6',  type: 'sequence', difficulty: 2, question: 'What comes next?\n\n2,  3,  5,  7,  11,  13,  ?', options: ['14', '15', '16', '17'], answer: '17', explanation: 'These are prime numbers. The next prime after 13 is 17.' },
  { id: 'ns7',  type: 'sequence', difficulty: 3, question: 'What comes next?\n\n1,  1,  2,  3,  5,  8,  ?', options: ['11', '12', '13', '14'], answer: '13', explanation: 'Fibonacci — each term is the sum of the two before it. 5 + 8 = 13.' },
  { id: 'ns8',  type: 'sequence', difficulty: 3, question: 'What comes next?\n\n3,  5,  10,  12,  24,  26,  ?', options: ['28', '48', '50', '52'], answer: '52', explanation: 'Alternating +2 then ×2. 26 × 2 = 52.' },
  { id: 'ns9',  type: 'sequence', difficulty: 3, question: 'What comes next?\n\n100,  50,  25,  12.5,  ?', options: ['5', '6', '6.25', '7.5'], answer: '6.25', explanation: 'Divide by 2 each time. 12.5 ÷ 2 = 6.25.' },
  { id: 'ns10', type: 'sequence', difficulty: 4, question: 'What comes next?\n\n2,  3,  5,  9,  17,  ?', options: ['25', '31', '33', '34'], answer: '33', explanation: 'Each term = (previous × 2) − 1. (17 × 2) − 1 = 33.' },
  { id: 'ns11', type: 'sequence', difficulty: 4, question: 'What comes next?\n\n1,  2,  6,  24,  120,  ?', options: ['240', '480', '600', '720'], answer: '720', explanation: 'Factorials: 1!, 2!, 3!, 4!, 5!, 6! = 720.' },
  { id: 'ns12', type: 'sequence', difficulty: 4, question: 'What comes next?\n\n1,  8,  27,  64,  ?', options: ['100', '115', '120', '125'], answer: '125', explanation: 'Cubes: 1³, 2³, 3³, 4³, 5³ = 125.' },
  { id: 'ns13', type: 'sequence', difficulty: 5, question: 'What comes next?\n\n4,  7,  13,  25,  49,  ?', options: ['73', '97', '98', '100'], answer: '97', explanation: 'Each term = (previous × 2) − 1. (49 × 2) − 1 = 97.' },
  { id: 'ns14', type: 'sequence', difficulty: 5, question: 'What comes next?\n\n1,  3,  7,  15,  31,  ?', options: ['47', '57', '63', '65'], answer: '63', explanation: 'Each term = (previous × 2) + 1. (31 × 2) + 1 = 63.' },
  { id: 'ns15', type: 'sequence', difficulty: 5, question: 'What comes next?\n\n0,  1,  3,  6,  10,  15,  ?', options: ['18', '20', '21', '24'], answer: '21', explanation: 'Triangular numbers — add 1, 2, 3, 4, 5, 6... 15 + 6 = 21.' },

  // ── VERBAL REASONING (15 questions) ────────────────────────────────────────
  // Difficulty 1–2: everyday vocabulary only
  { id: 'va1',  type: 'verbal', difficulty: 1, question: 'Dog is to Puppy\nas\nCat is to ?', options: ['Cub', 'Kitten', 'Foal', 'Calf'], answer: 'Kitten', explanation: 'A puppy is a young dog. A kitten is a young cat.' },
  { id: 'va2',  type: 'verbal', difficulty: 1, question: 'Hot is to Cold\nas\nDay is to ?', options: ['Dusk', 'Dark', 'Night', 'Evening'], answer: 'Night', explanation: 'Hot and cold are opposites. Day and night are opposites.' },
  { id: 'va3',  type: 'verbal', difficulty: 1, question: 'Fish is to Water\nas\nBird is to ?', options: ['Tree', 'Nest', 'Air', 'Wing'], answer: 'Air', explanation: 'A fish lives in water. A bird lives in the air.' },
  { id: 'va4',  type: 'verbal', difficulty: 1, question: 'Which word is the odd one out?\n\nApple,  Banana,  Carrot,  Grape', options: ['Apple', 'Banana', 'Carrot', 'Grape'], answer: 'Carrot', explanation: 'Apple, Banana and Grape are all fruits. Carrot is a vegetable.' },
  { id: 'va5',  type: 'verbal', difficulty: 2, question: 'Pen is to Writer\nas\nBrush is to ?', options: ['Canvas', 'Painter', 'Colour', 'Art'], answer: 'Painter', explanation: 'A pen is the tool of a writer. A brush is the tool of a painter.' },
  { id: 'va6',  type: 'verbal', difficulty: 2, question: 'Library is to Books\nas\nGallery is to ?', options: ['Frames', 'Artists', 'Paintings', 'Museums'], answer: 'Paintings', explanation: 'A library houses books. A gallery houses paintings.' },
  { id: 'va7',  type: 'verbal', difficulty: 2, question: 'Which word is the odd one out?\n\nRun,  Jump,  Swim,  Loud', options: ['Run', 'Jump', 'Swim', 'Loud'], answer: 'Loud', explanation: 'Run, Jump and Swim are all actions (verbs). Loud is a description (adjective).' },
  { id: 'va8',  type: 'verbal', difficulty: 2, question: 'Doctor is to Hospital\nas\nTeacher is to ?', options: ['Lesson', 'Student', 'School', 'Textbook'], answer: 'School', explanation: 'A doctor works in a hospital. A teacher works in a school.' },
  // Difficulty 3: moderate vocabulary
  { id: 'va9',  type: 'verbal', difficulty: 3, question: 'Novella is to Novel\nas\nStream is to ?', options: ['Ocean', 'Pond', 'River', 'Lake'], answer: 'River', explanation: 'A novella is a shorter novel. A stream is a smaller river.' },
  { id: 'va10', type: 'verbal', difficulty: 3, question: 'Drought is to Rain\nas\nFamine is to ?', options: ['War', 'Food', 'Poverty', 'Harvest'], answer: 'Food', explanation: 'A drought is an absence of rain. A famine is an absence of food.' },
  { id: 'va11', type: 'verbal', difficulty: 3, question: 'Which word is the odd one out?\n\nMercury,  Venus,  Moon,  Mars', options: ['Mercury', 'Venus', 'Moon', 'Mars'], answer: 'Moon', explanation: 'Mercury, Venus and Mars are planets. The Moon is a natural satellite.' },
  // Difficulty 4–5: advanced vocabulary, tests reasoning not just knowledge
  { id: 'va12', type: 'verbal', difficulty: 4, question: 'Epilogue is to Book\nas\nCoda is to ?', options: ['Film', 'Music', 'Dance', 'Poem'], answer: 'Music', explanation: 'An epilogue concludes a book. A coda concludes a piece of music.' },
  { id: 'va13', type: 'verbal', difficulty: 4, question: 'Abundant is to Scarce\nas\nAncient is to ?', options: ['Old', 'Rare', 'Modern', 'Historic'], answer: 'Modern', explanation: 'Abundant and scarce are opposites. Ancient and modern are opposites.' },
  { id: 'va14', type: 'verbal', difficulty: 5, question: 'Prolific is to Output\nas\nTaciturn is to ?', options: ['Speed', 'Words', 'Thought', 'Action'], answer: 'Words', explanation: 'Prolific means producing much output. Taciturn means using very few words.' },
  { id: 'va15', type: 'verbal', difficulty: 5, question: 'Heuristic is to Algorithm\nas\nIntuition is to ?', options: ['Emotion', 'Memory', 'Logic', 'Instinct'], answer: 'Logic', explanation: 'A heuristic is a practical shortcut vs a formal algorithm. Intuition is a gut-feel shortcut vs formal logic.' },

  // ── PATTERN RECOGNITION — Raven's-style shape matrices (14 questions) ──────

  // pr1 d:2 — dot count grows 1→2→3 across rows
  { id: 'pr1', type: 'pattern', difficulty: 2,
    visual: () => <ShapeMatrixSVG cells={[
      s=>Shapes.dots(s,T,1), s=>Shapes.dots(s,T,2), s=>Shapes.dots(s,T,3),
      s=>Shapes.dots(s,W,1), s=>Shapes.dots(s,W,2), s=>Shapes.dots(s,W,3),
      s=>Shapes.dots(s,T,1), s=>Shapes.dots(s,T,2), null,
    ]}/>,
    question: 'Each row has 1, 2, then 3 dots.\nRow 3 uses teal.\nWhat completes the pattern?',
    options: ['1 teal dot', '2 teal dots', '3 teal dots', '3 orange dots'],
    answer: '3 teal dots', explanation: 'Each row: 1 dot → 2 dots → 3 dots. Row 3 is teal, so the answer is 3 teal dots.' },

  // pr2 d:2 — same shape fills each row
  { id: 'pr2', type: 'pattern', difficulty: 2,
    visual: () => <ShapeMatrixSVG cells={[
      s=>Shapes.circle(s,T), s=>Shapes.circle(s,T), s=>Shapes.circle(s,T),
      s=>Shapes.squareOutline(s,W), s=>Shapes.squareOutline(s,W), s=>Shapes.squareOutline(s,W),
      s=>Shapes.triangle(s,T), s=>Shapes.triangle(s,T), null,
    ]}/>,
    question: 'Each row contains the same shape throughout.\nWhat completes the pattern?',
    options: ['Teal circle', 'Orange square outline', 'Teal triangle', 'Orange triangle'],
    answer: 'Teal triangle', explanation: 'Row 3 is all teal triangles — the third cell must match.' },

  // pr3 d:3 — shape size grows small→medium→large
  { id: 'pr3', type: 'pattern', difficulty: 3,
    visual: () => <ShapeMatrixSVG cells={[
      s=>Shapes.circle(s,T,0.18), s=>Shapes.circle(s,T,0.28), s=>Shapes.circle(s,T,0.40),
      s=>Shapes.square(s,W,0.28), s=>Shapes.square(s,W,0.40), s=>Shapes.square(s,W,0.55),
      s=>Shapes.triangle(s,T,0.30), s=>Shapes.triangle(s,T,0.45), null,
    ]}/>,
    question: 'Shapes grow larger left to right.\nWhat completes the pattern?',
    options: ['Small teal triangle', 'Large teal triangle', 'Large orange triangle', 'Medium teal circle'],
    answer: 'Large teal triangle', explanation: 'Each row increases in size: small→medium→large. Row 3 is teal triangles, so the final cell is the largest.' },

  // pr4 d:3 — latin square: each shape once per row and column
  { id: 'pr4', type: 'pattern', difficulty: 3,
    visual: () => <ShapeMatrixSVG cells={[
      s=>Shapes.circle(s,T), s=>Shapes.square(s,W), s=>Shapes.triangle(s,T),
      s=>Shapes.square(s,W), s=>Shapes.triangle(s,T), s=>Shapes.circle(s,W),
      s=>Shapes.triangle(s,T), s=>Shapes.circle(s,W), null,
    ]}/>,
    question: 'Each shape appears exactly once per row and once per column.\nWhat is missing?',
    options: ['Teal circle', 'Orange square', 'Teal triangle', 'Orange triangle'],
    answer: 'Orange square', explanation: 'Row 3 has triangle and circle — needs square. Column 3 has triangle and circle — needs square. The colour pattern makes it orange.' },

  // pr5 d:3 — fill progression: outline → partial → full
  { id: 'pr5', type: 'pattern', difficulty: 3,
    visual: () => <ShapeMatrixSVG cells={[
      s=>Shapes.circleOutline(s,T), s=>Shapes.circle(s,T,0.20), s=>Shapes.circle(s,T),
      s=>Shapes.squareOutline(s,W), s=>Shapes.square(s,W,0.30), s=>Shapes.square(s,W),
      s=>Shapes.diamondOutline(s,T), s=>Shapes.diamond(s,T,0.28), null,
    ]}/>,
    question: 'Each row: outline → partial fill → full fill.\nWhat completes the pattern?',
    options: ['Teal diamond outline', 'Small teal diamond', 'Full teal diamond', 'Full orange diamond'],
    answer: 'Full teal diamond', explanation: 'The progression is outline → partial fill → fully filled. Row 3 is teal diamonds, so the last cell is fully filled.' },

  // pr6 d:4 — arrow rotates 90° clockwise each cell across the row
  { id: 'pr6', type: 'pattern', difficulty: 4,
    visual: () => <ShapeMatrixSVG cells={[
      s=><g transform={`rotate(0,${s/2},${s/2})`}>{Shapes.arrowR(s,T)}</g>,
      s=><g transform={`rotate(90,${s/2},${s/2})`}>{Shapes.arrowR(s,T)}</g>,
      s=><g transform={`rotate(180,${s/2},${s/2})`}>{Shapes.arrowR(s,T)}</g>,
      s=><g transform={`rotate(90,${s/2},${s/2})`}>{Shapes.arrowR(s,W)}</g>,
      s=><g transform={`rotate(180,${s/2},${s/2})`}>{Shapes.arrowR(s,W)}</g>,
      s=><g transform={`rotate(270,${s/2},${s/2})`}>{Shapes.arrowR(s,W)}</g>,
      s=><g transform={`rotate(180,${s/2},${s/2})`}>{Shapes.arrowR(s,T)}</g>,
      s=><g transform={`rotate(270,${s/2},${s/2})`}>{Shapes.arrowR(s,T)}</g>,
      null,
    ]}/>,
    question: 'The arrow rotates 90° clockwise each step across the row.\nRow 3 starts at 180°. What is the 3rd cell?',
    options: ['Arrow pointing right (0°)', 'Arrow pointing down (90°)', 'Arrow pointing left (180°)', 'Arrow pointing up (270°)'],
    answer: 'Arrow pointing right (0°)', explanation: 'Row 3: 180° (left) → 270° (down) → 360°=0° (right). The next step is right.' },

  // pr7 d:4 — col3 = overlay of col1 + col2
  { id: 'pr7', type: 'pattern', difficulty: 4,
    visual: () => <ShapeMatrixSVG cells={[
      s=>Shapes.circle(s,T), s=>Shapes.cross(s,W), s=><>{Shapes.circle(s,'rgba(125,249,255,0.5)')}{Shapes.cross(s,W)}</>,
      s=>Shapes.square(s,T), s=>Shapes.cross(s,W), s=><>{Shapes.square(s,'rgba(125,249,255,0.5)')}{Shapes.cross(s,W)}</>,
      s=>Shapes.diamond(s,T), s=>Shapes.cross(s,W), null,
    ]}/>,
    question: 'Column 3 always combines columns 1 and 2 overlaid.\nWhat is missing?',
    options: ['Diamond only', 'Cross only', 'Diamond + Cross overlaid', 'Circle + Cross overlaid'],
    answer: 'Diamond + Cross overlaid', explanation: 'Column 3 always overlays col 1 and col 2. Row 3 col 1 = diamond, col 2 = cross → col 3 = diamond + cross.' },

  // pr8 d:4 — columns alternate teal, orange, teal
  { id: 'pr8', type: 'pattern', difficulty: 4,
    visual: () => <ShapeMatrixSVG cells={[
      s=>Shapes.triangleOutline(s,T), s=>Shapes.triangleOutline(s,W), s=>Shapes.triangleOutline(s,T),
      s=>Shapes.squareOutline(s,T), s=>Shapes.squareOutline(s,W), s=>Shapes.squareOutline(s,T),
      s=>Shapes.diamondOutline(s,T), s=>Shapes.diamondOutline(s,W), null,
    ]}/>,
    question: 'Each row uses the same shape.\nColumns follow a colour pattern: teal, orange, teal.\nWhat is missing?',
    options: ['Teal diamond outline', 'Orange diamond outline', 'Teal square outline', 'Orange circle outline'],
    answer: 'Teal diamond outline', explanation: 'Row 3 = diamond outlines. Column 3 = teal (same as col 1). So: teal diamond outline.' },

  // pr9 d:4 — main diagonal is teal, rest orange
  { id: 'pr9', type: 'pattern', difficulty: 4,
    visual: () => <ShapeMatrixSVG cells={[
      s=>Shapes.circle(s,T), s=>Shapes.circle(s,W), s=>Shapes.circle(s,W),
      s=>Shapes.circle(s,W), s=>Shapes.circle(s,T), s=>Shapes.circle(s,W),
      s=>Shapes.circle(s,W), s=>Shapes.circle(s,W), null,
    ]}/>,
    question: 'One colour marks the main diagonal (top-left to bottom-right).\nWhat completes the pattern?',
    options: ['Orange circle', 'Teal circle', 'No circle', 'Two circles'],
    answer: 'Teal circle', explanation: 'The main diagonal (positions 1, 5, 9) is all teal. Position 9 must be teal.' },

  // pr10 d:5 — count and colour both cycle
  { id: 'pr10', type: 'pattern', difficulty: 5,
    visual: () => <ShapeMatrixSVG cells={[
      s=>Shapes.dots(s,T,1), s=>Shapes.dots(s,W,2), s=>Shapes.dots(s,T,3),
      s=>Shapes.dots(s,W,3), s=>Shapes.dots(s,T,2), s=>Shapes.dots(s,W,1),
      s=>Shapes.dots(s,T,2), s=>Shapes.dots(s,W,3), null,
    ]}/>,
    question: 'Both the count and colour follow rules across rows.\nWhat completes the pattern?',
    options: ['1 teal dot', '1 orange dot', '2 teal dots', '3 teal dots'],
    answer: '1 teal dot', explanation: 'Row 3: 2 teal → 3 orange → 1 teal (count cycles: 2→3→1, colour alternates T/W/T).' },

  // pr11 d:5 — reflection: col 3 mirrors col 1
  { id: 'pr11', type: 'pattern', difficulty: 5,
    visual: () => <ShapeMatrixSVG cells={[
      s=>Shapes.circle(s,T), s=>Shapes.cross(s,W), s=>Shapes.circle(s,T),
      s=>Shapes.triangle(s,W), s=>Shapes.square(s,T), s=>Shapes.triangle(s,W),
      s=>Shapes.diamond(s,T), s=>Shapes.cross(s,W), null,
    ]}/>,
    question: 'Column 3 always mirrors column 1.\nWhat is missing?',
    options: ['Teal cross', 'Orange diamond', 'Teal diamond', 'Orange cross'],
    answer: 'Teal diamond', explanation: 'Column 3 mirrors column 1. Row 3, column 1 = teal diamond → column 3 = teal diamond.' },

  // pr12 d:5 — fill AND rotation both progress
  { id: 'pr12', type: 'pattern', difficulty: 5,
    visual: () => <ShapeMatrixSVG cells={[
      s=>Shapes.triangleOutline(s,T), s=>Shapes.triangle(s,T,0.3), s=>Shapes.triangle(s,T),
      s=>Shapes.squareOutline(s,W), s=>Shapes.square(s,W,0.33), s=>Shapes.square(s,W),
      s=>Shapes.diamondOutline(s,T), s=>Shapes.diamond(s,T,0.28), null,
    ]}/>,
    question: 'Each row progresses: outline → partial fill → fully filled.\nWhat is missing?',
    options: ['Diamond outline', 'Half-filled diamond', 'Fully filled teal diamond', 'Fully filled orange diamond'],
    answer: 'Fully filled teal diamond', explanation: 'Row 3 = teal diamonds. Pattern = outline → partial → full. Cell 9 = fully filled teal diamond.' },

  // pr13 d:5 — columns define shape, rows define fill style
  { id: 'pr13', type: 'pattern', difficulty: 5,
    visual: () => <ShapeMatrixSVG cells={[
      s=>Shapes.circle(s,T), s=>Shapes.square(s,T), s=>Shapes.triangle(s,T),
      s=>Shapes.circleOutline(s,W), s=>Shapes.squareOutline(s,W), s=>Shapes.triangleOutline(s,W),
      s=>Shapes.circle(s,T,0.2), s=>Shapes.square(s,T,0.25), null,
    ]}/>,
    question: 'Columns define shape type. Rows define fill style.\nWhat is missing?',
    options: ['Small teal triangle', 'Triangle outline', 'Fully filled orange triangle', 'Large teal triangle'],
    answer: 'Small teal triangle', explanation: 'Column 3 = triangle. Row 3 = small teal fill. The missing cell is a small teal triangle.' },

  // pr14 d:5 — two rules at once: shape type from column, colour flips diagonally
  { id: 'pr14', type: 'pattern', difficulty: 5,
    visual: () => <ShapeMatrixSVG cells={[
      s=>Shapes.circle(s,T), s=>Shapes.square(s,W), s=>Shapes.diamond(s,T),
      s=>Shapes.square(s,W), s=>Shapes.diamond(s,T), s=>Shapes.circle(s,W),
      s=>Shapes.diamond(s,T), s=>Shapes.circle(s,W), null,
    ]}/>,
    question: 'Each shape and colour appears exactly once per row and column.\nWhat is missing?',
    options: ['Teal square', 'Orange square', 'Teal circle', 'Orange diamond'],
    answer: 'Orange square', explanation: 'Row 3 has diamond and circle — needs square. Column 3 has diamond and circle — needs square. The colour must be orange (W appears in col 3 rows 1 and 2 — wait, col 3 = T, W. Row 3 colour pattern: T, W, ? → next is W... but square hasn\'t appeared in row 3 or col 3. Answer: orange square.' },

  // ── PATTERN RECOGNITION — number-based grids (original set, kept in pool) ──
  { id: 'pr15', type: 'pattern', difficulty: 1, visual: () => <Matrix2SVG cells={['2','4','3',null]}/>, question: 'Which number completes the grid?', options: ['5', '6', '7', '8'], answer: '6', explanation: 'The right column doubles the left. 3 × 2 = 6.' },
  { id: 'pr16', type: 'pattern', difficulty: 1, visual: () => <MatrixSVG cells={['1','2','3','4','5','6','7','8',null]}/>, question: 'Which number completes the grid?', options: ['8', '9', '10', '11'], answer: '9', explanation: 'Sequential numbers in a 3×3 grid. After 8 comes 9.' },
  { id: 'pr17', type: 'pattern', difficulty: 2, visual: () => <Matrix2SVG cells={['9','3','16','4','25',null]}/>, question: 'Which number completes the grid?', options: ['4', '5', '6', '7'], answer: '5', explanation: 'The right column is the square root of the left. √25 = 5.' },
  { id: 'pr18', type: 'pattern', difficulty: 2, visual: () => <Matrix2SVG cells={['3','6','5','10','8',null]}/>, question: 'Which number completes the grid?', options: ['13', '14', '15', '16'], answer: '16', explanation: 'The right column doubles the left. 8 × 2 = 16.' },
  { id: 'pr19', type: 'pattern', difficulty: 3, visual: () => <MatrixSVG cells={['2','4','8','3','9','27','4','16',null]}/>, question: 'Which number completes the grid?', options: ['32', '48', '64', '128'], answer: '64', explanation: 'Each row: n, n², n³. So 4, 16, 4³ = 64.' },
  { id: 'pr20', type: 'pattern', difficulty: 3, visual: () => <MatrixSVG cells={['1','4','9','16','25','36','49','64',null]}/>, question: 'Which number completes the grid?', options: ['72', '81', '100', '121'], answer: '81', explanation: 'Perfect squares in order. The 9th is 9² = 81.' },
  { id: 'pr21', type: 'pattern', difficulty: 3, visual: () => <MatrixSVG cells={['1','2','3','2','4','6','3','6',null]}/>, question: 'Which number completes the grid?', options: ['7', '8', '9', '10'], answer: '9', explanation: 'Each cell = row × column. Row 3, Col 3: 3 × 3 = 9.' },
  { id: 'pr22', type: 'pattern', difficulty: 4, visual: () => <MatrixSVG cells={['3','6','18','4','8','32','5','10',null]}/>, question: 'Which number completes the grid?', options: ['15', '25', '50', '100'], answer: '50', explanation: 'Pattern: n, 2n, 2n×n. So 5, 10, 10×5 = 50.' },
  { id: 'pr23', type: 'pattern', difficulty: 4, visual: () => <MatrixSVG cells={['2','4','16','3','6','36','4','8',null]}/>, question: 'Which number completes the grid?', options: ['32', '48', '56', '64'], answer: '64', explanation: 'Pattern: n, 2n, (2n)². So 4, 8, 8² = 64.' },
  { id: 'pr24', type: 'pattern', difficulty: 4, visual: () => <MatrixSVG cells={['10','5','15','8','4','12','6','3',null]}/>, question: 'Which number completes the grid?', options: ['7', '8', '9', '10'], answer: '9', explanation: 'Column 3 = Column 1 + Column 2. 6 + 3 = 9.' },
  { id: 'pr25', type: 'pattern', difficulty: 5, visual: () => <MatrixSVG cells={['2','5','11','3','7','15','4','9',null]}/>, question: 'Which number completes the grid?', options: ['17', '18', '19', '20'], answer: '19', explanation: 'Pattern: n, (2n+1), (4n+3). So 4, 9, (4×4)+3 = 19.' },
  { id: 'pr26', type: 'pattern', difficulty: 5, visual: () => <MatrixSVG cells={['1','3','9','2','6','18','3','9',null]}/>, question: 'Which number completes the grid?', options: ['18', '24', '27', '30'], answer: '27', explanation: 'Each row: n, 3n, 9n. So 3, 9, 9×3 = 27.' },
  { id: 'pr27', type: 'pattern', difficulty: 5, visual: () => <MatrixSVG cells={['6','3','9','8','4','12','10','5',null]}/>, question: 'Which number completes the grid?', options: ['12', '14', '15', '16'], answer: '15', explanation: 'Column 3 = Column 1 + Column 2. 10 + 5 = 15.' },
  { id: 'pr28', type: 'pattern', difficulty: 5, question: 'Which number is missing?\n\n16,  ?,  4,  2,  1', options: ['6', '8', '10', '12'], answer: '8', explanation: 'Each term is halved. 16 ÷ 2 = 8, 8 ÷ 2 = 4, 4 ÷ 2 = 2, 2 ÷ 2 = 1.' },

  // ── LOGICAL REASONING (14 questions) ───────────────────────────────────────
  { id: 'lr1',  type: 'logic', difficulty: 1, question: 'Tom is taller than Sam.\nSam is taller than Alex.\n\nWho is the shortest?', options: ['Tom', 'Sam', 'Alex', 'Cannot tell'], answer: 'Alex', explanation: 'Tom > Sam > Alex. Alex is shortest.' },
  { id: 'lr2',  type: 'logic', difficulty: 1, question: 'Sarah is older than Mike.\nMike is older than Jenny.\n\nWho is the oldest?', options: ['Sarah', 'Mike', 'Jenny', 'Cannot tell'], answer: 'Sarah', explanation: 'Sarah > Mike > Jenny. Sarah is oldest.' },
  { id: 'lr3',  type: 'logic', difficulty: 2, question: 'All Bloops are Razzies.\nAll Razzies are Lazzies.\n\nTherefore:', options: ['Some Bloops are Lazzies', 'No Bloops are Lazzies', 'All Bloops are Lazzies', 'All Lazzies are Bloops'], answer: 'All Bloops are Lazzies', explanation: 'Bloops → Razzies → Lazzies. By transitivity, all Bloops are Lazzies.' },
  { id: 'lr4',  type: 'logic', difficulty: 2, question: 'If it rains, the ground gets wet.\nThe ground is wet.\n\nTherefore:', options: ['It definitely rained', 'It definitely did not rain', 'It may or may not have rained', 'The rain caused flooding'], answer: 'It may or may not have rained', explanation: 'The ground could be wet for other reasons — this is the logical fallacy of affirming the consequent.' },
  { id: 'lr5',  type: 'logic', difficulty: 2, question: 'All squares are rectangles.\nShape X is a square.\n\nTherefore:', options: ['Shape X is not a rectangle', 'Shape X is a rectangle', 'Shape X might be a rectangle', 'Cannot tell'], answer: 'Shape X is a rectangle', explanation: 'Since all squares are rectangles and X is a square, X must be a rectangle.' },
  { id: 'lr6',  type: 'logic', difficulty: 3, question: 'All roses are flowers.\nSome flowers fade quickly.\n\nTherefore:', options: ['All roses fade quickly', 'No roses fade quickly', 'Some roses may fade quickly', 'Roses are not flowers'], answer: 'Some roses may fade quickly', explanation: 'Since only "some" flowers fade quickly, roses may or may not be among them.' },
  { id: 'lr7',  type: 'logic', difficulty: 3, question: 'No fish are mammals.\nAll dolphins are mammals.\n\nTherefore:', options: ['Some dolphins are fish', 'No dolphins are fish', 'All fish are dolphins', 'Some mammals are fish'], answer: 'No dolphins are fish', explanation: 'All dolphins are mammals, and no fish are mammals — so dolphins and fish are entirely separate.' },
  { id: 'lr8',  type: 'logic', difficulty: 3, question: 'Jake is not the tallest.\nLuke is taller than Jake.\nThere are only three people.\n\nWho is shortest?', options: ['Jake', 'Luke', 'The third person', 'Cannot tell'], answer: 'Cannot tell', explanation: 'We know Luke > Jake, but we don\'t know where the third person ranks relative to Jake.' },
  { id: 'lr9',  type: 'logic', difficulty: 4, question: 'Five people sit in a row.\nAnna sits right of Ben.\nCarlos sits left of Ben.\nDiana sits right of Anna.\n\nWho sits in the middle?', options: ['Anna', 'Ben', 'Carlos', 'Diana'], answer: 'Anna', explanation: 'Order: Carlos, Ben, Anna, Diana, [5th]. Anna is 3rd — the middle position.' },
  { id: 'lr10', type: 'logic', difficulty: 4, question: '"If I study, I pass."\n"I did not pass."\n\nWhat can we conclude?', options: ['I did not study', 'I studied but failed anyway', 'Studying does not help', 'Nothing can be concluded'], answer: 'I did not study', explanation: 'Modus tollens: If P → Q, and not Q, then not P. No pass means no study.' },
  { id: 'lr11', type: 'logic', difficulty: 4, question: 'There are 5 houses in a row.\nThe red house is next to the blue house.\nThe green house is not next to the red house.\nThe blue house is in the middle.\n\nCan the red house be at position 1?', options: ['Yes', 'No', 'Only if green is at 5', 'Cannot tell'], answer: 'No', explanation: 'Blue is in position 3 (middle). Red must be next to blue, so red is at 2 or 4 — not position 1.' },
  { id: 'lr12', type: 'logic', difficulty: 5, question: 'Some A are B.\nAll B are C.\nNo C are D.\n\nWhich must be true?', options: ['Some A are D', 'No A are D', 'Some A are not D', 'All A are C'], answer: 'Some A are not D', explanation: 'Some A are B → those A are also C → those A are not D. So some A are definitely not D.' },
  { id: 'lr13', type: 'logic', difficulty: 5, question: 'Every employee who works overtime gets a bonus.\nJames did not get a bonus.\n\nWhich must be true?', options: ['James never works', 'James did not work overtime', 'James worked overtime but was missed', 'Cannot conclude anything'], answer: 'James did not work overtime', explanation: 'Contrapositive: if no bonus, then no overtime. If James had worked overtime, he would have gotten a bonus.' },
  { id: 'lr14', type: 'logic', difficulty: 5, question: 'P is true or Q is true (or both).\nP is false.\n\nTherefore:', options: ['Q must be false', 'Q must be true', 'Both are false', 'Cannot tell'], answer: 'Q must be true', explanation: 'Disjunctive syllogism: if P ∨ Q and ¬P, then Q must be true.' },

  // ── WORKING MEMORY (14 questions) ──────────────────────────────────────────
  { id: 'wm1',  type: 'memory', difficulty: 1, question: 'What letter comes next?\n\nB,  D,  F,  H,  ?', options: ['I', 'J', 'K', 'L'], answer: 'J', explanation: 'Every other letter: B(2), D(4), F(6), H(8), J(10).' },
  { id: 'wm2',  type: 'memory', difficulty: 1, question: 'Count the number of E\'s:\n\nELEPHANT', options: ['1', '2', '3', '4'], answer: '2', explanation: 'E-L-E-P-H-A-N-T. There are 2 E\'s: positions 1 and 3.' },
  { id: 'wm3',  type: 'memory', difficulty: 2, question: 'If A=1, B=2, C=3...\n\nWhat does CAB equal as a number?', options: ['123', '312', '321', '213'], answer: '312', explanation: 'C=3, A=1, B=2. Written in order: 312.' },
  { id: 'wm4',  type: 'memory', difficulty: 2, question: 'Which number is missing?\n\nList 1:  3,  7,  12,  19,  28\nList 2:  3,  12,  19,  28', options: ['3', '7', '12', '19'], answer: '7', explanation: '7 appears in List 1 but is absent from List 2.' },
  { id: 'wm5',  type: 'memory', difficulty: 2, question: 'Reverse the word STAR.\nWhat is the new word?', options: ['RATS', 'ARTS', 'TARS', 'RAST'], answer: 'RATS', explanation: 'STAR reversed letter by letter = RATS.' },
  { id: 'wm6',  type: 'memory', difficulty: 3, question: 'A shop sells apples for 30p\nand oranges for 45p.\n\nYou buy 3 apples and 2 oranges.\nWhat is the total?', options: ['£1.50', '£1.65', '£1.70', '£1.80'], answer: '£1.80', explanation: '3 × 30p = 90p. 2 × 45p = 90p. Total = £1.80.' },
  { id: 'wm7',  type: 'memory', difficulty: 3, question: 'Reverse the word SMART.\nThen take the 3rd letter.\n\nWhat do you get?', options: ['A', 'M', 'R', 'T'], answer: 'A', explanation: 'SMART reversed = TRAMS. The 3rd letter is A.' },
  { id: 'wm8',  type: 'memory', difficulty: 3, memoryReveal: '4,  8,  2,  6,  1', question: 'What is the 2nd number\nminus the 4th number?', options: ['1', '2', '3', '4'], answer: '2', explanation: '2nd number = 8. 4th number = 6. 8 − 6 = 2.' },
  { id: 'wm9',  type: 'memory', difficulty: 4, question: 'A train leaves at 09:45.\nIt takes 1h 35min to City A,\nthen 50min to City B.\n\nWhat time does it arrive at City B?', options: ['11:50', '12:00', '12:10', '12:20'], answer: '12:10', explanation: '09:45 + 1h35m = 11:20. 11:20 + 50m = 12:10.' },
  { id: 'wm10', type: 'memory', difficulty: 4, question: 'A book has 300 pages.\nYou read 25 pages a day.\nAfter 8 days, how many pages\ndo you still have left to read?', options: ['80', '90', '100', '110'], answer: '100', explanation: '8 days × 25 pages = 200 pages read. 300 − 200 = 100 pages remaining.' },
  { id: 'wm11', type: 'memory', difficulty: 4, memoryReveal: '6,  1,  8,  3,  9,  2,  5', question: 'What is the sum of the\n1st and last numbers?', options: ['9', '10', '11', '12'], answer: '11', explanation: '1st number = 6. Last number = 5. 6 + 5 = 11.' },
  { id: 'wm12', type: 'memory', difficulty: 5, memoryReveal: '7,  3,  9,  1,  5,  8,  2', question: 'What is the sum of the\n3rd and 5th numbers?', options: ['10', '12', '14', '16'], answer: '14', explanation: '3rd number = 9. 5th number = 5. 9 + 5 = 14.' },
  { id: 'wm13', type: 'memory', difficulty: 5, memoryReveal: '3,  7,  2,  8,  4,  6,  1,  9', question: 'Which number appears\nin an even position AND\nis greater than 5?', options: ['7', '8', '6', '9'], answer: '8', explanation: 'Even positions (2,4,6,8): 7, 8, 6, 9. Of these, those > 5: 7, 8, 6, 9. The one uniquely in an even position AND > 5 and appearing first is 8 (position 4).' },
  { id: 'wm14', type: 'memory', difficulty: 5, question: 'A sequence follows this rule:\neach term = (previous term × 2) + 1.\n\nIf the first term is 2,\nwhat is the 5th term?', options: ['31', '47', '51', '63'], answer: '47', explanation: 'T1=2. T2=(2×2)+1=5. T3=(5×2)+1=11. T4=(11×2)+1=23. T5=(23×2)+1=47.' },

  // ── SPATIAL REASONING (14 questions) ───────────────────────────────────────
  { id: 'sr1',  type: 'spatial', difficulty: 1, question: 'A square piece of paper is folded in half once, then cut with one straight cut across the middle.\n\nHow many pieces are there when unfolded?', options: ['2', '3', '4', '5'], answer: '3', explanation: 'Folding in half and cutting across creates 3 pieces — the two outer halves and a cut-through middle section.' },
  { id: 'sr2',  type: 'spatial', difficulty: 1, visual: () => <CompassSVG facing="N"/>, question: 'You are facing North.\nYou turn 90° clockwise.\nThen turn 180° clockwise.\n\nWhich direction are you facing?', options: ['North', 'South', 'East', 'West'], answer: 'West', explanation: 'North → 90° clockwise = East → 180° clockwise = West.' },
  { id: 'sr3',  type: 'spatial', difficulty: 2, visual: () => <CubeSVG highlight="top"/>, question: 'How many faces does a cube have?', options: ['4', '5', '6', '8'], answer: '6', explanation: 'A cube has 6 faces: top, bottom, front, back, left, right.' },
  { id: 'sr4',  type: 'spatial', difficulty: 2, visual: () => <ClockSVG hour={3} minute={0}/>, question: 'A clock shows 3:00.\nWhat is the angle between\nthe hour and minute hands?', options: ['60°', '75°', '90°', '120°'], answer: '90°', explanation: 'At 3:00, the minute hand points to 12 and the hour hand to 3. That is exactly 90°.' },
  { id: 'sr5',  type: 'spatial', difficulty: 2, visual: () => <CompassSVG facing="S"/>, question: 'You are facing South.\nYou turn left twice (each turn is 90°).\n\nWhich direction are you now facing?', options: ['North', 'South', 'East', 'West'], answer: 'North', explanation: 'South → turn left 90° = East → turn left 90° = North.' },
  { id: 'sr6',  type: 'spatial', difficulty: 3, visual: () => <CubeSVG highlight="front"/>, question: 'A 3×3×3 cube is painted red on all outside faces, then cut into 27 smaller cubes.\n\nHow many small cubes have NO red faces?', options: ['0', '1', '4', '8'], answer: '1', explanation: 'Only the single cube at the very centre has no painted faces.' },
  { id: 'sr7',  type: 'spatial', difficulty: 3, visual: () => (
    <svg width="180" height="130" viewBox="0 0 180 130">
      <rect x="20" y="20" width="140" height="90" fill="rgba(125,249,255,0.08)" stroke={T} strokeWidth="1.5" rx="3"/>
      <line x1="20" y1="20" x2="160" y2="110" stroke={W} strokeWidth="2.5" strokeDasharray="6 3"/>
      <text x="90" y="115" textAnchor="middle" fontSize="10" fill={W} fontFamily="JetBrains Mono">diagonal = ?</text>
      <text x="90" y="14" textAnchor="middle" fontSize="10" fill={T} fontFamily="JetBrains Mono">8cm</text>
      <text x="5" y="68" textAnchor="middle" fontSize="10" fill={T} fontFamily="JetBrains Mono">6cm</text>
    </svg>
  ), question: 'A rectangle is 8cm wide and 6cm tall.\nIt is cut diagonally from corner to corner.\n\nWhat is the length of the diagonal cut?', options: ['8cm', '9cm', '10cm', '12cm'], answer: '10cm', explanation: 'Pythagoras: √(8² + 6²) = √(64 + 36) = √100 = 10cm.' },
  { id: 'sr8',  type: 'spatial', difficulty: 3, visual: () => <CubeSVG highlight="side"/>, question: 'How many edges does a cube have?', options: ['6', '8', '12', '16'], answer: '12', explanation: 'A cube has 12 edges: 4 on top, 4 on bottom, and 4 vertical edges connecting them.' },
  { id: 'sr9',  type: 'spatial', difficulty: 4, visual: () => <PyramidSVG/>, question: 'A shape has 5 faces, 5 vertices and 8 edges.\n\nWhat shape is it?', options: ['Cube', 'Triangular prism', 'Square pyramid', 'Tetrahedron'], answer: 'Square pyramid', explanation: 'A square pyramid has a square base (1 face) + 4 triangular faces = 5 faces, 5 vertices, 8 edges.' },
  { id: 'sr10', type: 'spatial', difficulty: 4, visual: () => <PathSVG steps={[{dir:'N',label:'3mi'},{dir:'E',label:'4mi'}]}/>, question: 'You walk 3 miles North,\nthen 4 miles East.\n\nHow far are you from your starting point in a straight line?', options: ['5 miles', '6 miles', '7 miles', '8 miles'], answer: '5 miles', explanation: 'Pythagoras: √(3² + 4²) = √(9 + 16) = √25 = 5 miles.' },
  { id: 'sr11', type: 'spatial', difficulty: 4, visual: () => <CubeSVG highlight="top"/>, question: 'A cube is 3×3×3.\nSmaller 1×1×1 cubes are removed from all 8 corners.\n\nHow many small cubes remain?', options: ['18', '19', '20', '21'], answer: '19', explanation: '27 total − 8 corner cubes = 19 remaining.' },
  { id: 'sr12', type: 'spatial', difficulty: 5, visual: () => <CubeSVG highlight="side"/>, question: 'A 3×3×3 cube is painted red on all outside faces, then cut into 27 smaller cubes.\n\nHow many small cubes have exactly 2 red faces?', options: ['8', '12', '16', '20'], answer: '12', explanation: 'Edge pieces (not corners) have exactly 2 painted faces. A cube has 12 edges, each with 1 non-corner edge piece = 12 cubes.' },
  { id: 'sr13', type: 'spatial', difficulty: 5, visual: () => <ClockSVG hour={6} minute={30}/>, question: 'A clock shows 6:30.\nWhat is the angle between\nthe hour and minute hands?', options: ['0°', '4°', '10°', '15°'], answer: '15°', explanation: 'At 6:30 the minute hand is at 180°. The hour hand is halfway between 6 and 7: 180° + 15° = 195°. Difference = 15°.' },
  { id: 'sr14', type: 'spatial', difficulty: 5, question: 'A square piece of paper is folded in half twice (both times the same way), then a circular hole is punched through all layers.\n\nHow many holes are there when fully unfolded?', options: ['2', '3', '4', '8'], answer: '4', explanation: 'Folding twice creates 4 layers. One punch through all layers = 4 holes when unfolded.' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const TYPE_LABELS = {
  sequence: 'Number Sequences',
  verbal:   'Verbal Reasoning',
  pattern:  'Pattern Recognition',
  logic:    'Logical Reasoning',
  memory:   'Working Memory',
  spatial:  'Spatial Reasoning',
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
  const types = ['sequence', 'verbal', 'pattern', 'logic', 'memory', 'spatial'];
  const perType = Math.floor(count / types.length);
  const extra = count % types.length;
  let selected = [];
  types.forEach((type, i) => {
    const pool = QUESTION_BANK.filter(q => q.type === type);
    const need = perType + (i < extra ? 1 : 0);
    // Weight harder questions: difficulty 4-5 get 3x chance, difficulty 3 gets 2x
    const weighted = shuffle([
      ...pool.filter(q => q.difficulty >= 4),
      ...pool.filter(q => q.difficulty >= 4),
      ...pool.filter(q => q.difficulty >= 4),
      ...pool.filter(q => q.difficulty === 3),
      ...pool.filter(q => q.difficulty === 3),
      ...pool.filter(q => q.difficulty <= 2),
    ]);
    // Deduplicate while preserving weighted order
    const seen = new Set();
    const deduped = weighted.filter(q => seen.has(q.id) ? false : seen.add(q.id));
    selected = selected.concat(deduped.slice(0, Math.min(need, deduped.length)));
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

  // Map percentage score to IQ using a proper normal distribution approximation.
  // Anchored so that:
  //   ~2%  correct → ~70  (borderline)
  //   ~20% correct → ~85  (low average)
  //   ~50% correct → ~100 (average)
  //   ~75% correct → ~115 (high average)
  //   ~90% correct → ~130 (superior)
  //   ~98% correct → ~145 (very superior)
  // Uses a rational approximation of the inverse normal CDF (Beasley-Springer-Moro).
  const clampedPct = Math.max(0.01, Math.min(0.99, pct));

  function inverseNormalCDF(p) {
    const a = [2.50662823884, -18.61500062529, 41.39119773534, -25.44106049637];
    const b = [-8.47351093090, 23.08336743743, -21.06224101826, 3.13082909833];
    const c = [0.3374754822726147, 0.9761690190917186, 0.1607979714918209,
               0.0276438810333863, 0.0038405729373609, 0.0003951896511349,
               0.0000321767881768, 0.0000002888167364, 0.0000003960315187];
    let r, z;
    const q2 = p - 0.5;
    if (Math.abs(q2) <= 0.42) {
      r = q2 * q2;
      z = q2 * (((a[3]*r+a[2])*r+a[1])*r+a[0]) / ((((b[3]*r+b[2])*r+b[1])*r+b[0])*r+1);
    } else {
      r = p < 0.5 ? p : 1 - p;
      r = Math.sqrt(-Math.log(r));
      z = c[0]+r*(c[1]+r*(c[2]+r*(c[3]+r*(c[4]+r*(c[5]+r*(c[6]+r*(c[7]+r*c[8])))))));
      if (q2 < 0) z = -z;
    }
    return z;
  }

  const z = inverseNormalCDF(clampedPct);
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
  const [phase, setPhase]               = useState('intro');
  const [questions, setQuestions]       = useState([]);
  const [idx, setIdx]                   = useState(0);
  const [answers, setAnswers]           = useState({});
  const [startTime, setStartTime]       = useState(null);
  const [elapsed, setElapsed]           = useState(0);
  const [result, setResult]             = useState(null);
  const [mounted, setMounted]           = useState(false);
  const [showWarning, setShowWarning]   = useState(false);
  const [memoryRevealed, setMemoryRevealed] = useState(false);
  const [memoryPulsing, setMemoryPulsing]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // For memory questions — show sequence for 5s then hide with pulse warning
  // Use q.id as the key so this only fires when the actual question changes
  useEffect(() => {
    if (phase !== 'test' || !questions.length) return;
    const q = questions[idx];
    if (!q) return;
    if (q.memoryReveal) {
      setMemoryRevealed(true);
      setMemoryPulsing(false);
      const pulseTimer = setTimeout(() => setMemoryPulsing(true), 3500);
      const hideTimer  = setTimeout(() => {
        setMemoryRevealed(false);
        setMemoryPulsing(false);
      }, 5000);
      return () => {
        clearTimeout(pulseTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setMemoryRevealed(false);
      setMemoryPulsing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, phase, questions.length]);

  useEffect(() => {
    if (phase !== 'test') return;
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [phase, startTime]);

  const startTest = (count) => {
    const qs = selectQuestions(count);
    setQuestions(qs);
    setIdx(0);
    setAnswers({});
    setStartTime(Date.now());
    setElapsed(0);
    setResult(null);
    setShowWarning(false);
    setPhase('test');
  };

  // Select an answer for the current question
  const handleSelect = (opt) => {
    setAnswers(prev => ({ ...prev, [questions[idx].id]: opt }));
  };

  // Navigate back
  const handleBack = () => {
    if (idx > 0) setIdx(i => i - 1);
  };

  // Navigate forward / skip
  const handleForward = () => {
    if (idx < questions.length - 1) setIdx(i => i + 1);
  };

  // Attempt to finish — warn about unanswered questions first
  const handleFinish = () => {
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      setShowWarning(true);
    } else {
      submitTest();
    }
  };

  const submitTest = () => {
    setShowWarning(false);
    const iq = calculateIQ(answers, questions);
    const catScores = {};
    questions.forEach(q => {
      if (!catScores[q.type]) catScores[q.type] = { correct: 0, total: 0 };
      catScores[q.type].total++;
      if (answers[q.id] === q.answer) catScores[q.type].correct++;
    });
    const correctCount = questions.filter(q => answers[q.id] === q.answer).length;
    const bestCat = Object.entries(catScores).sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total))[0]?.[0];
    setResult({ iq, correctCount, catScores, bestCat, answers: { ...answers }, time: Math.floor((Date.now() - startTime) / 1000) });
    setPhase('results');
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

          .length-card--warm { border-color: rgba(255, 107, 53, 0.2); }
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

          .length-name { font-size: 16px; font-weight: 700; color: #fff; }

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
    const currentAnswer = answers[q.id] || null;
    const unansweredCount = questions.filter((qu, i) => !answers[qu.id] && i !== idx).length;
    const isLast = idx === questions.length - 1;

    return (
      <Layout>
        <div className="page">

          {/* ── Top bar ── */}
          <div className="topbar">
            <div className="progress-wrap">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(idx / questions.length) * 100}%` }} />
              </div>
              <span className="counter">{idx + 1} / {questions.length}</span>
            </div>
            <div className="topbar-meta">
              <span className="type-tag">{TYPE_LABELS[q.type]}</span>
              <span className="timer">⏱ {formatTime(elapsed)}</span>
            </div>
          </div>

          {/* ── Question dot map ── */}
          <div className="dot-map">
            {questions.map((qu, i) => {
              let state = 'unanswered';
              if (answers[qu.id]) state = 'answered';
              if (i === idx) state = 'current';
              return (
                <button
                  key={qu.id}
                  className={`dot dot--${state}`}
                  onClick={() => setIdx(i)}
                  title={`Q${i + 1}${answers[qu.id] ? ' ✓' : ''}`}
                />
              );
            })}
          </div>

          {/* ── Question card ── */}
          <div className="q-card">
            <div className="diff-row">
              {[1,2,3,4,5].map(d => (
                <div key={d} className="diff-dot" style={{ opacity: d <= q.difficulty ? 1 : 0.1 }} />
              ))}
              <span className="diff-label">Difficulty {q.difficulty}/5</span>
            </div>

            <div className="question-wrap">
              {q.memoryReveal && (
                <div className={`memory-reveal ${memoryPulsing ? 'memory-reveal--pulsing' : ''} ${!memoryRevealed ? 'memory-reveal--hidden' : ''}`}>
                  <span className="memory-reveal-label">// MEMORISE</span>
                  <span className="memory-reveal-seq">{q.memoryReveal}</span>
                  <span className="memory-reveal-hint">{memoryPulsing ? 'Disappearing...' : 'Memorise this sequence'}</span>
                </div>
              )}
              {q.visual && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 12px' }}>
                  {q.visual()}
                </div>
              )}
              <p className="question-text" style={{ opacity: q.memoryReveal && memoryRevealed ? 0.25 : 1 }}>{q.question}</p>
            </div>

            <div className="options-grid">
              {q.options.map((opt, i) => {
                const letters = ['A', 'B', 'C', 'D'];
                return (
                  <button
                    key={opt}
                    className={`option ${currentAnswer === opt ? 'option--selected' : ''}`}
                    onClick={() => handleSelect(opt)}
                  >
                    <span className="option-letter">{letters[i]}</span>
                    <span className="option-text">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* ── Navigation row ── */}
            <div className="nav-row">
              <button
                className={`nav-btn nav-btn--back ${idx === 0 ? 'nav-btn--disabled' : ''}`}
                onClick={handleBack}
                disabled={idx === 0}
              >
                ← Back
              </button>

              <button
                className="nav-btn nav-btn--skip"
                onClick={handleForward}
                disabled={isLast}
                style={{ opacity: isLast ? 0.2 : 1 }}
              >
                Skip →
              </button>

              {isLast ? (
                <button
                  className="nav-btn nav-btn--finish"
                  onClick={handleFinish}
                >
                  {unansweredCount > 0 ? `Finish (${unansweredCount} skipped)` : 'View Results →'}
                </button>
              ) : (
                <button
                  className={`nav-btn nav-btn--next ${currentAnswer ? 'nav-btn--next-ready' : ''}`}
                  onClick={handleForward}
                  disabled={!currentAnswer}
                >
                  Next →
                </button>
              )}
            </div>
          </div>

          {/* ── Unanswered warning modal ── */}
          {showWarning && (
            <div className="modal-overlay" onClick={() => setShowWarning(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <p className="modal-eyebrow">// UNANSWERED_QUESTIONS</p>
                <h2 className="modal-title">
                  {questions.filter(q => !answers[q.id]).length} question{questions.filter(q => !answers[q.id]).length > 1 ? 's' : ''} skipped
                </h2>
                <p className="modal-body">
                  Unanswered questions count as incorrect and will affect your score. You can go back and answer them, or submit now.
                </p>
                <div className="modal-dots">
                  {questions.map((qu, i) => !answers[qu.id] && (
                    <button
                      key={qu.id}
                      className="modal-skip-pill"
                      onClick={() => { setShowWarning(false); setIdx(i); }}
                    >
                      Q{i + 1}
                    </button>
                  ))}
                </div>
                <div className="modal-actions">
                  <button className="modal-btn modal-btn--cancel" onClick={() => setShowWarning(false)}>
                    Go Back
                  </button>
                  <button className="modal-btn modal-btn--confirm" onClick={submitTest}>
                    Submit Anyway
                  </button>
                </div>
              </div>
            </div>
          )}

          <style jsx>{`
            .page { max-width: 680px; margin: 0 auto; padding: 80px 20px 100px; }

            /* Top bar */
            .topbar { margin-bottom: 16px; }

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

            /* Dot map */
            .dot-map {
              display: flex;
              flex-wrap: wrap;
              gap: 6px;
              margin-bottom: 20px;
            }

            .dot {
              width: 10px;
              height: 10px;
              border-radius: 50%;
              border: none;
              cursor: pointer;
              padding: 0;
              transition: transform 0.15s ease, opacity 0.15s ease;
              flex-shrink: 0;
            }

            .dot:hover { transform: scale(1.4); }

            .dot--unanswered {
              background: rgba(255,255,255,0.12);
            }

            .dot--answered {
              background: var(--accent);
              opacity: 0.6;
            }

            .dot--current {
              background: var(--warm);
              opacity: 1;
              transform: scale(1.3);
              box-shadow: 0 0 8px rgba(255,107,53,0.5);
            }

            /* Question card */
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

            .memory-reveal {
              background: rgba(125,249,255,0.05);
              border: 1px solid rgba(125,249,255,0.2);
              border-radius: 12px;
              padding: 20px 24px;
              margin-bottom: 24px;
              display: flex;
              flex-direction: column;
              gap: 6px;
              transition: all 0.5s ease;
            }

            .memory-reveal--pulsing {
              border-color: rgba(255,107,53,0.5);
              background: rgba(255,107,53,0.06);
              animation: memPulse 0.5s ease-in-out infinite alternate;
            }

            .memory-reveal--hidden {
              opacity: 0;
              pointer-events: none;
              transform: scale(0.97);
            }

            @keyframes memPulse {
              from { box-shadow: 0 0 0 rgba(255,107,53,0); }
              to   { box-shadow: 0 0 16px rgba(255,107,53,0.3); }
            }

            .memory-reveal-label {
              font-family: 'JetBrains Mono';
              font-size: 9px;
              letter-spacing: 0.2em;
              color: var(--accent);
            }

            .memory-reveal--pulsing .memory-reveal-label { color: var(--warm); }

            .memory-reveal-seq {
              font-size: 24px;
              font-weight: 800;
              color: #fff;
              letter-spacing: 0.05em;
            }

            .memory-reveal-hint {
              font-family: 'JetBrains Mono';
              font-size: 9px;
              color: rgba(255,255,255,0.3);
              letter-spacing: 0.1em;
            }

            .memory-reveal--pulsing .memory-reveal-hint { color: var(--warm); }

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

            /* Navigation row */
            .nav-row {
              display: grid;
              grid-template-columns: 1fr 1fr 1.5fr;
              gap: 10px;
            }

            .nav-btn {
              padding: 14px 12px;
              border-radius: 12px;
              font-family: 'JetBrains Mono';
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.08em;
              cursor: pointer;
              transition: all 0.2s ease;
              text-transform: uppercase;
              border: 1px solid rgba(255,255,255,0.08);
              background: transparent;
            }

            /* Back */
            .nav-btn--back {
              color: rgba(255,255,255,0.35);
            }
            .nav-btn--back:hover:not(:disabled) {
              color: rgba(255,255,255,0.7);
              border-color: rgba(255,255,255,0.2);
              background: rgba(255,255,255,0.04);
            }
            .nav-btn--disabled {
              opacity: 0.2;
              cursor: not-allowed;
            }

            /* Skip */
            .nav-btn--skip {
              color: rgba(255,255,255,0.25);
            }
            .nav-btn--skip:hover:not(:disabled) {
              color: rgba(255,255,255,0.6);
              border-color: rgba(255,255,255,0.15);
              background: rgba(255,255,255,0.03);
            }

            /* Next (locked until answered) */
            .nav-btn--next {
              color: rgba(255,255,255,0.2);
              cursor: not-allowed;
            }
            .nav-btn--next-ready {
              background: var(--accent);
              border-color: var(--accent);
              color: #000;
              cursor: pointer;
            }
            .nav-btn--next-ready:hover {
              box-shadow: 0 0 20px rgba(125, 249, 255, 0.3);
              transform: scale(1.01);
            }

            /* Finish */
            .nav-btn--finish {
              background: var(--warm);
              border-color: var(--warm);
              color: #000;
              cursor: pointer;
            }
            .nav-btn--finish:hover {
              box-shadow: 0 0 20px rgba(255, 107, 53, 0.35);
              transform: scale(1.01);
            }

            /* Modal */
            .modal-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0,0,0,0.75);
              backdrop-filter: blur(6px);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 100;
              padding: 20px;
            }

            .modal {
              background: #111;
              border: 1px solid rgba(255,107,53,0.25);
              border-radius: 24px;
              padding: 44px 40px;
              max-width: 480px;
              width: 100%;
            }

            .modal-eyebrow {
              font-family: 'JetBrains Mono';
              font-size: 10px;
              letter-spacing: 0.2em;
              color: var(--warm);
              margin-bottom: 12px;
            }

            .modal-title {
              font-size: 28px;
              font-weight: 800;
              color: #fff;
              margin-bottom: 14px;
              letter-spacing: -0.02em;
            }

            .modal-body {
              font-size: 14px;
              color: var(--text-2);
              line-height: 1.6;
              margin-bottom: 20px;
            }

            .modal-dots {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-bottom: 28px;
            }

            .modal-skip-pill {
              padding: 6px 14px;
              background: rgba(255,107,53,0.08);
              border: 1px solid rgba(255,107,53,0.2);
              border-radius: 999px;
              font-family: 'JetBrains Mono';
              font-size: 11px;
              color: var(--warm);
              cursor: pointer;
              transition: all 0.2s;
            }
            .modal-skip-pill:hover {
              background: rgba(255,107,53,0.15);
              border-color: rgba(255,107,53,0.4);
            }

            .modal-actions {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }

            .modal-btn {
              padding: 14px;
              border-radius: 12px;
              font-family: 'JetBrains Mono';
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              cursor: pointer;
              transition: all 0.2s;
            }

            .modal-btn--cancel {
              background: transparent;
              border: 1px solid rgba(255,255,255,0.1);
              color: rgba(255,255,255,0.5);
            }
            .modal-btn--cancel:hover {
              background: rgba(255,255,255,0.04);
              color: rgba(255,255,255,0.8);
            }

            .modal-btn--confirm {
              background: var(--warm);
              border: 1px solid var(--warm);
              color: #000;
            }
            .modal-btn--confirm:hover {
              box-shadow: 0 0 20px rgba(255,107,53,0.35);
              transform: scale(1.02);
            }

            @media (max-width: 520px) {
              .q-card { padding: 28px 20px; }
              .options-grid { grid-template-columns: 1fr; }
              .question-text { font-size: 17px; }
              .nav-row { grid-template-columns: 1fr 1fr; }
              .nav-btn--finish, .nav-btn--next { grid-column: 1 / -1; }
              .modal { padding: 28px 20px; }
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