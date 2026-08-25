
import type { Weights } from "./frequency-table.ts";  

// converts the table of raw counts, i.e. just the number of times
// any token has followed this one, into frequency table i.e. the
// probablity that any particular token followed this one
const normalise = (
  rawCount: Weights,
): Weights => {
  let total = 0;
  for (const [, c] of Object.entries(rawCount)) {
    total += c;
  }

  const freq = Object.create(null) as Weights;
  for (const [token, c] of Object.entries(rawCount)) {
    freq[token] = c / total;
  }

  return freq;
};
  

export const buildNormalisedWeightsMap = (tokens: string[]): Map<string, Weights> => {
  const rawCounts = new Map<string, Weights>();
  for (let i = 1; i < tokens.length; i++) {
    let key = tokens[i - 1];
    let next = tokens[i];

    let count = rawCounts.get(key);
    if (count == undefined) {
      count = Object.create(null) as Weights;
      rawCounts.set(key, count);
    }

    if (count[next] == undefined) {
      count[next] = 0;
    }

    count[next]++;
  }

  const normalisedWeightsMap = new Map<string, Weights>();
  for (const [key, rawCount] of rawCounts.entries()) {
    let table = normalise(rawCount);
    delete table[key];
    normalisedWeightsMap.set(key, table);
  }

  return normalisedWeightsMap;
}