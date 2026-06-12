# Gemara Flashcards & Quiz Platform — Features

## Masechtos Supported

| Masechta | Dafim | Prakim | Images |
|----------|-------|--------|--------|
| Yevamos (יבמות) | 121 (Daf 2–122) | 16 | Yes |
| Succah (סוכה) | 55 (Daf 2–56) | 5 | Yes |

Each daf includes: Hebrew letter, siman (English mnemonic), 3 key points (Hebrew + English), mnemonic story, and a Zichru illustration.

---

## Quiz & Study Modes (12 Total)

The mode picker is split into two sections: **📖 Learn It** (Guided Lessons, Memory Chain, Story Detective, Sugya Simulator, Flashcards) and **🏆 Test Yourself** (the quiz/game modes).

### Guided Lessons (Learn It)
Teaches new dafim from scratch, 3 per lesson, Duolingo-style:
- **Lesson picker** — masechta/perek broken into lessons of 3 dafim, with learned status (✓) and a START marker on the next unfinished lesson
- **Per daf, 4 teaching steps**: Letter Hook (daf number → Hebrew letter → siman, with illustration), Story (read the mnemonic story alongside the picture), Points (the 3 points revealed one at a time by tapping), Quick Check (instant 2-choice question with feedback)
- **Mini quiz** after each lesson: ~6 mixed questions (daf→siman, siman→daf, point→daf) with wrong answers requeued until answered correctly
- **Learned tracking**: completed dafim saved per masechta in localStorage (`gemara-learned-{masechta}`)

### Memory Chain (Learn It)
Builds the daf-order chain one link at a time — the core Zichru skill:
- Teaches each daf (letter → siman hook, illustration, story), then you rebuild the chain of the last 6 dafim in order by tapping simanim
- Rolling recall window keeps it playable across a whole masechta
- Tracks links forged, mistakes, and recall accuracy

### Story Detective (Learn It)
Trains the story→points connection:
- Shows the illustration and full mnemonic story as the "clue"
- 6 point options (3 real + 3 plausible distractors, preferring the same perek) — find the 3 hidden in the story
- Multi-select then check: green/red feedback, missed points highlighted
- Tracks clues found and accuracy across the session

### 1. Sugya Simulator
Interactive journey through the masechta with three views:
- **Map View** — Visual grid of all dafim organized by perek, tap any daf to start
- **Journey Mode** — 3-act walkthrough per daf: scene setting with image/story, interactive point reveals (challenge/thinking/revealed modes), and a connections summary showing related dafim via shared concepts
- **Concept Web** — Auto-extracted concepts (Yibum, Chalitzah, Ervah, etc.) displayed as expandable cards showing which dafim share each concept, with cross-reference navigation

Includes AI Chavrusa integration (OpenAI) with three modes:
- Explain It To Me (depth-selectable: simple/medium/deep)
- Ask Anything (free-form Q&A with chat history)
- My Story (personalized mnemonic generator)

### 2. Flashcards
- Flip card: front shows daf number + siman, back reveals 3 points + siman story
- Illustration always visible alongside the card
- Desktop: side-by-side layout (image + story left, flip card right)
- Mobile: stacked layout
- Self-assessment: Forgot / Partial / Knew It
- 3 study modes: In Order, Shuffled, Weak Cards First
- Session summary with stats

### 3. Multiple Choice
Six auto-generated question types:
- What's the Siman? (daf → siman)
- Which Daf? (siman → daf)
- Pick the Point (which topic belongs to this daf?)
- Point to Daf (given a topic, which daf?)
- Odd One Out (which point does NOT belong?)
- Complete the Set (2 of 3 points shown, pick the missing one)

Mastery-based: wrong answers requeue 3–6 positions ahead. Tracks first-try accuracy and streaks.

### 4. Identify the Picture
- Shows the Zichru illustration with daf label/siman header cropped off (so the answer isn't visible)
- Pick the correct daf from 4 choices (2x2 grid)
- Mastery-based with requeuing

### 5. What Daf Is This?
- Displays a topic (Hebrew + English) from a random daf
- Pick which daf it belongs to from 4 choices
- Compact layout optimized for desktop (no scrolling needed)
- Inline feedback bar

### 6. True or False
Four statement types per daf:
- Correct siman + correct point (TRUE)
- Correct siman + wrong point from another daf (FALSE)
- Wrong siman assigned to correct daf (FALSE)
- Correct siman for correct daf (TRUE)

Large TRUE/FALSE buttons. Mastery-based with streak tracking.

### 7. Speed Round
- 60-second timed challenge
- 2x2 answer grid for fast tapping
- Screen flashes green/red on correct/wrong
- Live score counter and countdown timer
- Timer bar turns red in the last 10 seconds
- Results: correct count, wrong count, accuracy %

### 8. Matching
- Pair daf numbers with their simanim
- Two columns: daf numbers (left) vs simanim (right)
- Batches of 6 for playability
- Shake animation on wrong match, green fade on correct
- Multi-round with progress tracking
- Final results: accuracy % and total pairs

### 9. Order the Simanim
- Scrambled simanim displayed in a grid
- Tap in correct daf order to build the chain
- Already-placed chain shown at top with animated placeholder for next
- Shake animation on wrong pick
- Tracks total mistakes
- Results: dafim placed, mistake count

---

## Scoping

All modes support:
- **All Dafim** — full masechta
- **By Perek** — individual chapter with progress dots

---

## Mastery & Progress Tracking

- **Ratings**: Knew (green) / Partial (gold) / Forgot (red)
- **Per-masechta localStorage** with separate keys
- **Progress bar** on home screen: colored segments showing knew/partial/forgot ratio
- **Perek cards** show reviewed count and mastery dots per daf
- **Quiz mastery**: wrong answers requeue into the session (3–6 positions ahead)
- **Streak tracking** displayed during quizzes (visible at 2+)
- **First-try accuracy** tracked and shown on results screen
- **Reset progress** option with confirmation

---

## Images

- **Flashcard images**: Full illustration with daf label + siman header (`/images/{masechta}/daf-{N}.jpg`)
- **Quiz images**: Header cropped off so the answer isn't visible (`/images/{masechta}-quiz/daf-{N}.jpg`)
- Extracted from Zichru PDFs at 150 DPI, quality 65
- Lazy loaded

---

## UI & Design

- Duolingo-inspired button style: `border-2 border-b-4` with press effect
- Color system: navy primary (#1a3a5c), green success, gold warning, red error
- Animations: fade-in-up, pop-in, slide-up, shake, bounce-in, pulse, shimmer
- Staggered list animations
- Fully responsive (mobile-first, desktop side-by-side where appropriate)
- RTL support for Hebrew text

---

## Navigation

- **Home page** (/) → Rashi Quiz (parshat quizzes) with link to Gemara section
- **/gemara** → Masechta selector → Perek list (or All Dafim) → Game type picker → Active session
- Back navigation at each level
