#!/bin/bash 
set -ueo pipefail

mkdir -p data
[ -f "data/pride.txt" ] || curl -s -L -o data/pride.txt https://www.gutenberg.org/cache/epub/1342/pg1342.txt
[ -f "data/swanns-way.txt" ] || curl -s -L -o data/swanns-way.txt https://www.gutenberg.org/cache/epub/7178/pg7178.txt