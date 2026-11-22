// Entry point for app code. `server-only` makes the build fail if a client
// component ever imports this, so the question bank can't leak to the browser.
import 'server-only';

export { checkAnswer, createVoyage, parseAnswerRequest } from './voyage-service';
