import * as FS from 'node:fs/promises';

const loadFile = async () => {
  const raw = await FS.readFile('data/saucy.txt', 'utf8');

  // we lose some flavour in terms of intentional double new lines here
  const lines = [];
  let inHeader = true;
  for (const rawLine of raw.split(/\r\n|\n/)) {
    // drop the project gutenberg header
    if (inHeader && rawLine.startsWith('***')) {
      inHeader = false;
      continue;
    }
    if (inHeader) {
      continue;
    }
    // drop the footer too
    if (rawLine.startsWith('***')) {
      break;
    }

    lines.push(rawLine);
  }

  return lines;
};

const normalise = (
  rawCount: Record<string, number>,
): Record<string, number> => {
  let total = 0;
  for (const [, c] of Object.entries(rawCount)) {
    total += c;
  }

  const freq = Object.create(null) as Record<string, number>;
  for (const [token, c] of Object.entries(rawCount)) {
    freq[token] = c / total;
  }

  return freq;
};

const main = async () => {
  const lines = await loadFile();

  let tokens = [];
  let match;
  for (const line of lines) {
    if (line.trim() === '') {
      tokens.push('<empty line>');
      continue;
    }
    const TOKEN = /(\s+)|([a-z’-]+)|(\?|\.|\,|“|”)/gi;
    while ((match = TOKEN.exec(line.trim())) != undefined) {
      let token = match[0].replace(/\s+/, ' ');
      if (token !== ' ') {
        tokens.push(token);
      }
    }
  }

  console.log(`Producing counts`);
  const rawCounts = new Map<string, Record<string, number>>();
  for (let i = 1; i < tokens.length; i++) {
    let key = tokens[i - 1];
    let next = tokens[i];

    let count = rawCounts.get(key);
    if (count == undefined) {
      count = Object.create(null) as Record<string, number>;
      rawCounts.set(key, count);
    }

    if (count[next] == undefined) {
      count[next] = 0;
    }

    count[next]++;
  }

  console.log(`Found ${rawCounts.size} unique tokens`);
  console.log(`Building frequency table`);
  const frequencies = new Map<string, Record<string, number>>();
  for (const [key, rawCount] of rawCounts.entries()) {
    let table = normalise(rawCount);
    delete table[key];
    frequencies.set(key, table);
  }

  console.log(frequencies.get('the'));

  {
    console.log(`running fair search`);
    let next: string | undefined = undefined;
    let token = '<empty line>';
    let limit = 100;
    const output = [];
    while (--limit > 0 && next !== '<empty line>') {
      output.push(token);
      const table = frequencies.get(token);
      if (table == undefined || Object.keys(table).length === 0) {
        break;
      }
      let p = Math.random();
      // just in case this next step fails for some reason
      next = Object.keys(table)[0];
      for (const [k, v] of Object.entries(table)) {
        if (v >= p) {
          next = k;
          break;
        }
        p -= v;
      }
      token = next;
    }

    console.log(`fair output: ${output.slice(1).join(' ')}`);
  }

  {
    console.log('running greedy search');
    let next: string | undefined = undefined;
    let token = '<empty line>';
    let limit = 100;
    const output = [];
    while (--limit > 0 && next !== '<empty line>') {
      output.push(token);
      const table = frequencies.get(token);
      if (table == undefined || Object.keys(table).length === 0) {
        break;
      }

      let bestF = -Infinity;

      for (const [t, f] of Object.entries(table)) {
        if (f > bestF) {
          bestF = f;
          next = t;
        }
      }
      token = next || '';
    }

    console.log(`greedy output: ${output.slice(1).join(' ')}`);
  }
};

main().catch((e) => {
  process.exitCode = 3;
  process.stderr.write(`Error: ${e}`);
});
