/** Kanca kararı: neyi yazar, neyi yazmaz. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { istemdekiDepolar, karar, sadelestir } from './kanca.js';

/** Adı verilen bir git deposu kurar ve git'in bildirdiği kök yolu döner. */
function depoKur(ad: string): string {
  const ust = mkdtempSync(join(tmpdir(), 'dxc-k-'));
  const kok = join(ust, ad);
  mkdirSync(join(kok, 'src'), { recursive: true });
  writeFileSync(join(kok, 'src', 'a.ts'), 'x');
  writeFileSync(join(kok, 'README.md'), 'x');
  const g = (...a: string[]) => execFileSync('git', ['-C', kok, ...a], { stdio: 'ignore' });
  g('init', '-q'); g('config', 'user.email', 't@t'); g('config', 'user.name', 'T');
  g('add', '-A'); g('commit', '-qm', 'x');
  return execFileSync('git', ['-C', kok, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
}

test('Türkçe harfler sadeleşir', () => {
  assert.equal(sadelestir('Çözdükçe'), 'cozdukce');
  assert.equal(sadelestir('DİJJİ-AI'), 'dijji-ai');
});

test('istemde adı geçen depo bulunur', () => {
  const d = ['/x/cozdukce', '/x/dijji-ai'];
  assert.deepEqual(istemdekiDepolar('çözdükçe reposunda ne var', d), ['/x/cozdukce']);
  assert.deepEqual(istemdekiDepolar('hiçbiri', d), []);
});

test('iki harflik adlar eşleşmez, her cümleye takılmasın', () => {
  assert.deepEqual(istemdekiDepolar('bu bir denemedir', ['/x/be']), []);
});

test('sorulan deponun yapısı yazılır, bulunduğun yer başka olsa da', () => {
  const depo = depoKur('cozdukce');
  const bos = mkdtempSync(join(tmpdir(), 'dxc-bos-'));
  const k = karar('çözdükçe tek cümle', bos, new Set(), [depo]);
  assert.deepEqual(k.eklenen, [depo]);
  assert.ok(k.blok[0]!.includes('README.md'), 'kök dosyalar ada ada olmalı');
});

test('içinde bulunulan depo da yazılır', () => {
  const depo = depoKur('bagimsiz');
  const k = karar('adı geçmiyor', depo, new Set(), []);
  assert.deepEqual(k.eklenen, [depo]);
});

test('aynı depo oturumda ikinci kez yazılmaz', () => {
  const depo = depoKur('cozdukce');
  const k = karar('çözdükçe tek cümle', depo, new Set([depo]), [depo]);
  assert.deepEqual(k.eklenen, []);
  assert.deepEqual(k.blok, []);
});

test('hem adı geçen hem bulunulan aynı depoysa bir kez yazılır', () => {
  const depo = depoKur('cozdukce');
  const k = karar('çözdükçe', depo, new Set(), [depo]);
  assert.equal(k.eklenen.length, 1);
});

test('git deposu olmayan yerde ve ad geçmiyorsa hiçbir şey yazılmaz', () => {
  const bos = mkdtempSync(join(tmpdir(), 'dxc-bos-'));
  const k = karar('merhaba', bos, new Set(), []);
  assert.deepEqual(k.eklenen, []);
});
