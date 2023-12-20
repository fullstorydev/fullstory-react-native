import { safeStringify } from '../logging/safeStringify';

const LARGE_MAX_CHARS = 10000; // Arbitrarily large.

const expectValidJSON = (str: string) => expect(() => JSON.parse(str)).not.toThrowError();

describe('safeStringify', () => {
  it('handles character limits', () => {
    const a1 = [1, 2, 3, [4, 5, [6, 7, 8], 9], 10];

    {
      // No truncation
      const act = safeStringify(a1, LARGE_MAX_CHARS);
      expect(act).toBe('[1,2,3,[4,5,[6,7,8],9],10]');
      expectValidJSON(act);
    }

    {
      // truncate an array
      const act = safeStringify(a1, 10);
      expect(act).toBe('[1,2,3,[]]');
      expectValidJSON(act);
    }

    {
      // truncate on nested array
      const act = safeStringify(a1, 16);
      expect(act).toBe('[1,2,3,[4,5,[]]]');
      expectValidJSON(act);
    }

    {
      // truncate really short array (no trailing comma!)
      const act = safeStringify(a1, 4); // Test for trailing comma
      expect(act).toBe('[1]');
      expectValidJSON(act);
    }

    {
      // no truncate regular object
      const o1 = { a: 1, b: 2, c: null, d: undefined, e: 'asdf' };
      const act = safeStringify(o1, LARGE_MAX_CHARS);
      expect(act).toBe('{"a":1,"b":2,"c":null,"d":"undefined","e":"asdf"}');
      expectValidJSON(act);
    }

    const o2 = { a: 1, b: 2, c: null, d: [1, 2, ['three'], [], {}, []], e: 'asdf' };

    {
      // truncation on regular object
      const act = safeStringify(o2, 13);
      expect(act).toBe('{"a":1,"b":2}');
      expectValidJSON(act);
    }

    {
      // Check we don't include the key when truncating a value
      const act = safeStringify(o2, 15);
      expect(act).toBe('{"a":1,"b":2}');
      expectValidJSON(act);
    }

    {
      // truncate nested object
      const act = safeStringify(o2, 45);
      expect(act).toBe('{"a":1,"b":2,"c":null,"d":[1,2,["three"],[]]}');
      expectValidJSON(act);
    }

    // Truncate strings
    const longStringWithLineBreaks = `
It was a dark and stormy night; the rain fell in torrents, except at occasional
intervals, when it was checked by a violent gust of wind which swept up the
streets (for it is in London that our scene lies), rattling along the housetops,
and fiercely agitating the scanty flame of the lamps that struggled against the
darkness.`;

    {
      // ellipses on truncated string
      const act = safeStringify(longStringWithLineBreaks, 20);
      expect(act).toBe('"\\nIt was a dark..."');
      expectValidJSON(act);
    }

    {
      // ellipses on truncated string in object
      const act = safeStringify({ openingSentence: longStringWithLineBreaks }, 40);
      expect(act).toBe('{"openingSentence":"\\nIt was a dark..."}');
      expectValidJSON(act);
    }

    // Properly truncate dates
    const date = new Date(0);
    expect(safeStringify(date, LARGE_MAX_CHARS)).toBe('"Thu, 01 Jan 1970 00:00:00 GMT"');
    expect(safeStringify(date, 20)).toBe('"Thu, 01 Jan 197..."');
  });

  it('handles primitives', () => {
    expect(safeStringify(true, LARGE_MAX_CHARS)).toBe('true');
    expect(safeStringify(false, LARGE_MAX_CHARS)).toBe('false');
    expect(safeStringify(12345, LARGE_MAX_CHARS)).toBe('12345');
    expect(safeStringify(-12345, LARGE_MAX_CHARS)).toBe('-12345');

    const fn = function asdf() {
      return 12345;
    };
    expect(safeStringify(fn, LARGE_MAX_CHARS)).toBe('');
    expect(safeStringify([fn, null, 'asdf'], LARGE_MAX_CHARS)).toBe('[null,null,"asdf"]');
  });

  it('handles stringify log message error', () => {
    const simpleError = new Error('zoinks!');

    {
      simpleError['stack'] = undefined; // Pretend stack isn't supported
      expect(safeStringify(simpleError, LARGE_MAX_CHARS)).toBe('"Error: zoinks!"');
    }

    {
      // if stack is available, it should include the name, message, and stack
      simpleError['stack'] = 'Scooby-Doo - where are you?';
      expect(safeStringify(simpleError, LARGE_MAX_CHARS)).toBe(
        '"Error: zoinks!,Scooby-Doo - where are you?"',
      );
    }

    {
      // Pretend stack IS supported (and its format predictable)
      // but if name and message are empty, only stack should be returned
      simpleError['stack'] = 'Scooby-Doo - where are you?';
      simpleError['name'] = '';
      simpleError['message'] = '';
      // Earlier versions of FF still show "Error" in toString even if you've randomly nulled out
      // "name" and "message". Let's capture that here.
      expect(safeStringify(simpleError, LARGE_MAX_CHARS)).toBe(
        simpleError.toString()
          ? '"Error,Scooby-Doo - where are you?"' // <- Firefox <= 33
          : '"Scooby-Doo - where are you?"', // <- everyone else 🤷
      );
    }

    const specificError = new TypeError('jinkies!');
    specificError['stack'] = undefined;
    expect(safeStringify(specificError, LARGE_MAX_CHARS)).toBe('"TypeError: jinkies!"');
  });

  it('handles stringify log message cycle detection', () => {
    {
      // Cyclical array
      const arr: any[] = [];
      arr.push(arr);
      const act = safeStringify(arr, LARGE_MAX_CHARS);
      expect(act).toBe('["<Cycle to ancestor #0>"]');
      expectValidJSON(act);
    }

    {
      // Cyclical Object
      const cycle: any = { a: null };
      cycle.a = cycle;
      const act = safeStringify(cycle, LARGE_MAX_CHARS);
      expect(act).toBe('{"a":"<Cycle to ancestor #0>"}');
      expectValidJSON(act);
    }

    {
      // Deeply nested cyclical object
      const deeper = { a: { b: { c: { d: {} } } } };
      deeper.a.b.c.d = deeper.a.b;
      const act = safeStringify(deeper, LARGE_MAX_CHARS);
      expect(act).toBe('{"a":{"b":{"c":{"d":"<Cycle to ancestor #1>"}}}}');
    }
  });
});
