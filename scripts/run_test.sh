#!/bin/bash

# Function to display usage
usage() {
  echo "Usage: $0 [--unit | --integration | --all]"
  echo "  --unit         Run unit tests only"
  echo "  --integration  Run integration tests only"
  echo "  --e2e          Run E2E tests only"
  exit 1
}

# Check if no arguments are provided
if [ $# -eq 0 ]; then
  usage
fi

root_dir=$(git rev-parse --show-toplevel);

echo $root_dir

cd $root_dir || exit;

# Parse command-line arguments
case "$1" in
  --unit)
    echo "Running unit tests..."
    echo "No yet implemented"
    exit 1;
    ;;
  --integration)
    ./scripts/db_scripts.sh --reset
    echo "Running integration tests..."
    cd ./test/integration-tests || exit
    npm run test
    ;;
  --e2e)
    echo "Running E2E tests..."
    echo "No yet implemented"
    exit 1;
    ;;
  *)
    usage
    ;;
esac
