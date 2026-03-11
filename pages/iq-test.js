import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

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

  // ── PATTERN RECOGNITION (14 questions) ─────────────────────────────────────
  { id: 'pr1',  type: 'pattern', difficulty: 1, question: 'Which number completes the grid?\n\n[ 2  |  4 ]\n[ 3  |  ? ]', options: ['5', '6', '7', '8'], answer: '6', explanation: 'The right column doubles the left. 3 × 2 = 6.' },
  { id: 'pr2',  type: 'pattern', difficulty: 1, question: 'Which number completes the grid?\n\n[ 1  |  2  |  3 ]\n[ 4  |  5  |  6 ]\n[ 7  |  8  |  ? ]', options: ['8', '9', '10', '11'], answer: '9', explanation: 'Sequential numbers in a 3×3 grid. After 8 comes 9.' },
  { id: 'pr3',  type: 'pattern', difficulty: 2, question: 'Which number completes the grid?\n\n[ 9   |  3 ]\n[ 16  |  4 ]\n[ 25  |  ? ]', options: ['4', '5', '6', '7'], answer: '5', explanation: 'The right column is the square root of the left. √25 = 5.' },
  { id: 'pr4',  type: 'pattern', difficulty: 2, question: 'Which number completes the grid?\n\n[ 3  |  6 ]\n[ 5  |  10 ]\n[ 8  |  ? ]', options: ['13', '14', '15', '16'], answer: '16', explanation: 'The right column doubles the left. 8 × 2 = 16.' },
  { id: 'pr5',  type: 'pattern', difficulty: 3, question: 'Which number completes the grid?\n\n[ 2  |  4  |  8  ]\n[ 3  |  9  |  27 ]\n[ 4  |  16 |  ?  ]', options: ['32', '48', '64', '128'], answer: '64', explanation: 'Each row: n, n², n³. So 4, 16, 4³ = 64.' },
  { id: 'pr6',  type: 'pattern', difficulty: 3, question: 'Which number completes the grid?\n\n[ 1  |  4  |  9  ]\n[ 16 |  25 |  36 ]\n[ 49 |  64 |  ?  ]', options: ['72', '81', '100', '121'], answer: '81', explanation: 'Perfect squares in order. The 9th is 9² = 81.' },
  { id: 'pr7',  type: 'pattern', difficulty: 3, question: 'Which number completes the grid?\n\n[ 1  |  2  |  3 ]\n[ 2  |  4  |  6 ]\n[ 3  |  6  |  ? ]', options: ['7', '8', '9', '10'], answer: '9', explanation: 'Each cell = row × column. Row 3, Col 3: 3 × 3 = 9.' },
  { id: 'pr8',  type: 'pattern', difficulty: 4, question: 'Which number completes the grid?\n\n[ 3  |  6  |  18 ]\n[ 4  |  8  |  32 ]\n[ 5  |  10 |  ?  ]', options: ['15', '25', '50', '100'], answer: '50', explanation: 'Pattern: n, 2n, 2n×n. So 5, 10, 10×5 = 50.' },
  { id: 'pr9',  type: 'pattern', difficulty: 4, question: 'Which number completes the grid?\n\n[ 2  |  4  |  16 ]\n[ 3  |  6  |  36 ]\n[ 4  |  8  |  ?  ]', options: ['32', '48', '56', '64'], answer: '64', explanation: 'Pattern: n, 2n, (2n)². So 4, 8, 8² = 64.' },
  { id: 'pr10', type: 'pattern', difficulty: 4, question: 'Which number completes the grid?\n\n[ 10 |  5  |  15 ]\n[ 8  |  4  |  12 ]\n[ 6  |  3  |  ?  ]', options: ['7', '8', '9', '10'], answer: '9', explanation: 'Column 3 = Column 1 + Column 2. 6 + 3 = 9.' },
  { id: 'pr11', type: 'pattern', difficulty: 5, question: 'Which number completes the grid?\n\n[ 2  |  5  |  11 ]\n[ 3  |  7  |  15 ]\n[ 4  |  9  |  ?  ]', options: ['17', '18', '19', '20'], answer: '19', explanation: 'Pattern: n, (2n+1), (4n+3). So 4, 9, (4×4)+3 = 19.' },
  { id: 'pr12', type: 'pattern', difficulty: 5, question: 'Which number completes the grid?\n\n[ 1  |  3  |  9  ]\n[ 2  |  6  |  18 ]\n[ 3  |  9  |  ?  ]', options: ['18', '24', '27', '30'], answer: '27', explanation: 'Each row: n, 3n, 9n. So 3, 9, 9×3 = 27.' },
  { id: 'pr13', type: 'pattern', difficulty: 5, question: 'Which number completes the grid?\n\n[ 6  |  3  |  9  ]\n[ 8  |  4  |  12 ]\n[ 10 |  5  |  ?  ]', options: ['12', '14', '15', '16'], answer: '15', explanation: 'Column 3 = Column 1 + Column 2. 10 + 5 = 15.' },
  { id: 'pr14', type: 'pattern', difficulty: 5, question: 'Which number is missing?\n\n16,  ?,  4,  2,  1', options: ['6', '8', '10', '12'], answer: '8', explanation: 'Each term is halved. 16 ÷ 2 = 8, 8 ÷ 2 = 4, 4 ÷ 2 = 2, 2 ÷ 2 = 1.' },

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
  { id: 'sr2',  type: 'spatial', difficulty: 1, question: 'You are facing North.\nYou turn 90° clockwise.\nThen turn 180° clockwise.\n\nWhich direction are you facing?', options: ['North', 'South', 'East', 'West'], answer: 'West', explanation: 'North → 90° clockwise = East → 180° clockwise = West.' },
  { id: 'sr3',  type: 'spatial', difficulty: 2, question: 'How many faces does a cube have?', options: ['4', '5', '6', '8'], answer: '6', explanation: 'A cube has 6 faces: top, bottom, front, back, left, right.' },
  { id: 'sr4',  type: 'spatial', difficulty: 2, question: 'A clock shows 3:00.\nWhat is the angle between\nthe hour and minute hands?', options: ['60°', '75°', '90°', '120°'], answer: '90°', explanation: 'At 3:00, the minute hand points to 12 and the hour hand to 3. That is exactly 90°.' },
  { id: 'sr5',  type: 'spatial', difficulty: 2, question: 'You are facing South.\nYou turn left twice (each turn is 90°).\n\nWhich direction are you now facing?', options: ['North', 'South', 'East', 'West'], answer: 'North', explanation: 'South → turn left 90° = East → turn left 90° = North.' },
  { id: 'sr6',  type: 'spatial', difficulty: 3, question: 'A 3×3×3 cube is painted red on all outside faces, then cut into 27 smaller cubes.\n\nHow many small cubes have NO red faces?', options: ['0', '1', '4', '8'], answer: '1', explanation: 'Only the single cube at the very centre has no painted faces.' },
  { id: 'sr7',  type: 'spatial', difficulty: 3, question: 'A rectangle is 8cm wide and 6cm tall.\nIt is cut diagonally from corner to corner.\n\nWhat is the length of the diagonal cut?', options: ['8cm', '9cm', '10cm', '12cm'], answer: '10cm', explanation: 'Pythagoras: √(8² + 6²) = √(64 + 36) = √100 = 10cm.' },
  { id: 'sr8',  type: 'spatial', difficulty: 3, question: 'How many edges does a cube have?', options: ['6', '8', '12', '16'], answer: '12', explanation: 'A cube has 12 edges: 4 on top, 4 on bottom, and 4 vertical edges connecting them.' },
  { id: 'sr9',  type: 'spatial', difficulty: 4, question: 'A shape has 5 faces, 5 vertices and 8 edges.\n\nWhat shape is it?', options: ['Cube', 'Triangular prism', 'Square pyramid', 'Tetrahedron'], answer: 'Square pyramid', explanation: 'A square pyramid has a square base (1 face) + 4 triangular faces = 5 faces, 5 vertices, 8 edges.' },
  { id: 'sr10', type: 'spatial', difficulty: 4, question: 'You walk 3 miles North,\nthen 4 miles East.\n\nHow far are you from your starting point in a straight line?', options: ['5 miles', '6 miles', '7 miles', '8 miles'], answer: '5 miles', explanation: 'Pythagoras: √(3² + 4²) = √(9 + 16) = √25 = 5 miles.' },
  { id: 'sr11', type: 'spatial', difficulty: 4, question: 'A cube is 3×3×3.\nSmaller 1×1×1 cubes are removed from all 8 corners.\n\nHow many small cubes remain?', options: ['18', '19', '20', '21'], answer: '19', explanation: '27 total − 8 corner cubes = 19 remaining.' },
  { id: 'sr12', type: 'spatial', difficulty: 5, question: 'A 3×3×3 cube is painted red on all outside faces, then cut into 27 smaller cubes.\n\nHow many small cubes have exactly 2 red faces?', options: ['8', '12', '16', '20'], answer: '12', explanation: 'Edge pieces (not corners) have exactly 2 painted faces. A cube has 12 edges, each with 1 non-corner edge piece = 12 cubes.' },
  { id: 'sr13', type: 'spatial', difficulty: 5, question: 'A clock shows 6:30.\nWhat is the angle between\nthe hour and minute hands?', options: ['0°', '4°', '10°', '15°'], answer: '15°', explanation: 'At 6:30 the minute hand is at 180°. The hour hand is halfway between 6 and 7: 180° + 15° = 195°. Difference = 15°.' },
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

  // For memory questions with a sequence to memorise — show for 5s then hide with pulse warning
  useEffect(() => {
    if (phase !== 'test' || !questions.length) return;
    const q = questions[idx];
    if (q.memoryReveal) {
      setMemoryRevealed(true);
      setMemoryPulsing(false);
      const pulseTimer = setTimeout(() => setMemoryPulsing(true), 3500);
      const hideTimer  = setTimeout(() => { setMemoryRevealed(false); setMemoryPulsing(false); }, 5000);
      return () => { clearTimeout(pulseTimer); clearTimeout(hideTimer); };
    } else {
      setMemoryRevealed(false);
      setMemoryPulsing(false);
    }
  }, [idx, phase, questions]);

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