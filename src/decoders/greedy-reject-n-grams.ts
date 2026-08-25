import { OUTPUT_LIMIT, EMPTY_LINE } from "../constants.ts";



function detectNGrams(output: string[], N=3): Set<string> {
  const forbidden = new Set<string>();
  if (output.length > N) {
    const prefixSize = N - 1;
    const prefix = output.slice(-prefixSize);
    // search in the output so far for the prefix, and the next token is always banned
    const s = prefix[0]

    let idx = output.length - N;
    for (; ;) {
      idx = output.lastIndexOf(s, idx);
      // we didn't find it
      if (idx === -1) break;
      for (let i = 0; i < prefixSize; i++) {
        let j = i + idx;

        if (prefix[i] !== output[j]) {
          break;
        }

        if (i === prefixSize - 1) {
          forbidden.add(output[idx + prefixSize]);
        }
      }

      idx--;
    }
  }

  return forbidden;
}

// This strategy chooses the next token at each point by taking the most probable
// option each time. It can lead to degenerate output
export default function decode(frequencies: Map<string, Record<string, number>>): string[] {
  const output = [] as string[];
  while (output.length < OUTPUT_LIMIT && output.at(-1) !== EMPTY_LINE) {
    // we use the last token to predict/choose the next token
    // when we start, there is no last token so we use an <empty line> to 
    // simulate the start of a paragraph
    const last = output.at(-1) || '<empty line>'
    const table = frequencies.get(last);

    // we don't have any way to choose a next token in this
    // unlikely case
    if (table == undefined || Object.keys(table).length === 0) {
      break;
    }

    let bestF = -Infinity;
    let bestToken: string | undefined;
    const forbidden = detectNGrams(output);

    for (const [t, f] of Object.entries(table)) {
      if (forbidden.has(t)) {
        // we can't choose this token because it would complete an n-gram
        continue;
      }
      if (bestToken == undefined || f > bestF) {
        bestF = f;
        bestToken = t;
      }
    }
    output.push(bestToken ?? '');
  }

  // if we reached an empty line instead of reaching the max limit
  // let's drop the empty line
  if (output.at(-1) === EMPTY_LINE) {
    output.pop();
  }

  return output;
}