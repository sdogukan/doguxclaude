/** Şekil parmak izi: sayılar değişince aynı, adlar değişince farklı olmalı. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sekilIzi } from './durum.js';

test('dosya sayısı değişse şekil aynı kalır', () => {
  const dun = 'packages/  (999)\n  api/  (297)\n    services/  (132)';
  const bugun = 'packages/  (1050)\n  api/  (310)\n    services/  (145)';
  assert.equal(sekilIzi(dun), sekilIzi(bugun));
});

test('yeni klasör eklenince şekil değişir', () => {
  const dun = 'packages/  (999)\n  api/  (297)';
  const bugun = 'packages/  (999)\n  api/  (297)\n  mobil/  (2)';
  assert.notEqual(sekilIzi(dun), sekilIzi(bugun));
});

test('klasör adı değişince şekil değişir', () => {
  assert.notEqual(sekilIzi('api/  (10)'), sekilIzi('backend/  (10)'));
});

test('toplama satırındaki sayılar da yok sayılır', () => {
  const dun = '… 27 klasör (52 dosya): auth, billing, tasks';
  const bugun = '… 27 klasör (61 dosya): auth, billing, tasks';
  assert.equal(sekilIzi(dun), sekilIzi(bugun));
});

test('toplama satırındaki AD değişirse şekil değişir', () => {
  const dun = '… 27 klasör (52 dosya): auth, billing, tasks';
  const bugun = '… 28 klasör (54 dosya): auth, billing, tasks, mobil';
  assert.notEqual(sekilIzi(dun), sekilIzi(bugun));
});

test('boş özet kararlı bir iz verir', () => {
  assert.equal(sekilIzi(''), sekilIzi(''));
  assert.equal(sekilIzi('').length, 16);
});
