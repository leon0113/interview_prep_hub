import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface RunResult {
  /** stdout, plus the final error line if the program died with an uncaught exception. */
  output: string;
  ok: boolean;
  stderr: string;
}

const workDir = mkdtempSync(join(tmpdir(), 'iph-verify-'));
let counter = 0;

/** Normalises line endings and trailing whitespace so Windows and Unix compare equal. */
export function normalize(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .trim();
}

/**
 * The error line a reader cares about, e.g. "ZeroDivisionError: division by zero".
 * Python prints it last; Node prints it in the middle of the stack trace, followed by
 * "at ..." frames and its version, so prefer the first "SomethingError: ..." line.
 */
function lastErrorLine(stderr: string): string {
  const lines = normalize(stderr).split('\n').filter(Boolean);
  const nodeStyle = lines.find((line) => /^(Uncaught )?[A-Z]\w*(Error|Exception)\b/.test(line));
  return nodeStyle ?? lines.at(-1) ?? '';
}

/**
 * Runs `code` with the given interpreter from a fresh file in `dir` (a temp folder by default) and returns what a reader
 * would see in a terminal: stdout, followed by the error line if it crashed.
 */
export function runCode(
  command: string,
  args: string[],
  code: string,
  ext: string,
  dir: string = workDir,
): RunResult {
  const file = join(dir, `snippet-${counter++}${ext}`);
  writeFileSync(file, code, 'utf8');
  const result = spawnSync(command, [...args, file], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 20_000,
    env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONHASHSEED: '0', NO_COLOR: '1' },
  });
  const stdout = normalize(result.stdout ?? '');
  const stderr = result.stderr ?? '';
  const ok = result.status === 0;
  const output = ok ? stdout : [stdout, lastErrorLine(stderr)].filter(Boolean).join('\n');
  return { output, ok, stderr };
}

export function pythonAvailable(): boolean {
  return spawnSync('python', ['--version'], { encoding: 'utf8' }).status === 0;
}
