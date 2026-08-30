import * as FS from "node:fs/promises";

export const readData = async () => {
  const raw = await FS.readFile("data/swans-way.txt", "utf8");
  return corpusToTokens(raw);
};

const corpusToTokens = (raw: string) => {
  const lines = corpusToLines(raw);
  const tokens = linesToTokens(lines);
  return tokens;
};

const corpusToLines = (raw: string): string[] => {
  const lines = [];
  let inHeader = true;
  for (const rawLine of raw.split(/\r\n|\n/)) {
    // drop the project gutenberg header
    if (inHeader && rawLine.startsWith("***")) {
      inHeader = false;
      continue;
    }
    if (inHeader) {
      continue;
    }
    // drop the footer too
    if (rawLine.startsWith("***")) {
      break;
    }

    lines.push(rawLine);
  }

  return lines;
};

const linesToTokens = (lines: string[]): string[] => {
  let tokens = [];
  let match;
  for (const line of lines) {
    if (line.trim() === "") {
      tokens.push("<empty line>");
      continue;
    }
    const TOKEN = /(\s+)|([a-z’-]+)|(\?|\.|\,|“|”)/gi;
    while ((match = TOKEN.exec(line.trim())) != undefined) {
      let token = match[0].replace(/\s+/, " ");
      if (token !== " " && token !== "Illustration") {
        tokens.push(token);
      }
    }
  }

  return tokens;
};
