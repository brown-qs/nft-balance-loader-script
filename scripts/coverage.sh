#!/bin/bash

set -eo pipefail

yarn compile
npx hardhat coverage