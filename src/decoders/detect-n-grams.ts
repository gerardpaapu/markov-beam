export default function detectNGrams(output: string[], N = 3): Set<string> {
  const forbidden = new Set<string>();
  if (output.length > N) {
    const prefixSize = N - 1;
    const prefix = output.slice(-prefixSize);
    // search in the output so far for the prefix, and the next token is always banned
    const s = prefix[0];

    let idx = output.length - N;
    for (;;) {
      if (idx === -1) break;

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
