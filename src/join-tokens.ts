export const joinTokens = (tokens: string[]): string => {
    if (tokens.length === 0) {
        return ''
    }

    let output = tokens[0];
    for (let i = 1; i < tokens.length; i++) {
        const token = tokens[i];
        if (isPunctuation(token) || isPunctuation(tokens[i - 1])) {
            output += token;
        } else {
            output += ` ${token}`;
        }
    }

    return output
}

const isPunctuation = (token: string) =>
    ['.', ',', '?', '!', '“', '”', '<empty line>'].includes(token)