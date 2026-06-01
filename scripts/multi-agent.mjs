#!/usr/bin/env node
/**
 * 멀티 에이전트 파이프라인
 * Planner → Builder → Evaluator 루프
 * Evaluator가 PASS 할 때까지 반복 (최대 MAX_ITERATIONS)
 */
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ──────────────────────────────────────────────
// 설정
// ──────────────────────────────────────────────
const MAX_ITERATIONS = 5
const MODEL = 'claude-sonnet-4-6'

// ──────────────────────────────────────────────
// 초기화
// ──────────────────────────────────────────────
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('\n❌ ANTHROPIC_API_KEY가 없습니다.')
  console.error('   .env.local에 ANTHROPIC_API_KEY=sk-ant-... 를 추가하세요.\n')
  process.exit(1)
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ──────────────────────────────────────────────
// 도구 정의
// ──────────────────────────────────────────────
const TOOLS = [
  {
    name: 'read_file',
    description: '프로젝트 루트 기준 상대 경로의 파일을 읽습니다.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '상대 경로 (예: src/proxy.ts)' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: '파일을 생성하거나 덮어씁니다. 디렉토리가 없으면 자동 생성.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '상대 경로' },
        content: { type: 'string', description: '파일 전체 내용' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'list_dir',
    description: '디렉토리의 파일 목록을 반환합니다.',
    input_schema: {
      type: 'object',
      properties: {
        dir: { type: 'string', description: '상대 경로 디렉토리' },
      },
      required: ['dir'],
    },
  },
  {
    name: 'run_npm_script',
    description: 'npm run 스크립트를 실행합니다. (verify, build, lint만 허용)',
    input_schema: {
      type: 'object',
      properties: {
        script: { type: 'string', description: '스크립트 이름 (예: verify, build, lint)' },
      },
      required: ['script'],
    },
  },
]

// ──────────────────────────────────────────────
// 도구 실행기
// ──────────────────────────────────────────────
function runTool(name, input) {
  const abs = (p) => path.resolve(ROOT, p)

  switch (name) {
    case 'read_file': {
      try {
        return fs.readFileSync(abs(input.path), 'utf-8')
      } catch (e) {
        return `[오류] 파일을 읽을 수 없음: ${e.message}`
      }
    }

    case 'write_file': {
      try {
        fs.mkdirSync(path.dirname(abs(input.path)), { recursive: true })
        fs.writeFileSync(abs(input.path), input.content)
        return `[완료] ${input.path} 저장됨`
      } catch (e) {
        return `[오류] ${e.message}`
      }
    }

    case 'list_dir': {
      try {
        return fs.readdirSync(abs(input.dir), { withFileTypes: true })
          .map((e) => `${e.isDirectory() ? '📁 ' : '📄 '}${e.name}`)
          .join('\n')
      } catch (e) {
        return `[오류] ${e.message}`
      }
    }

    case 'run_npm_script': {
      const allowed = ['verify', 'build', 'lint', 'check:env', 'check:docs', 'check:structure']
      if (!allowed.includes(input.script)) {
        return `[거부] '${input.script}'는 허용되지 않습니다. 허용 목록: ${allowed.join(', ')}`
      }
      try {
        const out = execSync(`npm run ${input.script}`, {
          cwd: ROOT,
          timeout: 60000,
          encoding: 'utf-8',
          env: { ...process.env },
        })
        return out || '(출력 없음 — 성공)'
      } catch (e) {
        return `[실패] exit ${e.status}\n${e.stdout || ''}\n${e.stderr || ''}`
      }
    }

    default:
      return `[오류] 알 수 없는 도구: ${name}`
  }
}

// ──────────────────────────────────────────────
// 에이전트 실행 (agentic loop)
// ──────────────────────────────────────────────
async function runAgent({ label, systemPrompt, userMessage, maxToolRounds = 15 }) {
  const divider = '─'.repeat(55)
  console.log(`\n${divider}`)
  console.log(`  🤖 [${label}] 시작`)
  console.log(divider)

  const messages = [{ role: 'user', content: userMessage }]
  let round = 0

  while (round < maxToolRounds) {
    round++

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8096,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      tools: TOOLS,
      messages,
    })

    // 텍스트 출력
    for (const block of response.content) {
      if (block.type === 'text' && block.text.trim()) {
        const preview = block.text.length > 300
          ? block.text.substring(0, 300) + '…'
          : block.text
        console.log(`\n[${label}]\n${preview}`)
      }
      if (block.type === 'tool_use') {
        const inputPreview = JSON.stringify(block.input).substring(0, 80)
        console.log(`  🔧 ${block.name}(${inputPreview})`)
      }
    }

    // 종료
    if (response.stop_reason === 'end_turn') {
      const finalText = response.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
      console.log(`\n[${label}] ✅ 완료`)
      return finalText
    }

    // 도구 실행
    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content })
      const results = []

      for (const block of response.content) {
        if (block.type !== 'tool_use') continue
        const result = runTool(block.name, block.input)
        const resultPreview = String(result).substring(0, 120)
        console.log(`  → ${resultPreview}`)
        results.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: String(result).substring(0, 12000),
        })
      }

      messages.push({ role: 'user', content: results })
    }
  }

  return '(최대 라운드 도달)'
}

// ──────────────────────────────────────────────
// 유틸
// ──────────────────────────────────────────────
function loadAgentPrompt(name) {
  return fs.readFileSync(path.join(ROOT, 'agents', `${name}.md`), 'utf-8')
}

function readJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf-8'))
}

function writeJSON(relPath, data) {
  fs.writeFileSync(path.join(ROOT, relPath), JSON.stringify(data, null, 2))
}

function appendTrajectory(entry) {
  fs.appendFileSync(
    path.join(ROOT, 'state', 'trajectory.jsonl'),
    JSON.stringify({ timestamp: new Date().toISOString(), ...entry }) + '\n'
  )
}

// ──────────────────────────────────────────────
// 메인 파이프라인
// ──────────────────────────────────────────────
async function main() {
  console.log('\n' + '═'.repeat(55))
  console.log('  🚀 임장노트 멀티 에이전트 파이프라인')
  console.log('  Planner → Builder → Evaluator 루프')
  console.log('═'.repeat(55))

  // ── 1. Planner ───────────────────────────────
  await runAgent({
    label: 'Planner',
    systemPrompt: loadAgentPrompt('PLANNER'),
    userMessage:
      'state/progress.json과 docs/sprint-contracts/를 읽고, ' +
      'TODO 태스크 중 하나를 선택해 state/current-task.json을 작성하세요.',
  })

  // current-task.json 읽기
  let currentTask
  try {
    currentTask = readJSON('state/current-task.json')
  } catch {
    console.error('\n❌ state/current-task.json 생성 실패. Planner를 확인하세요.')
    process.exit(1)
  }

  console.log(`\n📋 선택된 태스크: [${currentTask.taskId}] ${currentTask.title}`)
  console.log(`   타입: ${currentTask.type}`)
  console.log(`   완료 기준: ${currentTask.acceptance_criteria?.length ?? 0}개`)

  appendTrajectory({ action: 'planner_selected_task', task: currentTask.taskId, title: currentTask.title })

  // ── 2. Builder ↔ Evaluator 루프 ─────────────
  const builderPromptName =
    currentTask.type === 'frontend' ? 'BUILDER_FRONTEND' : 'BUILDER_BACKEND'
  const builderLabel =
    currentTask.type === 'frontend' ? 'Builder(Frontend)' : 'Builder(Backend)'

  let passed = false
  let evalFeedback = ''
  let lastScore = 0

  for (let iter = 1; iter <= MAX_ITERATIONS; iter++) {
    console.log(`\n${'━'.repeat(55)}`)
    console.log(`  🔄 이터레이션 ${iter} / ${MAX_ITERATIONS}`)
    console.log('━'.repeat(55))

    // Builder
    const builderPrompt =
      iter === 1
        ? `다음 태스크를 구현하세요:\n\n${JSON.stringify(currentTask, null, 2)}`
        : `Evaluator 피드백을 반영해 수정하세요.\n\n` +
          `태스크:\n${JSON.stringify(currentTask, null, 2)}\n\n` +
          `Evaluator 피드백 (이터레이션 ${iter - 1}):\n${evalFeedback}`

    await runAgent({
      label: builderLabel,
      systemPrompt: loadAgentPrompt(builderPromptName),
      userMessage: builderPrompt,
    })

    appendTrajectory({ action: 'builder_done', task: currentTask.taskId, iteration: iter })

    // Evaluator
    await runAgent({
      label: 'Evaluator',
      systemPrompt: loadAgentPrompt('EVALUATOR'),
      userMessage:
        `이터레이션 ${iter}/${MAX_ITERATIONS} — 다음 태스크의 구현을 평가하세요.\n\n` +
        `태스크:\n${JSON.stringify(currentTask, null, 2)}\n\n` +
        `평가 후 state/eval-result.json에 결과를 저장하세요.`,
    })

    // 평가 결과 읽기
    let evalResult
    try {
      evalResult = readJSON('state/eval-result.json')
    } catch {
      console.error('\n❌ state/eval-result.json 생성 실패.')
      break
    }

    lastScore = evalResult.score ?? 0
    const verdictEmoji = evalResult.verdict === 'PASS' ? '✅' : '🔁'
    console.log(`\n${verdictEmoji} 평가: ${evalResult.verdict}  점수: ${lastScore}/100`)
    console.log(`   요약: ${evalResult.feedback?.substring(0, 150) ?? ''}`)

    if (evalResult.issues?.length) {
      console.log('   이슈:')
      evalResult.issues.forEach((issue) => console.log(`     • ${issue.substring(0, 100)}`))
    }

    appendTrajectory({
      action: 'evaluator_verdict',
      task: currentTask.taskId,
      iteration: iter,
      verdict: evalResult.verdict,
      score: lastScore,
    })

    if (evalResult.verdict === 'PASS') {
      passed = true

      // progress.json 업데이트
      const progress = readJSON('state/progress.json')
      const task = progress.tasks.find((t) => t.id === currentTask.taskId)
      if (task) {
        task.status = 'done'
        progress.last_updated = new Date().toISOString().split('T')[0]
        writeJSON('state/progress.json', progress)
        console.log(`\n📝 state/progress.json → [${task.id}] ${task.title} done`)
      }

      // eval 스냅샷 저장
      const sprint = progress.current_sprint?.replace('sprint-', '') ?? '01'
      const evalPath = `eval/sprint-${sprint.padStart(2, '0')}.json`
      const evalSnapshot = {
        ...readJSON(evalPath).catch?.() ?? {},
        sprint: progress.current_sprint,
        task: currentTask.taskId,
        evaluated_at: new Date().toISOString(),
        status: 'passed',
        score: lastScore,
        iterations: iter,
        criteria_results: evalResult.criteria_results ?? [],
        notes: evalResult.feedback,
      }
      try {
        writeJSON(evalPath, evalSnapshot)
        console.log(`📊 ${evalPath} 업데이트`)
      } catch {}

      break
    }

    // RETRY: 피드백 수집
    evalFeedback =
      (evalResult.feedback ?? '') +
      '\n\n이슈 목록:\n' +
      (evalResult.issues ?? []).map((i) => `- ${i}`).join('\n')

    if (iter < MAX_ITERATIONS) {
      console.log(`\n🔁 Builder에게 피드백 전달 후 재시도...`)
    }
  }

  // ── 3. 결과 요약 ─────────────────────────────
  console.log('\n' + '═'.repeat(55))
  if (passed) {
    console.log('  ✅ 파이프라인 성공!')
    console.log(`  태스크 [${currentTask.taskId}] ${currentTask.title}`)
    console.log(`  최종 점수: ${lastScore}/100`)
  } else {
    console.log(`  ⚠️  최대 이터레이션(${MAX_ITERATIONS}) 도달 — 수동 검토 필요`)
    console.log(`  state/eval-result.json과 state/current-task.json을 확인하세요.`)
  }
  console.log('═'.repeat(55) + '\n')
}

main().catch((e) => {
  console.error('\n❌ 파이프라인 오류:', e.message)
  process.exit(1)
})
