/** Ağırlığa göre kesme algoritmasının davranış testleri. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { depoOzeti } from './ozet.js';

/** Verilen dosya yollarından geçici bir git deposu kurar. */
function depoKur(dosyalar: string[]): string {
  const kok = mkdtempSync(join(tmpdir(), 'dxc-test-'));
  for (const d of dosyalar) {
    const tam = join(kok, d);
    mkdirSync(dirname(tam), { recursive: true });
    writeFileSync(tam, 'x');
  }
  const g = (...a: string[]) => execFileSync('git', ['-C', kok, ...a], { stdio: 'ignore' });
  g('init', '-q');
  g('config', 'user.email', 't@t');
  g('config', 'user.name', 'T');
  g('add', '-A');
  g('commit', '-qm', 'x');
  return kok;
}

test('kök dosyaları listelenir, klasörler sayısıyla gelir', () => {
  const kok = depoKur(['README.md', 'src/a.ts', 'src/b.ts', 'src/c.ts']);
  const o = depoOzeti(kok);
  assert.equal(o.dosyaSayisi, 4);
  assert.ok(o.satirlar.includes('README.md'));
  assert.ok(o.satirlar.some((s) => s.startsWith('src/  (3)')));
});

test('eşiğin altındaki klasörün içine inilmez', () => {
  // 100 dosya → eşik max(3, 2) = 3. kucuk/ 1 dosya tutuyor, açılmamalı.
  const dosyalar = [...Array(99)].map((_, i) => `buyuk/alt/f${i}.ts`);
  dosyalar.push('kucuk/derin/x.ts');
  const o = depoOzeti(depoKur(dosyalar));
  assert.ok(o.metin.includes('buyuk/'), 'büyük klasör açılmalı');
  assert.ok(o.metin.includes('alt/'), 'büyük klasörün altı açılmalı');
  assert.ok(!o.metin.includes('derin/'), 'küçük klasörün içine inilmemeli');
});

test('dörtten fazla küçük kardeş tek satıra toplanır', () => {
  const dosyalar = [...Array(60)].map((_, i) => `agir/f${i}.ts`);
  for (const ad of ['a', 'b', 'c', 'd', 'e', 'f']) dosyalar.push(`kucukler/${ad}/x.ts`);
  const o = depoOzeti(depoKur(dosyalar));
  const toplama = o.satirlar.find((s) => s.includes('klasör ('));
  assert.ok(toplama, 'toplama satırı olmalı');
  assert.ok(/… 6 klasör \(6 dosya\)/.test(toplama!), toplama);
  // Adların TAMAMI yazılmalı, örnek değil: altı klasörün altısı da satırda olmalı.
  for (const ad of ['a', 'b', 'c', 'd', 'e', 'f']) assert.ok(toplama!.includes(ad), `${ad} eksik: ${toplama}`);
});

test('üç ya da daha az küçük kardeş tek tek yazılır', () => {
  const dosyalar = [...Array(60)].map((_, i) => `agir/f${i}.ts`);
  for (const ad of ['a', 'b']) dosyalar.push(`kucukler/${ad}/x.ts`);
  const o = depoOzeti(depoKur(dosyalar));
  assert.ok(!o.metin.includes('klasör ('), 'toplama yapılmamalı');
});

test('çıktı dosya sayısıyla orantılı büyümez', () => {
  const kucuk = depoOzeti(depoKur([...Array(50)].map((_, i) => `src/mod${i % 5}/f${i}.ts`)));
  const buyuk = depoOzeti(depoKur([...Array(2000)].map((_, i) => `src/mod${i % 5}/f${i}.ts`)));
  assert.equal(buyuk.dosyaSayisi / kucuk.dosyaSayisi, 40);
  assert.ok(buyuk.satirlar.length <= kucuk.satirlar.length * 2,
    `40 kat dosya, ${kucuk.satirlar.length} → ${buyuk.satirlar.length} satır olmamalı`);
});

test('git deposu olmayan klasör boş özet verir', () => {
  const kok = mkdtempSync(join(tmpdir(), 'dxc-bos-'));
  const o = depoOzeti(kok);
  assert.equal(o.dosyaSayisi, 0);
  assert.equal(o.metin, '');
});
