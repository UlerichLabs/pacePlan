#!/bin/bash
cd /home/lucas/Projetos/UlerichLabs/pacePlan
echo "=== TYPE CHECK ==="
pnpm --filter web type-check 2>&1
echo "=== EXIT: $? ==="
