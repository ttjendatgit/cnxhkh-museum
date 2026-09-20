# Final Room Puzzle Game (standalone module)

A self-contained multiplayer puzzle for the museum's closing room. This
folder imports **nothing** from `src/museum/`; the museum reaches it only
through the integration layer in `src/museum/final-room/`.

## How it is wired into the museum

```
src/museum/final-room/
  finalStation.ts          Station position/footprint/trigger radius (shared by 3D + collider)
  FinalGameStation.tsx     3D podium in the Final Room + proximity reporting
  useFinalGameStore.ts     nearby / open / view state (separate from the artifact store)
  FinalGameOverlay.tsx     "Nhấn E để bắt đầu thử thách" prompt, E/Esc, hosts the game
  FinalGameScreens.tsx     the ONE file that imports this module (lazy-loaded)
  AdminGate.tsx            PIN gate for the operator console
  resolveArtifactHint.ts   artifact id -> {title, room} hint for questions
  FinalGameStandalone.tsx / finalGameRoute.ts   ?game=admin|leaderboard|player pages
```

Three separate screens — the crossword is **only** on the player's own screen:

- **Player (phone)**: `PlayerScreen` — each team plays independently. It types
  its name once, then gets the crossword grid, the current question ("CÂU 05/13",
  text, artifact hint) and the answer box. Every correct answer updates only that
  team's own node. Open it full-page at `/?game=player`; in the museum, walking to
  the podium and pressing **E** opens the same screen as an overlay (movement is
  frozen while it is open; Esc closes it). On a phone the question comes first and
  the crossword below; on a wide screen the crossword is on the left.
- **Large LED screen**: `LeaderboardScreen` (the Final Room's wall screen, and
  `/?game=leaderboard` for a projector) — a public competition board only: game
  title, ranking of teams, score, solved-questions count and completion status,
  updating in realtime. It never shows questions or the crossword.
- **Operator**: in the overlay, the **Điều hành** button opens the admin
  console (Start / Pause / Resume / End / Reset all teams, and the list of
  participating teams). Or open `/?game=admin` on the operator's own device.
- **Room id**: every screen of one competition must use the same room id, taken
  from `?room=<id>` in the URL, else `VITE_FINAL_GAME_ROOM_ID`, else `main`
  (letters, digits, `-`, `_`). Different ids are independent competitions.
- The game and the Firebase SDK are a separate lazy chunk, fetched the first
  time someone opens the game.

### Operator PIN
Set `VITE_FINAL_GAME_ADMIN_PIN` in `.env.local` to require a PIN (asked once
per browser session).
- No PIN + mock backend (local dev): console is open, so the flow is testable.
- No PIN + real Firebase: console stays **locked**.

This is a client-side gate against curious players, not real security (the
value ships in the bundle). To truly protect Start/End/Reset, use Firebase
Auth + database rules.

## Questions (`data/questions.ts`)

```ts
{
  id: number
  question: string
  answer: string
  alternativeAnswers?: string[]   // accepted variants, e.g. "02/09/1945"
  image?: string                  // optional illustration (Cloudinary URL)
  relatedArtifactId?: string      // museum artifact id -> shown as a "Gợi ý" hint
  rewardLetter: string            // the keyword letter this question awards
}
```

There are exactly 13 questions; `rewardLetter` at index *i* must equal letter
*i* of `FINAL_KEYWORD` ("NHÂN DÂN LÀM CHỦ"). The game is a crossword: each
answer is one horizontal row, and the rows cross one vertical keyword column at
the answer's `rewardLetter`, so **every answer must contain its `rewardLetter`
exactly, diacritics included** (e.g. "Hội đồng nhân dân" for Â). Both rules are
checked at load time and logged loudly if broken; the grid lays itself out from
the answers. Typed answers are compared without accents or case. The wording
follows the museum's artifacts and stays within "up to 2021" — have it
fact-checked before an event. The module never reads museum data: the museum
passes a `resolveArtifact` function (see `resolveArtifactHint.ts`) to `PlayerScreen`.

## Game rules

- **Phones.** The player screen stacks: title, status bar (one compact line, pinned to the top),
  crossword, the chosen question with its answer and keyword boxes, then the question list. The
  crossword keeps 24px cells (readable accents) and scrolls sideways inside its own panel with the row
  numbers pinned; tapping a row or a list button selects the question and scrolls the question panel
  into view. Fields and buttons are >= 48px; the answer box asks the keyboard for a "Go" key and is
  scrolled above the keyboard when focused (`hooks/useKeyboardInset.ts`). The museum's touch controls
  (joystick, swipe-to-look, [TƯƠNG TÁC]) live in `src/ui/TouchControls.tsx`.
- **One team = one device.** There is no "join an existing team". A group types a team name
  (button "Bắt đầu"); a name another team already uses — compared without case or extra spaces,
  so "Nhóm 1" = "nhóm 1" = "Nhóm   1" — is refused with "Tên đội đã tồn tại. Vui lòng chọn tên
  khác." (`services/teamName.ts`, checked in `joinGame` against the live teams right before
  writing). Teams can only be created while the room is `waiting`. The `teamId` is kept in
  localStorage; on reload the team is looked up again and restored, never re-created.
- **Questions are free-choice**: a player picks any of the 13 by clicking its row number on the
  crossword (on a phone also from the question list under it) and may skip and come back.
  A wrong answer shows "Chưa chính xác. Hãy thử lại!" and changes nothing. A correct one shows
  "Chính xác! +10 điểm" (score, `solvedCount` and `solvedQuestions` are written at once), holds
  for ~1.4 s, then moves to the next *unsolved* question after the one just answered (wrapping
  to the first unsolved; `services/questionProgress.ts`). With all 13 solved the keyword step remains.
- The player screen always shows game time (from the admin's start, minus paused time, so a
  reload never resets it; frozen with "Tạm dừng - thời gian được bảo lưu" while paused), score and
  solved/13.
- The crossword's intersection letters are the only hints toward the keyword; the
  keyword ("NHÂN DÂN LÀM CHỦ") is never shown anywhere in the UI, not even on the
  finish screen (`FINAL_KEYWORD` is only used to check attempts).
- A team may try the keyword at any time. A correct keyword sets `keywordCorrect`
  (and adds the keyword bonus) but does **not** finish the game; while questions
  remain the player sees "Đã tìm ra từ khóa. Hãy hoàn thành toàn bộ câu hỏi để chiến thắng."
- **Victory** = all 13 questions solved **and** the keyword correct, in either order.
  It sets `finished`, `finishedAt` and `completionTime` (game start to victory, minus
  paused time) in the same write as the answer or keyword that completed it.
- **Ranking** has two modes (`services/scoring.ts`):
  - *During the game* (`playing` / `paused`): every team is ranked by higher score, then more
    questions solved, then earlier `joinedAt` (`rankTeams`).
  - *After the game* (`finished`): a **Top 3** section of winners (`rankWinners`). A winner has
    all 13 questions solved, `keywordCorrect` and `finished`; they are ordered by higher score,
    then shorter `completionTime`, then earlier `joinedAt`. Teams outside the Top 3 stay listed
    below with their normal `rankTeams` ranking. Tests: `npm test` (`services/scoring.test.ts`).
- Scoring is in `services/scoring.ts`: 10 points per question, +100 for the keyword.

## Backends: mock <-> Firebase

Everything talks to `services/gameService.ts`, which picks a backend:

- `firebaseBackend.ts` when the `VITE_FIREBASE_*` env vars are set,
- `mockBackend.ts` otherwise.

No code change is needed to switch — set the env vars and rebuild. Both
backends return identical shapes (`firebaseBackend.ts` normalizes what Realtime
Database drops on write: `null` fields and empty arrays).

The mock keeps its state in `localStorage` and syncs between tabs of the
**same browser**, so player / admin / leaderboard tabs can be tested together
locally. It does not sync across devices — that is what Firebase is for.

### Firebase setup
1. Create a Firebase project with a **Realtime Database** (not Firestore).
2. Set in `.env.local` (never commit): `VITE_FIREBASE_API_KEY`,
   `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_DATABASE_URL`,
   `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
   `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
3. Database rules for `/gameRooms`: lock these down before a public event
   (e.g. admin-only writes to `status`, players write only their own team) — see
   the starting rules below.

### Database structure
```
gameRooms/{roomId}
  status: 'waiting' | 'playing' | 'paused' | 'finished'
  timing: { startedAt, pausedAt, totalPausedMs, endedAt }      // pause / completion clock
  teams/{teamId}:
    name, score, solvedCount                                    // what the leaderboard shows
    keywordCorrect, finished, finishedAt, completionTime        // finishedAt / completionTime absent until victory
    joinedAt, solvedQuestions{ "1": true, … }, collectedLetters[], keywordAttempt
                                                                // the team's own crossword progress
```
Older nodes that only have `completedAt` are still read as finished. The layout and the
mapping to/from the module's records live in `services/roomSchema.ts` (pure, no
Firebase import), so the mock and Firebase backends behave identically.

- A player's answer writes only `gameRooms/{roomId}/teams/{theirTeamId}`.
- The admin writes `status` and `timing` (and resets teams).
- The leaderboard and the admin subscribe to `teams` and update the instant any
  team changes. There is no separately-written `leaderboard` path: every client
  ranks `teams` via `services/scoring.ts#rankTeams()` (see Game rules).

Starting rules (tighten before a public event; without Firebase Auth these only
constrain the shape and the paths, not *who* writes):
```json
{
  "rules": {
    "gameRooms": {
      "$roomId": {
        ".read": true,
        "status": { ".write": true, ".validate": "newData.isString()" },
        "timing": { ".write": true },
        "teams": { "$teamId": { ".write": true, ".validate": "newData.hasChildren(['name', 'score', 'solvedCount', 'joinedAt'])" } }
      }
    }
  }
}
```
Real protection (admin-only `status`/`timing`, a team writing only its own node)
needs Firebase Auth.

## Folder layout
```
types.ts  data/(questions, statusMessages)  services/(gameService, scoring, room,
roomSchema, firebase, firebaseBackend, mockBackend, gameBackend)  hooks/
components/  FinalGame/(CrosswordBoard, QuestionPanel, AnswerInput, ResultScreen, ...)
screens/  styles/  index.ts
```
