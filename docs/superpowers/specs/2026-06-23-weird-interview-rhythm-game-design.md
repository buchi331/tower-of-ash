# Weird Interview Rhythm Game Design

- Date: 2026-06-23
- Working title: Weird Interview
- Genre: one-button rhythm comedy game
- Platform: browser, Vite + React + TypeScript

## Vision

Build a short, funny rhythm game inspired by the design principles of rhythm comedy games: simple input, strange characters, crisp timing, and amusing failure reactions. The player should understand the rules within seconds and want to retry immediately after a 30-45 second run.

The game must be original. It must not use Nintendo names, characters, minigames, music, sound effects, layouts, or direct visual references. The goal is to capture the broad feel of a one-button rhythm comedy game, not reproduce an existing work.

## Core Game

The player is in a strange job interview. An interviewer speaks or gestures on the beat. The player responds with a single input at the right time, using Space, Enter, click, or tap.

The main pattern is:

1. The interviewer gives a cue.
2. One beat later, the response window opens.
3. The player presses once.
4. The game scores the input as Perfect, Good, or Miss.
5. The characters react immediately.

Each play session lasts about 30-45 seconds. The prototype should include one stage with a fixed rhythm script.

## Feel

The game should feel silly, snappy, and readable.

- The interviewer should look overly serious.
- The player character should look nervous but enthusiastic.
- Perfect hits should feel satisfying through sound, squash/stretch motion, and a small visual pop.
- Misses should be funny through awkward silence, stare reactions, or a wrong answer bubble.
- Failure should be amusing rather than punishing.

The visuals should be simple enough to implement in CSS and React. The humor should come from timing, expressions, and short text snippets.

## Controls

Supported inputs:

- Keyboard: Space and Enter
- Pointer: click and tap anywhere on the play area

Input is only judged during the playing state. Repeated input within the same target window should count once.

## Timing

The prototype uses a fixed BPM of 120.

At 120 BPM:

- One beat is 500 ms.
- Perfect window is +/- 80 ms from target time.
- Good window is +/- 150 ms from target time.
- Inputs outside the Good window are Miss.
- If the player does not press before the window expires, that target is Miss.

The rhythm script should include about 24 targets, enough for a short first stage. Most cues should use a simple call-and-response pattern. A few late-stage targets may add spacing variation, but the prototype should avoid complicated syncopation.

## Stage Script

The first stage should be deterministic and data-driven.

Each target should include:

- `id`: stable string
- `cueBeat`: beat when the interviewer cue appears
- `targetBeat`: beat when the player should respond
- `cueText`: short interviewer text
- `successText`: short text shown on a hit
- `missText`: short text shown on a miss

Example beats:

- cue at beat 4, target at beat 5
- cue at beat 6, target at beat 7
- cue at beat 8, target at beat 9
- cue at beat 12, target at beat 13

The script should leave a short intro before the first judged input and a short ending before the results screen.

## Scoring

Each target gives:

- Perfect: 2 points
- Good: 1 point
- Miss: 0 points

The result screen shows:

- Perfect count
- Good count
- Miss count
- Total score
- Rank

Ranks:

- S: 90% or higher of max score
- A: 75% or higher
- B: 55% or higher
- C: below 55%

The result screen should include a retry button and a return-to-title button.

## Screens

### Title

Shows the working title and the odd interview setup. The primary action starts the stage. The screen should be usable on desktop and mobile.

### Playing

Shows a simple interview room:

- interviewer on one side
- player character on the other
- desk between them
- cue or reaction text near the interviewer
- judgment text near the player
- small beat indicator or pulse
- progress indicator

The playing screen should avoid dense instructions. A compact hint such as "Space / Tap" is acceptable.

### Result

Shows the rank and performance counts. It should make retrying the obvious next action.

## Architecture

The implementation should replace the current app surface with a new standalone rhythm game while keeping the Vite + React + TypeScript setup.

Recommended units:

- `src/rhythm/types.ts`: shared types for stage events, judgments, game phase, and result summary.
- `src/rhythm/stage.ts`: fixed BPM and stage script data.
- `src/rhythm/timing.ts`: pure functions for beat-to-time conversion, input judgment, and result ranking.
- `src/rhythm/timing.test.ts`: unit tests for timing and ranking.
- `src/audio/useRhythmAudio.ts`: Web Audio helper for generated cues and feedback sounds.
- `src/App.tsx`: top-level game state and screen routing.
- `src/styles.css`: full visual treatment for title, playing, character reactions, and result.

The first version should not add external dependencies.

## Audio

Use Web Audio generated tones for the prototype.

Required sounds:

- beat tick or soft metronome cue
- interviewer cue sound
- Perfect hit sound
- Good hit sound
- Miss sound
- result sound

Audio should start only after a user gesture, because browsers block autoplay. If audio cannot start, the game should still be playable visually.

## Error Handling

If Web Audio is unavailable, the game continues silently.

If tab visibility changes during play, the simplest acceptable behavior is to keep the game running from the same monotonic clock and allow the result to reflect missed inputs. A later version can pause and resume.

## Testing

Unit tests should cover:

- beat-to-time conversion at 120 BPM
- Perfect, Good, and Miss timing windows
- duplicate input prevention for the same target
- missed target detection
- rank calculation

Manual verification should cover:

- title to play to result flow
- Space and click/tap input
- visible character reactions for hit and miss
- retry flow
- responsive layout at mobile and desktop widths

## Out Of Scope

The prototype does not include:

- licensed music
- sampled voice acting
- multiple stages
- remix mode
- online leaderboard
- share image generation
- asset downloads
- direct references to existing rhythm game characters, stages, songs, or UI

These can be considered after the first playable version feels good.

## Success Criteria

The prototype is successful when:

- a new player understands the interaction within one or two cues
- a full run takes under one minute
- hit feedback feels immediate
- misses are readable and funny
- the result screen makes retrying natural
- the app builds and passes timing tests
