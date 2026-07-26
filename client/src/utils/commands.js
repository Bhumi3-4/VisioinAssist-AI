/**
 * commands.js
 * The full voice command vocabulary. Each action has multiple phrase
 * variants so natural speech still matches (e.g. "hey what do you see"
 * still matches "what do you see" via substring check).
 *
 * Adding a new command later = adding one entry here, nothing else
 * needs to change in the matching logic.
 */
export const COMMANDS = [
  { action: 'detect', phrases: ["what's around me", 'whats around me', 'what do you see', 'describe surroundings'] },
  { action: 'read', phrases: ['read this', 'read label', 'read text'] },
  { action: 'readScreen', phrases: ['read the screen', 'read screen text', 'read my screen'] },
  { action: 'repeat', phrases: ['repeat', 'say again'] },
  { action: 'stop', phrases: ['stop', 'cancel', 'be quiet', 'quiet'] },
  { action: 'zoomIn', phrases: ['zoom in'] },
  { action: 'zoomOut', phrases: ['zoom out'] },
  { action: 'textBigger', phrases: ['bigger text', 'increase text size', 'larger text'] },
  { action: 'textSmaller', phrases: ['smaller text', 'decrease text size'] },
  { action: 'obstacleOn', phrases: ['watch for obstacles', 'start obstacle watch', 'obstacle watch on'] },
  { action: 'obstacleOff', phrases: ['stop obstacle watch', 'obstacle watch off'] },
  { action: 'help', phrases: ['help', 'what can i say'] },
]

/**
 * matchCommand
 * Lowercases the transcript and checks it against every phrase variant.
 * Returns the matched action string, or null if nothing matched.
 */
export function matchCommand(transcript) {
  const text = transcript.toLowerCase()
  for (const command of COMMANDS) {
    if (command.phrases.some((phrase) => text.includes(phrase))) {
      return command.action
    }
  }
  return null
}