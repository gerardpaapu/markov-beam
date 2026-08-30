export const joinTokens = (tokens: string[]): string => {
  if (tokens.length === 0) {
    return "";
  }

  let output = tokens[0];
  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];
    const previous = tokens[i - 1];

    if (token === "<empty line>") {
      output += "\n\n";
    } else if (isWord(token) && !isOpenQuote(previous)) {
      output += ` ${token}`;
    } else {
      output += token;
    }
  }

  return output;
};

const isWord = (token: string) => !isPunctuation(token);
const isOpenQuote = (token: string) => token === "“";
const isPunctuation = (token: string) =>
  [".", ",", "?", "!", "“", "”", "<empty line>"].includes(token);
