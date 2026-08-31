
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
  const entries = Object.entries(rawCount).toSorted(([,a], [,b]) => b - a);
  for (const [token, c] of entries) {
    freq[token] = c / total;
  }

  return freq;
};

function heaviestFirst(obj: Weights): Weights {
  let entries = Object.entries(obj)
    .toSorted(([,a], [,b]) => b - a);

  const result = Object.create(null);
  for (const [k, v] of entries) {
    result[k] = v;
  }

  return result;
}

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
  
  
  console.log(`raw counts for She = ${JSON.stringify(heaviestFirst(rawCounts.get('She')!), null, 2)}`);
  const normalisedWeightsMap = new Map<string, Weights>();
  for (const [key, rawCount] of rawCounts.entries()) {
    let table = normalise(heaviestFirst(rawCount));
    delete table[key];
    normalisedWeightsMap.set(key, table);
  }

  console.log(`normalised for She = ${JSON.stringify(normalisedWeightsMap.get('She'), null, 2)}`);

  return normalisedWeightsMap;
}