import { OUTPUT_LIMIT, EMPTY_LINE } from "../constants.ts";


// This strategy chooses the next token at each point by fairly sampling from the
// probability distribution
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

      let p = Math.random();
      // we're choosing a value from [0, 1)
      // and we're going to subtract the weight of each option
      // until it uses up p, this gives us a weighted sample
      // from the options
      for (const [k, v] of Object.entries(table)) {
        if (v >= p) {
          output.push(k);
          break;
        }
        p -= v;
      }
    }
    
    // if we reached an empty line instead of reaching the max limit
    // let's drop the empty line
    if (output.at(-1) === EMPTY_LINE) {
      output.pop();
    }

    return output;
  }