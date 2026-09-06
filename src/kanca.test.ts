/** Kanca kararı: ne zaman yazar, ne zaman susar. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { karar } from './kanca.js';

function depoKur(): string {
  const kok = mkdtempSync(join(tmpdir(), 'dxc-kanca-'));
  mkdirSync(join(kok, 'src'), { recursive: true });
  writeFileSync(join(kok, 'src', 'a.ts'), 'x');
  writeFileSync(join(kok, 'README.md'), 'x');
  const g = (...a: string[]) => execFileSync('git', ['-C', kok, ...a], { stdio: 'ignore' });
  g('init', '-q'); g('config', 'user.email', 't@t'); g('config', 'user.name', 'T');
  g('add', '-A'); g('commit', '-qm', 'x');
  // macOS'ta /var → /private/var: git'in verdiği yolu esas al ki karşılaştırma tutsun.
  return execFileSync('git', ['-C', kok, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
}

test('git deposu olmayan klasörde hiçbir şey yazılmaz', () => {
  const bos = mkdtempSync(join(tmpdir(), 'dxc-bos-'));
  const k = karar(bos, null, null);
  assert.equal(k.enjekte, null);
  assert.equal(k.depo, null);
});

test('depoya ilk girişte yapı yazılır', () => {
  const depo = depoKur();
  const k = karar(depo, null, null);
  assert.equal(k.depo, depo);
  assert.ok(k.enjekte && k.enjekte.includes('# Bu depo:'), 'yapı bloğu gelmeli');
  assert.ok(k.enjekte!.includes('README.md'), 'kök dosyalar ada ada olmalı');
});

test('aynı depodaki ikinci istemde hiçbir şey yazılmaz', () => {
  const depo = depoKur();
  const k = karar(join(depo, 'src'), depo, null);
  assert.equal(k.enjekte, null);
  assert.equal(k.depo, depo, 'depo yine bildirilmeli ki durum güncel kalsın');
});

test('açılışta zaten enjekte edilmiş depo ilk istemde tekrar yazılmaz', () => {
  const depo = depoKur();
  const k = karar(depo, null, depo);
  assert.equal(k.enjekte, null, 'sistem isteminde zaten var, kopyası gitmemeli');
  assert.equal(k.depo, depo);
});

test('başka bir depoya geçilince yazılır', () => {
  const a = depoKur();
  const b = depoKur();
  const k = karar(b, a, a);
  assert.ok(k.enjekte, 'yeni depo için yapı gelmeli');
  assert.equal(k.depo, b);
});
