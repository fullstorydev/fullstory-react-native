/** jsonErrorString returns a valid JSON string representation of the error. */
function jsonErrorString(e: Error): string {
  let errorString = 'Internal error: unable to determine what JSON error was';
  try {
    errorString = `${e}`;
    // Sanitize the error: alphanumeric and some punctuation only, be paranoid here
    errorString = errorString.replace(/[^a-zA-Z0-9.:!, ]/g, '_');
  } catch (e2) {
    // Give up, use the unknown one
  }
  return `"${errorString}"`;
}

interface StringifyContext {
  tokens: string[];
  opath: any[];
  cyclic: boolean;
}

/**
 * safeStringify
 *
 * safeStringify is defined to NEVER BE ABLE TO THROW. It is meant to stringify
 * unstructured data containing a mix of objects, strings, and primitives like in
 * console log arguments. It must return a string that can be validly JSON.parsed() by
 * our playback client. It tries it's best to mirror what console.log() would print
 * in the JS console.
 */
export function safeStringify(o: any, maxChars: number = 1024): string {
  try {
    const state: StringifyContext = {
      tokens: [],
      opath: [],
      cyclic: isCyclic(o, maxChars / 4),
    };
    stringifyAux(o, maxChars, 0, state);
    return state.tokens.join('');
  } catch (e) {
    return jsonErrorString(e as unknown as Error);
  }
}

// NOTE: May return false negative, since search is limited
// Assumed to be called *after* getRealJSONObject
function isCyclic(o: any, maxProps: number): boolean {
  let count = 0;
  try {
    JSON.stringify(o, (_key, value) => {
      if (count++ > maxProps) throw 'break';
      if (typeof value !== 'object') return undefined;
      return value;
    });
  } catch (e) {
    if (e === 'break') return false;
    // No cycle detected before limit reached
    else return true;
  }
  return false;
}

const dateString = (x: Date) => (isNaN(x as any) ? 'Invalid Date' : x.toUTCString());
const truncate = (s: string, len: number, end = '...') => {
  if (s.length <= len) return s;
  if (s.length <= end.length || len <= end.length) return s.substring(0, len);
  return s.substring(0, len - end.length) + end;
};

// Returns the number of characters in the stringified result
function stringifyAux(o: any, maxChars: number, depth: number, ctx: StringifyContext): number {
  if (maxChars < 1) return 0;

  /**
   * 1. Base cases: primitives and special cases like dates
   *
   *    - Strings and primitives like true, false, null become valid JSON
   *    - undefined becomes JSON.stringify('undefined') => '"undefined"'
   *    - non objects like functions and symbols get ignored
   *    - Arrays and Objects are sent along to the next steps.
   */
  const replacement = getStringReplacement(o);

  if (replacement !== undefined) {
    // Convert to string or quote/escape string
    const token = primitiveToJSONString(replacement, maxChars);
    if (typeof token === 'string' && token.length <= maxChars) {
      ctx.tokens.push(token);
      return token.length;
    } else {
      return 0;
    }
  }

  /**
   * 2. Cycles
   *
   *    If an object is determined to be a cyclical reference, we replace it with a
   *    special string:
   *
   *    `<Cycle to ancestor #X>`
   */
  if (ctx.cyclic) {
    ctx.opath.splice(depth);
    const previousDepth = ctx.opath.lastIndexOf(o);
    if (previousDepth > -1) {
      let s = `<Cycle to ancestor #${depth - previousDepth - 1}>`;
      s = `"${truncate(s, maxChars - 2)}"`;
      ctx.tokens.push(s);
      return s.length;
    }
    ctx.opath.push(o);
  }

  /**
   * 3. Recursive cases
   *
   *    We recursively parse arrays and objects pushing each piece
   *    into ctx.tokens to be `.join('')`'d for the end result later.
   */

  let charsRemaining = maxChars;
  const pushToken = (s: string): boolean => {
    if (charsRemaining >= s.length) {
      charsRemaining -= s.length;
      ctx.tokens.push(s);
      return true;
    }
    return false;
  };

  const overwriteTrailingComma = (s: string) => {
    // s should always be a single character
    const last = ctx.tokens.length - 1;
    if (ctx.tokens[last] === ',') {
      ctx.tokens[last] = s;
    } else {
      pushToken(s);
    }
  };
  if (charsRemaining < 2) return 0; // Ensure space for closing } or ]

  if (Array.isArray(o)) {
    pushToken('[');
    for (let i = 0; i < o.length && charsRemaining > 0; i++) {
      const n = stringifyAux(o[i], charsRemaining - 1, depth + 1, ctx);
      charsRemaining -= n;
      if (n === 0 && !pushToken('null')) break;
      pushToken(',');
    }
    overwriteTrailingComma(']');
  } else {
    pushToken('{');
    const oKeys = Object.keys(o);
    for (let i = 0; i < oKeys.length && charsRemaining > 0; i++) {
      const key = oKeys[i];
      const value = o[key];
      if (!pushToken(`"${key}":`)) break;
      const n = stringifyAux(value, charsRemaining - 1, depth + 1, ctx);
      if (n === 0) {
        ctx.tokens.pop(); // Don't insert a trailing key
        break;
      }
      charsRemaining -= n;
      pushToken(',');
    }
    overwriteTrailingComma('}');
  }

  return maxChars === Infinity ? 1 : maxChars - charsRemaining;
}

function getStringReplacement(o: any): string | undefined {
  switch (true) {
    case isDate(o):
      return dateString(o);
    case o === undefined:
      return 'undefined';
    case typeof o !== 'object' || o == null:
      return o;
    case o instanceof Error:
      return [o.toString(), o.stack].filter(Boolean).join(',');
  }
  return undefined;
}

function primitiveToJSONString(s: string, maxChars: number): string | void {
  // Convert to string or quote/escape string
  const token = JSON.stringify(s);
  if (token && token[0] === '"') {
    return truncate(token, maxChars, '..."');
  }
  return token;
}

function isDate(o: any): boolean {
  return !!(o && o.constructor === Date);
}
