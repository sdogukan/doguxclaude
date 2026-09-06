/** Ortak yardımcılar. Bağımlılık yok, yalnız Node yerleşikleri. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

export const KOK = process.env['DOGUXCLAUDE_KOK'] ?? join(homedir(), '.doguxclaude');
export const HARITA_YOLU = join(KOK, 'index.md');

export function git(depo: string, ...args: string[]): string {
  try {
    return execFileSync('git', ['-C', depo, ...args],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }).trim();
  } catch { return ''; }
}

export function oku(yol: string): string | null {
  try { return readFileSync(yol, 'utf8'); } catch { return null; }
}

/** Atomik yazma: yarım dosya bırakmaz. */
export function yaz(yol: string, icerik: string): void {
  mkdirSync(dirname(yol), { recursive: true });
  const gecici = `${yol}.tmp-${process.pid}`;
  writeFileSync(gecici, icerik, 'utf8');
  renameSync(gecici, yol);
}

export function hata(mekanizma: string, neOldu: string, neYapilmali: string): string {
  return `dxc ${mekanizma}: ${neOldu} — ${neYapilmali}`;
}

export function bugun(): string { return new Date().toISOString().slice(0, 10); }
