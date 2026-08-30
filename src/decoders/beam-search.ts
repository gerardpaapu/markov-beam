import { EMPTY_LINE } from "../constants.ts";
import detectNGrams from "./detect-n-grams.ts";

const BEAM_COUNT = 4;
const OUTPUT_LIMIT = 100;

interface Beam {
  // this keeps track of how probable this path is overall
  // which is a measure of how well it matches the "model"
  sumLogProbability: number;
  output: string[];
}

// This strategy is beam search, it adds some level of branching over greedy selection
// so that it's still very fast but avoids some degeneration
export default function decode(
  frequencies: Map<string, Record<string, number>>,
): string[] {
  let beams = [] as Beam[];
  while (beams.length < BEAM_COUNT) {
    beams.push({
      sumLogProbability: 0,
      output: [],
    });
  }

  // we're going to ignore our stopping token and
  // just try to generate up to our limit, because it
  // makes comparing the beams easier (they will all have the same length).
  while (beams[0].output.length < OUTPUT_LIMIT) {
    // instead of looking at next steps from "the" last token
    // we're going to look at next steps from the last
    // token _of each beam_. Also instead of generating one new history
    // by adding a token to "the" output, we're going to generate NxN
    // next beams, and then choose the best N from that set of candidates
    // so at the end of each step we have N beams
    let next = [] as Beam[];
    for (const beam of beams) {
      const last = beam.output.at(-1) || "<empty line>";
      const table = frequencies.get(last);

      // I'm just going to throw here because I'm lazy
      // this genuinely should never happen.
      if (table == undefined || Object.keys(table).length === 0) {
        throw new Error(`Couldn't choose a next token after: ${last}`);
      }

      let forbidden = detectNGrams(beam.output);

      // choose the N best steps to take next, I'm just going
      // to make an array and sort it. In real code we might
      // use something equivalent to a partial sort, doing the
      // minimal work to take the top-N
      const steps = [...Object.entries(table)]
        .filter(([t]) => !forbidden.has(t))
        .toSorted(([, w1], [, w2]) => {
          // I hope I got this right, I can literally never remember
          // which way around these fucking things go
          return w2 - w1;
        })
        .slice(0, BEAM_COUNT);

      for (const [token, weight] of steps) {
        next.push({
          sumLogProbability: beam.sumLogProbability + Math.log(weight),
          // in JS copying an array like this is slow, but if we used a structure
          // that makes sense in JS it wouldn't be one that makes sense in the runtimes
          // that are good for ML, so just don't think too deeply about this
          output: [...beam.output, token],
        });
      }
    }
    // this should be NxN beams now, we're going to sort it again
    // and take the top N
    next.sort((a, b) => b.sumLogProbability - a.sumLogProbability);
    const deduped = [] as Beam[];
    for (const n of next) {
      if (deduped.some((d) => d.sumLogProbability === n.sumLogProbability)) {
        continue;
      }
      deduped.push(n);
    }
    beams = deduped.slice(0, BEAM_COUNT);
  }

  // the beams should still be sorted by overall score.
  const output = beams[0].output;
  // if we reached an empty line instead of reaching the max limit
  // let's drop the empty line
  if (output.at(-1) === EMPTY_LINE) {
    output.pop();
  }

  return output;
}
