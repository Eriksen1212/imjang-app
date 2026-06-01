#!/usr/bin/env node
// check-structure.mjs — 필수 디렉토리 구조 검사

import { existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(process.cwd());

const REQUIRED_DIRS = [
  'docs',
  'docs/sprint-contracts',
  'state',
  'eval',
  'scripts/guardrails',
  'supabase',
  '.github/workflows',
];

const REQUIRED_SCRIPTS = [
  'scripts/guardrails/check-env.mjs',
  'scripts/guardrails/check-docs.mjs',
  'scripts/guardrails/check-structure.mjs',
];

const REQUIRED_CI = [
  '.github/workflows/ci.yml',
];

let hasError = false;

console.log('--- 디렉토리 검사 ---');
for (const dir of REQUIRED_DIRS) {
  const fullPath = resolve(ROOT, dir);
  if (!existsSync(fullPath)) {
    console.error(`❌ 누락된 디렉토리: ${dir}`);
    hasError = true;
  } else {
    console.log(`✅ ${dir}/`);
  }
}

console.log('\n--- Guardrail 스크립트 검사 ---');
for (const script of REQUIRED_SCRIPTS) {
  const fullPath = resolve(ROOT, script);
  if (!existsSync(fullPath)) {
    console.error(`❌ 누락된 스크립트: ${script}`);
    hasError = true;
  } else {
    console.log(`✅ ${script}`);
  }
}

console.log('\n--- CI 설정 검사 ---');
for (const ci of REQUIRED_CI) {
  const fullPath = resolve(ROOT, ci);
  if (!existsSync(fullPath)) {
    console.error(`❌ 누락된 CI 파일: ${ci}`);
    hasError = true;
  } else {
    console.log(`✅ ${ci}`);
  }
}

if (hasError) {
  console.error('\n구조 검사 실패. 누락된 항목을 생성하세요.');
  process.exit(1);
}

console.log('\n✅ 구조 검사 통과');
