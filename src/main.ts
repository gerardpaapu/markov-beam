import { readData } from "./read-data.ts";
import { buildNormalisedWeightsMap } from "./build-normalised-weights-map.ts";
import { joinTokens } from "./join-tokens.ts";
import fairDecode from "./decoders/fair.ts";
import greedy from "./decoders/greedy.ts";
import greedyRejectNGrams from "./decoders/greedy-reject-n-grams.ts";
import beamSearch from "./decoders/beam-search.ts";

const main = async () => {
  const tokens = await readData();
  const frequencies = buildNormalisedWeightsMap(tokens);
  {
    const output = fairDecode(frequencies);
    process.stdout.write(`Fair sampling:\n >\t${joinTokens(output)}\n\n\n`);
  }

  {
    const output = greedy(frequencies);
    process.stdout.write(`Greedy search:\n >\t${joinTokens(output)}\n\n\n`);
  }

  {
    const output = greedyRejectNGrams(frequencies);
    process.stdout.write(
      `Greedy (rejecting repeated n-grams) search:\n >\t${joinTokens(output)}\n\n\n`,
    );
  }
  {
    const output = beamSearch(frequencies);
    process.stdout.write(`Beam search (N=4):\n >\t${joinTokens(output)}\n`);
  }
};

main().catch((e) => {
  process.stderr.write(`Failed: ${e}\n`);

  process.exitCode = 3;
});
