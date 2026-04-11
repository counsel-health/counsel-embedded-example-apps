#!/usr/bin/env bash
# Usage:
#   ./run.sh [scenario] [label]
#
# Examples:
#   ./run.sh 01-health express        # capture Express baseline
#   ./run.sh 01-health elysia         # capture Elysia result
#   ./run.sh 03-authenticated-flow express
#
# Results are saved to load-testing/results/<timestamp>-<label>/
# Compare summary JSON files to see p95 latency and error rate changes.

set -euo pipefail

SCENARIO=${1:-"01-health"}
LABEL=${2:-"unlabeled"}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="${SCRIPT_DIR}/results/${TIMESTAMP}-${LABEL}"

mkdir -p "$OUT"

echo "Running scenario: ${SCENARIO} (label: ${LABEL})"
echo "Results → ${OUT}"
echo ""

k6 run \
  -e BASE_URL="${BASE_URL:-http://localhost:4003}" \
  -e ACCESS_CODE="${ACCESS_CODE:-}" \
  --out "json=${OUT}/${SCENARIO}.json" \
  --summary-export "${OUT}/${SCENARIO}-summary.json" \
  "${SCRIPT_DIR}/k6/scenarios/${SCENARIO}.js"

echo ""
echo "Done. Summary: ${OUT}/${SCENARIO}-summary.json"
