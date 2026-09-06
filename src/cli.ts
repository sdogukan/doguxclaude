#!/usr/bin/env node
/** dxc — Claude Code'u makinendeki depoların haritasıyla başlatır.
 *
 *  İnsan yüzeyi tek komut: `dxc`. Diğerleri tanı içindir, ezberlenmesi gerekmez. */
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { haritaOku, haritaUret } from './harita.js';
import { depoOzeti } from './ozet.js';
import { iceridekiDepo } from './tarama.js';
import { hata, HARITA_YOLU, yaz } from './util.js';

const KULLANIM = `dxc — Claude'u makinendeki depoların haritasıyla başlatır

  dxc                başlat (claude bayrakları olduğu gibi geçer)
  dxc --kuru         başlatmadan, enjekte edilecek metni göster

  dxc harita         haritayı yeniden üret (--modelsiz: açıklama yazdırma)
  dxc harita --goster
  dxc ozet [klasör]  bir deponun yapısını çıkar (kod, model yok)
`;

function bayraklar(argv: string[]): { acik: Set<string>; konum: string[] } {
  const acik = new Set<string>(); const konum: string[] = [];
  for (const a of argv) (a.startsWith('--') ? acik.add(a.slice(2)) : konum.push(a));
  return { acik, konum };
}

function komutOzet(konum: string[]): number {
  const hedef = resolve(konum[0] ?? '.');
  const depo = iceridekiDepo(hedef);
  if (!depo) { console.error(hata('ozet', `${hedef} bir git deposu değil`, 'depo içinde çalıştır')); return 1; }
  const t0 = Date.now();
  const o = depoOzeti(depo);
  console.log(`# ${basename(depo)}\n\n${o.dosyaSayisi} dosya · ${Date.now() - t0} ms\n\n${o.metin}`);
  return 0;
}

function komutHarita(acik: Set<string>): number {
  if (acik.has('goster')) {
    const h = haritaOku();
    if (!h) { console.error(hata('harita', 'harita yok', 'dxc harita ile üret')); return 1; }
    console.log(h); return 0;
  }
  process.stderr.write('depolar taranıyor…\n');
  const s = haritaUret({ modelsiz: acik.has('modelsiz') });
  process.stderr.write(`${s.depolar.length} depo · kod ${s.kodMs} ms` +
    (s.modelCalisti ? ` · model ${(s.modelMs / 1000).toFixed(0)} sn` : ' · model çalışmadı') +
    `\nyazıldı: ${HARITA_YOLU}\n`);
  return 0;
}

function baglam(): string {
  const cwd = process.cwd();
  const depo = iceridekiDepo(cwd);
  const parcalar: string[] = [];
  const harita = haritaOku();
  if (harita) parcalar.push(harita.trim());
  else parcalar.push('# Harita\n\nHenüz üretilmedi. `dxc harita` ile üretilebilir.');

  if (depo) {
    const o = depoOzeti(depo);
    parcalar.push(`\n---\n\n# Bu depo: ${basename(depo)}\n\n` +
      `${depo}\n${o.dosyaSayisi} dosya · yapı koddan çıkarıldı, eksik olabilir\n\n\`\`\`\n${o.metin}\n\`\`\``);
  } else {
    parcalar.push(`\n---\n\n# Bu klasör\n\n${cwd} — git deposu değil, yapı çıkarılmadı.`);
  }
  return parcalar.join('\n');
}

async function baslat(argv: string[], acik: Set<string>): Promise<number> {
  const metin = baglam();
  if (acik.has('kuru')) { console.log(metin); return 0; }
  const yol = join(tmpdir(), `dxc-${process.pid}.md`);
  yaz(yol, metin);
  const gecen = argv.filter((a) => a !== '--kuru');
  return await new Promise((coz) => {
    const c = spawn('claude', ['--append-system-prompt-file', yol, ...gecen], { stdio: 'inherit' });
    c.on('error', (e) => { console.error(hata('dxc', `claude başlatılamadı (${e.message})`, 'Claude CLI kurulu mu')); coz(127); });
    c.on('exit', (k) => coz(k ?? 0));
  });
}

async function ana(): Promise<number> {
  const argv = process.argv.slice(2);
  const ilk = argv[0];
  if (ilk === 'help' || ilk === '--help' || ilk === '-h') { console.log(KULLANIM); return 0; }
  const bilinen = new Set(['harita', 'ozet']);
  const komut = ilk && bilinen.has(ilk) ? ilk : null;
  const { acik, konum } = bayraklar(komut ? argv.slice(1) : argv);
  if (komut === 'ozet') return komutOzet(konum);
  if (komut === 'harita') return komutHarita(acik);
  return await baslat(argv, acik);
}

ana().then((k) => { process.exitCode = k; }).catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exitCode = 1;
});
