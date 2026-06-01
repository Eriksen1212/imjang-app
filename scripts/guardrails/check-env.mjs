#!/usr/bin/env node
// check-env.mjs — 필수 환경변수 존재 여부 검사

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(process.cwd());
const ENV_FILE = resolve(ROOT, '.env.local');

const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

let hasError = false;

if (!existsSync(ENV_FILE)) {
  console.warn('⚠️  .env.local 파일이 없습니다. .env.example을 복사하여 설정하세요.');
  process.exit(0); // CI에서는 환경변수가 다른 방식으로 주입되므로 경고만
}

const envContent = readFileSync(ENV_FILE, 'utf-8');
const definedVars = new Set(
  envContent
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => line.split('=')[0].trim())
);

for (const varName of REQUIRED_VARS) {
  const fromProcess = process.env[varName];
  const fromFile = definedVars.has(varName);

  if (!fromProcess && !fromFile) {
    console.error(`❌ 환경변수 누락: ${varName}`);
    hasError = true;
  } else {
    console.log(`✅ ${varName}`);
  }
}

if (hasError) {
  console.error('\n환경변수 검사 실패. .env.local을 확인하세요.');
  process.exit(1);
}

console.log('\n✅ 환경변수 검사 통과');
