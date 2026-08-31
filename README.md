# Greed, fairness and why 4 is exactly right

I recently learned about a graph search strategy called "beam search". I came across it in the context of writing decoders for a language model. I thought I could write a little blog post about beam search, but for the people like me who get confused by words like "Log Softmax", "logits", etc.

Instead of starting from a *real* ML model, I'll be using a transition table of the type you might produce when building a markov chain.

A markov chain produces a new text (a series of tokens) based on an example text, the "corpus".

For a markov chain (N=1) producing a series of words, each word is chosen based on the the previous word P in the series, and words that followed it at least once in the example test. 

We start from a raw count of tokens that followed each token, here's the tokens that most often followed the token "She" in my corpus, and the number of times that they did.

| token | count |
|:------|------:|
| was   |    53 |
| had   |    37 |
| is    |    28 |
| could |    16 |

Then we normalise the values so that they add up to 1, which gives us a table that represents questions like "If the previous token was 'She', how often is the next token 'was'", or "what is the probability that any token following 'She' is 'was'"

| token | probability |
|:------|------------:|
| was   |       16.2% |
| had   |       11.3% |
| is    |        8.5% |
| could |        4.9% |

## Fair sampling

For a classic markov chain (N=1), we choose a token randomly and fairly from the tokens that followed the previous tokens in the example. So if the 'was' followed 'She' 16.2% of the time, we should try to choose it 16.2% of the time.

I'm going to call that "fair" sampling.

```typescript
// we choose a point in the probability space in [0, 1)
// and we'll look for the token that "covers" that point
const p = Math.random();
let total = 0;
for (const [token, weight] of weights) {
    // how much of the probability have we covered?
    total += weight;
    // if p is covered, we take that token
    if (total >= p) {
        return token;
    }
}
```

This produces text that contains tokens from the example text, in roughly the 
frequency that they appear and that pair up at roughly the same frequency they did in the example text. It doesn't get stuck in loops easily because it's just taking a random walk through the graph.

The output looks like this:

> The time have liked to Wickham is an elopement had mostly engaged to justify him but I went away, the younger sisters, he was a very Saturday se’nnight. Lady Catherine and on. I wish to visit was really glad to join in such nonsense? And my youngest daughters out that means unlike afterwards but to the utmost impatience, smiling.

I'm using Pride and Prejudice as the example text.

## Greedy search

A greedy search just chooses the most probable next token at each step. It's a very simple strategy.

In my case, I know that the weights are sorted so that the most likely token is first.

```typescript
for (const [token, _] of weights) {
    return token;
}
```

If they aren't we can do the work while sampling:

```typescript
let maxWeight = -Infinity;
let bestToken;

for (const [token, weight] of weights) {
    if (weight > maxWeight) {
        bestToken = token;
        maxWeight = weight;
    }
}

return bestToken;
```

Choosing the best option while only looking one step ahead, can be good for some scenarios but leaves you wide open to degenerate cases, looping, and doesn't gauruntee that the combination of choices you make is the best overall.

Here's what the output looked like:
> “I am sure, and the same time, and the same time, and the same time, and the same time, and the same time, and the same time, and the same time, and the same time, and the same time, and the same time, and the same time, and the same time, and the same time, and the same time, and the same time, and the same time, and the same time, and the same time, and the same time,

If the best choice after "same" is "time" then greedy search will choose it every time so it gets stuck in a loop of the same few tokens.

## Mitigation by forbidding n-grams

One way to improve greedy search is to attack the problem of repetition by just forbidding any sequence of 3 tokens (an N-gram where N=3) from appearing twice in the output.

This is a blunt instrument that doesn't really comport with how natural language works, but for short outputs it's huge improvement over naive greedy search.

Before considering a token, we first consider the last two tokens in the output as our "prefix". Then we look for any instance of that prefix before this. For any of those instances, the token that follows it is forbidden when choosing the next token.

If our output looks like this (I've highlighted the last two tokens):

> “I am sure, and the same time[, and]

When we're trying to pick our next token, we'll think of ", and" as our two token prefix. So we search backwards through the output so far for other instances of the prefix. I've highlighted the match.

> “I am sure[, and] the same time, and

The next token following the match is "the", so when we choose the next token instead of just choosing the "best" one, we'll choose the best one that isn't forbidden.

```typescript
for (const [token, _] of weights) {
    if (!forbidden.includes(token)) {
        return token;
    }
}
```

This small change can be a big improvement in output:

> “I am sure, and the same time, and, and I am not be so much as to be so, and she had been so much to be in the same, and her, and that he had been a very much as she had not be in a very little, and his own, and Elizabeth, and then, and was not be a very good opinion of the same.”

## Beam search

Beam search is another approach to improving greedy search.

In greedy search we keep track of our output so far as an array of tokens, and we choose the best next token and append it to that array.

In beam search (N=4), it's almost like we're doing 4 greedy searches at once.

Instead of tracking one array of tokens that will be our output, we track 4 arrays of tokens that could be our output. These are the beams. In the end we'll choose the best among them as the true output.

That means instead of taking the best token at each point, for each of our 4 beams we will choose the 4 highest weighted tokens (relative to the last token in that beam) to add to them.

That gives us 16 temporary beams, then we narrow that back down to 4 by choosing the best 4 beams. The "best" beams are the ones with the highest product probability, so that means we take the weight of the token chosen at each step and multiply them all together.

This represents an idea like "this beam is the most representative of the weights overall". That fitness is only among the beams we considered. Beam search is not intended to compete with exhaustive search for the most fit output overall, it's meant to improve the quality of greedy search while still being very cheap and fast.

In actual implementation, to avoid the multiplication we tend to operate on a natural log of the weights since adding logs of numbers preserves order with multiplying the original numbers.

```
log(A) + log(B) > log(C) + log(D) => A * B > C * D
```

My output with beam search (4 beams), **combined with** forbidden N-grams (N=3) looks like this:

> “I am sure,”
> 
> “Oh,” said Elizabeth, and I have been so much.
> 
> “I do not have been in the same time.”
> 
> Elizabeth, that he had been so well.” said she had been in her.” cried Elizabeth, I am afraid of her sister, and she could not know what I am not be so much as she was not to be in the world, and, and her.
> 
> Elizabeth was not be in her, and the


My methodology is a bit messy here, because for the previous examples I used `<empty line>` as
a stopping token, but for beam search I only stopped at `MAX_OUTPUT_LENGTH` so ... maybe it's not an entirely fair comparison but it's not too bad because the greedy search gets stuck in a loop and always hit `MAX_OUTPUT_LENGTH` anyway and Greedy + N-grams go very close to maximum length.

So beam search can avoid some of the ways that greedy search degenerates, but it can also degenerate in its own ways. Beams are forced to diverge by choosing 4 different options at each step, but they still have a tendency to fall back together. This is called beam collapse, when two or more beams effectively cover the same search space.

In the wild, there seems to be the "folk knowledge" that there's some optimal number of beams for most use cases and that number is 4. I hate to see magic numbers, so I tested other values for my original use case and with this markov table data. I regret to inform you that 4 works really well. 5 is slower and not really better, 8 is much slower and maybe slightly better. What tends to happen is that as you add beams to raise diversity, beam collapse becomes more common. So there's a ceiling on how diverse and high-quality beams can be, and past ~4-5 the cost goes up but the quality doesn't.

There's ways to raise that ceiling, including one technique "diverse beam search" that groups beams and compares the diversity between those groups using the diversity as another modifier to the weight. This buys you some more space before you get back to diminishing returns caused by collapse.

## Some conclusion?

I think for programmers who are unfamiliar with ML, but interested in programs that drive LLMs the decoding steps are one way in.

The new terminology and math can be a big hurdle, but once you zoom in on one aspect like token selection it's pretty easy to build an intuition about how ideas like top-k, top-p, temperature, etc can influence a sampler, how mitigation techniques like repetition penalties and N-gram detection prevent degenerative output or how to use completely different sampling techniques like greedy or beam search.
