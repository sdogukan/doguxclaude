/** Kanca kararı: neyi yazar, neyi yazmaz. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { istemdekiDepolar, karar, projeAdi, sadelestir } from './kanca.js';

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
  assert.equal(sadelestir('Öğrenci-Portalı'), 'ogrenci-portali');
  // Büyük İ tuzağı: JavaScript'te 'İ'.toLowerCase() iki kod noktası üretir.
  assert.equal(sadelestir('İSTANBUL-API'), 'istanbul-api');
});

test('Türkçe yazılan ad, ASCII klasör adıyla eşleşir', () => {
  const d = ['/x/ogrenci-portali', '/x/api-platform'];
  assert.deepEqual(istemdekiDepolar('öğrenci-portalı reposunda ne var', d), ['/x/ogrenci-portali']);
  assert.deepEqual(istemdekiDepolar('hiçbiri', d), []);
});

test('iki harflik adlar eşleşmez, her cümleye takılmasın', () => {
  assert.deepEqual(istemdekiDepolar('bu bir denemedir', ['/x/be']), []);
});

test('sorulan deponun yapısı yazılır, bulunduğun yer başka olsa da', () => {
  const depo = depoKur('web-app');
  const bos = mkdtempSync(join(tmpdir(), 'dxc-bos-'));
  const k = karar('web-app tek cümle', bos, new Set(), [depo]);
  assert.deepEqual(k.eklenen, [depo]);
  assert.ok(k.blok[0]!.includes('README.md'), 'kök dosyalar ada ada olmalı');
});

test('içinde bulunulan depo da yazılır', () => {
  const depo = depoKur('bagimsiz');
  const k = karar('adı geçmiyor', depo, new Set(), []);
  assert.deepEqual(k.eklenen, [depo]);
});

test('aynı depo oturumda ikinci kez yazılmaz', () => {
  const depo = depoKur('web-app');
  const k = karar('web-app tek cümle', depo, new Set([depo]), [depo]);
  assert.deepEqual(k.eklenen, []);
  assert.deepEqual(k.blok, []);
});

test('hem adı geçen hem bulunulan aynı depoysa bir kez yazılır', () => {
  const depo = depoKur('web-app');
  const k = karar('web-app', depo, new Set(), [depo]);
  assert.equal(k.eklenen.length, 1);
});

test('git deposu olmayan yerde ve ad geçmiyorsa hiçbir şey yazılmaz', () => {
  const bos = mkdtempSync(join(tmpdir(), 'dxc-bos-'));
  const k = karar('merhaba', bos, new Set(), []);
  assert.deepEqual(k.eklenen, []);
});

test('proje adı asla "bilinmeyen" olmaz', () => {
  assert.equal(projeAdi('/'), 'kök dizin');
  assert.equal(projeAdi('/Users/x/Projects/web-app'), 'web-app');
  assert.equal(projeAdi('/Users/x'), 'x');
  assert.notEqual(projeAdi(''), 'bilinmeyen');
});
