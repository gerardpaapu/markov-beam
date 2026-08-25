import { readData } from './read-data.ts';
import { buildNormalisedWeightsMap } from './build-normalised-weights-map.ts';
import { joinTokens } from './join-tokens.ts';
import fairDecode from './decoders/fair.ts';
import greedy from './decoders/greedy.ts';
import greedyRejectNGrams from './decoders/greedy-reject-n-grams.ts'



const main = async () => {
  const tokens = await readData();
  const frequencies = buildNormalisedWeightsMap(tokens);

  {
    const output = fairDecode(frequencies);
    process.stdout.write(`Fair sampling:\n >\t${joinTokens(output)}\n`);
  }

  {
    const output = greedy(frequencies);
    process.stdout.write(`\n\nGreedy search:\n >\t${joinTokens(output)}\n`);
  }

  {  
    const output = greedyRejectNGrams(frequencies);
    process.stdout.write(`\n\nGreedy (rejecting repeated n-grams) search:\n >\t${joinTokens(output)}\n`);
  }
};

main().catch((e) => {
  process.exitCode = 3;
  process.stderr.write(`Error: ${e}`);
});
