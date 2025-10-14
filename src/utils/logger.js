// Level-based logger to reduce console noise.
// Control with environment variable VITE_LOG_LEVEL (error,warn,info,debug).
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const envLevel = (import.meta.env.VITE_LOG_LEVEL || '').toLowerCase();
// Default to 'warn' to keep console clean. Set VITE_LOG_LEVEL=debug or info to see more.
const DEFAULT_LEVEL = 'warn';
const currentLevelName = envLevel && LEVELS[envLevel] !== undefined ? envLevel : DEFAULT_LEVEL;
const currentLevel = LEVELS[currentLevelName];

function safeFormat(arg) {
  if (typeof arg === 'string') return arg;
  try {
    return JSON.stringify(arg, null, 2);
  } catch (e) {
    try {
      return String(arg);
    } catch (e2) {
      return '[unserializable]';
    }
  }
}

function output(levelName, consoleFn, args) {
  if (LEVELS[levelName] <= currentLevel) {
    const prefix = `[${levelName}]`;
    const formatted = args.map(a => safeFormat(a));
    consoleFn(prefix, ...formatted);
  }
}

export default {
  error: (...args) => output('error', console.error, args),
  warn: (...args) => output('warn', console.warn, args),
  info: (...args) => output('info', console.info, args),
  debug: (...args) => output('debug', console.debug || console.log, args),
};
