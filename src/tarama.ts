/** Makinedeki git depolarını bulur.
 *
 *  İki kural, ölçümle seçildi (ham tarama 101 sonuç veriyordu, bu ikisi 10'a indiriyor):
 *  1. Nokta ile başlayan klasörlere girme — araç üretimi depolar orada (.dijji, .claude).
 *  2. Bir depo bulunca içine inme — bir projenin içindeki derleme çıktısı da depo olabilir.
 *  Bu makinede: 327 klasör tarandı, 10 depo, 9 ms. */
import { readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative } from 'node:path';
import { git } from './util.js';

/** İçine girilmeyen klasörler: bağımlılık, derleme çıktısı, sistem. */
const ATLA = new Set(['node_modules', 'Library', 'venv', '__pycache__', 'dist', 'build',
  'target', 'vendor', 'Pods', 'OrbStack', 'Applications', 'Movies', 'Music', 'Pictures']);

export interface Depo {
  yol: string;        // mutlak
  goreli: string;     // ev dizinine göre
  remote: string;
  dal: string;
  commit: number;
  sonDegisiklik: string;
  kirli: boolean;
}

export function depolariBul(baslangic = homedir(), maxDerinlik = 5): string[] {
  const bulunan: string[] = [];
  const gez = (klasor: string, derinlik: number): void => {
    if (derinlik > maxDerinlik) return;
    let girdiler;
    try { girdiler = readdirSync(klasor, { withFileTypes: true }); } catch { return; }
    if (girdiler.some((g) => g.name === '.git')) { bulunan.push(klasor); return; }
    for (const g of girdiler) {
      if (!g.isDirectory() || g.isSymbolicLink()) continue;
      if (g.name.startsWith('.') || ATLA.has(g.name)) continue;
      gez(join(klasor, g.name), derinlik + 1);
    }
  };
  gez(baslangic, 0);
  return bulunan;
}

export function depoBilgisi(yol: string, ev = homedir()): Depo {
  return {
    yol,
    goreli: relative(ev, yol) || yol,
    remote: git(yol, 'remote', 'get-url', 'origin'),
    dal: git(yol, 'rev-parse', '--abbrev-ref', 'HEAD'),
    commit: Number(git(yol, 'rev-list', '--count', 'HEAD')) || 0,
    sonDegisiklik: git(yol, 'log', '-1', '--format=%cs'),
    kirli: git(yol, 'status', '--porcelain').length > 0,
  };
}

/** Bir yolun içinde bulunduğu depoyu bulur; depo değilse null. */
export function iceridekiDepo(cwd: string): string | null {
  const kok = git(cwd, 'rev-parse', '--show-toplevel');
  return kok || null;
}
