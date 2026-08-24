#!/bin/bash 
set -ueo pipefail

mkdir -p data
curl -s -L -o data/saucy.txt https://www.gutenberg.org/cache/epub/79446/pg79446.txt 