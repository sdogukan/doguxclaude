/** Hafıza bölümü: ayrıştırma, sıra, tavan ve iki yazıcının birbirine dokunmaması. */
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { birlestir, bolumler, ekle, HAFIZA_BASLIK, konusmaKuyrugu, TAVAN } from './hafiza.js';

const HARITA = `# Harita

2 depo · 2026-09-06

- **Projects/a** — birinci depo.
  <sub>10 dosya · 2026-09-06</sub>
- **Projects/b** — ikinci depo.
  <sub>20 dosya · 2026-09-06</sub>`;

test('hafıza bölümü yoksa alt bölüm boştur', () => {
  const { harita, hafiza } = bolumler(HARITA);
  assert.equal(harita, HARITA);
  assert.deepEqual(hafiza, []);
});

test('hafıza satırları ayrıştırılır, harita bölümü bozulmaz', () => {
  const tam = birlestir(HARITA, ['- 2026-09-06 · a · birinci.', '- 2026-09-05 · b · ikinci.']);
  const { harita, hafiza } = bolumler(tam);
  assert.equal(harita, HARITA, 'harita bölümü aynen dönmeli');
  assert.equal(hafiza.length, 2);
  assert.ok(hafiza[0]!.includes('birinci'));
});

test('yeni oturum en üste eklenir', () => {
  const s = ekle(['- eski'], '- yeni');
  assert.deepEqual(s, ['- yeni', '- eski']);
});

test('otuzu aşan en eski alttan düşer', () => {
  let s: string[] = [];
  for (let i = 0; i < TAVAN + 5; i++) s = ekle(s, `- satır ${i}`);
  assert.equal(s.length, TAVAN);
  assert.equal(s[0], `- satır ${TAVAN + 4}`, 'en yeni üstte');
  assert.equal(s[TAVAN - 1], `- satır 5`, 'en eski beşi düşmüş');
});

test('harita yeniden yazılınca hafıza aynen kalır', () => {
  const once = birlestir(HARITA, ['- 2026-09-06 · a · kalmalı.']);
  // Harita tazeleyicinin yaptığı: üst bölümü yeniden üret, alt bölümü geri koy.
  const { hafiza } = bolumler(once);
  const yeniHarita = HARITA.replace('birinci depo', 'GÜNCELLENMİŞ açıklama');
  const sonra = birlestir(yeniHarita, hafiza);
  assert.ok(sonra.includes('GÜNCELLENMİŞ açıklama'), 'harita güncellenmeli');
  assert.ok(sonra.includes('kalmalı.'), 'hafıza silinmemeli');
  assert.equal(bolumler(sonra).hafiza.length, 1);
});

test('hafıza eklenince harita satırları bozulmaz', () => {
  const once = birlestir(HARITA, []);
  const sonra = birlestir(bolumler(once).harita, ekle(bolumler(once).hafiza, '- yeni oturum'));
  assert.ok(sonra.includes('**Projects/a** — birinci depo.'), 'depo satırı aynen kalmalı');
  assert.ok(sonra.includes('**Projects/b** — ikinci depo.'));
  assert.ok(sonra.includes(HAFIZA_BASLIK));
});

test('konuşma çıkarılırken araç çıktıları atılır', () => {
  const d = mkdtempSync(join(tmpdir(), 'dxc-h-'));
  const y = join(d, 'k.jsonl');
  writeFileSync(y, [
    JSON.stringify({ type: 'user', message: { content: 'merhaba' } }),
    JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'selam' }] } }),
    JSON.stringify({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Bash', input: { command: 'ls' } }] } }),
    JSON.stringify({ type: 'user', message: { content: [{ type: 'tool_result', content: 'ÇOK UZUN ARAÇ ÇIKTISI' }] } }),
  ].join('\n'));
  const k = konusmaKuyrugu(y);
  assert.ok(k.includes('merhaba') && k.includes('selam'), 'konuşma alınmalı');
  assert.ok(!k.includes('ARAÇ ÇIKTISI'), 'araç çıktısı atılmalı');
  assert.ok(!k.includes('Bash'), 'araç çağrısı atılmalı');
});

test('kuyruk tavanı aşılmaz, son kısım alınır', () => {
  const d = mkdtempSync(join(tmpdir(), 'dxc-h2-'));
  const y = join(d, 'k.jsonl');
  const satirlar = [...Array(200)].map((_, i) =>
    JSON.stringify({ type: 'user', message: { content: `mesaj ${i} ${'x'.repeat(200)}` } }));
  writeFileSync(y, satirlar.join('\n'));
  const k = konusmaKuyrugu(y, 5_000);
  assert.ok(k.length <= 5_000, `${k.length} > 5000`);
  assert.ok(k.includes('mesaj 199'), 'son mesaj korunmalı');
  assert.ok(!k.includes('mesaj 0 '), 'baştaki düşmeli');
});
