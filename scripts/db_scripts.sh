#!/bin/bash

# Function to display usage
usage() {
  echo "Usage: $0 [--reset | --execute <file> | --query <sql> | --help]"
  echo "  --reset             Reset the database using the schema file"
  echo "  --create-migration  Create a new migration file"
  echo "  --execute <file>    Execute a specific SQL file"
  echo "  --query <sql>       Run an interactive SQL query"
  echo "  --help              Display this help message"
  exit 1
}

# Check if no arguments are provided
if [ $# -eq 0 ]; then
  usage
fi

# Database configuration
DB_NAME="prod-random-quotes"
SCHEMA_FILE="./database/schema.sql"

cd server || exit;

# Parse command-line arguments
case "$1" in
  --create-migration)
    if [ -z "$2" ]; then
      echo "Error: Please provide a migration name."
      usage
    fi
    npx wrangler d1 migrations create "$DB_NAME" "$2"
    ;;
  --apply-migration)
    npx wrangler d1 migrations apply "$DB_NAME"
    ;;
  --reset)
    echo "Resetting the database..."
    if [ ! -f "$SCHEMA_FILE" ]; then
      echo "Error: Schema file '$SCHEMA_FILE' not found."
      exit 1
    fi
    npx wrangler d1 execute "$DB_NAME" --local --file="$SCHEMA_FILE"
    ;;
  --execute)
    if [ -z "$2" ]; then
      echo "Error: Please provide a SQL file to execute."
      usage
    fi
    if [ ! -f "$2" ]; then
      echo "Error: File '$2' not found."
      exit 1
    fi
    echo "Executing SQL file '$2'..."
    npx wrangler d1 execute "$DB_NAME" --local --file="$2"
    ;;
  --query)
    if [ -z "$2" ]; then
      echo "Error: Please provide a SQL query to execute."
      usage
    fi
    echo "Running query: $2"
    npx wrangler d1 execute "$DB_NAME" --local --command="$2"
    ;;
  --help)
    usage
    ;;
  *)
    echo "Error: Invalid option '$1'."
    usage
    ;;
esac
