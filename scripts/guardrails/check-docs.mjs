#!/usr/bin/env node
// check-docs.mjs — 필수 문서 파일 존재 여부 검사

import { existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(process.cwd());

const REQUIRED_DOCS = [
  'AGENTS.md',
  'ARCHITECTURE.md',
  'README.md',
  'docs/PRODUCT_SPEC.md',
  'docs/DECISIONS.md',
  'docs/SECURITY.md',
  'docs/RELIABILITY.md',
  'docs/QUALITY_SCORE.md',
  'docs/sprint-contracts/sprint-01.md',
  'docs/sprint-contracts/sprint-02.md',
  'docs/sprint-contracts/sprint-03.md',
  'state/progress.json',
  'state/handoff.md',
  'state/trajectory.jsonl',
  'eval/final-report.md',
];

let hasError = false;

for (const docPath of REQUIRED_DOCS) {
  const fullPath = resolve(ROOT, docPath);
  if (!existsSync(fullPath)) {
    console.error(`❌ 누락된 파일: ${docPath}`);
    hasError = true;
  } else {
    console.log(`✅ ${docPath}`);
  }
}

if (hasError) {
  console.error('\n문서 검사 실패. 누락된 파일을 생성하세요.');
  process.exit(1);
}

console.log('\n✅ 문서 검사 통과');
