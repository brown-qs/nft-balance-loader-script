#!/bin/bash

## Before running:
# This tool requires to have solc installed.
# Ensure that you have the binaries installed by pip3 in your path.
# Install: https://github.com/crytic/slither#how-to-install
# Usage: https://github.com/crytic/slither/wiki/Usage

mkdir -p reports

python pip3 install --user slither-analyzer && \
yarn build && \

echo "Analyzing contracts..."
slither . &> reports/analyzer-report.log && \

echo "Done!"
