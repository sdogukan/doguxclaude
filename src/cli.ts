#!/usr/bin/env node
/** dxc — Claude Code'u makinendeki depoların haritasıyla başlatır.
 *
 *  İnsan yüzeyi tek komut: `dxc`. Diğerleri tanı içindir, ezberlenmesi gerekmez. */
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { depoBlogu } from './baglam.js';
import { haritaOku, haritaTazele } from './harita.js';
import { ACILIS_DEPO, kancaCalistir } from './kanca.js';
import { kisaBaslik, ok, son, stdinBosalt, sure, tik, vurgu } from './ekran.js';
import { depoOzeti } from './ozet.js';
import { iceridekiDepo } from './tarama.js';
import { hata, HARITA_YOLU, yaz } from './util.js';

/** Git deposu olmayan klasör için soluk not. */
const GIT_YOK = ' \x1b[2m(git deposu değil, yapı verilmedi)\x1b[0m';

const KULLANIM = `dxc — Claude'u makinendeki depoların haritasıyla başlatır

  dxc                başlat. İlk çalıştırmada depoları tarar ve haritayı
                     kendiliğinden çıkarır; sonraki oturumlar anında açılır.
                     Claude bayrakları olduğu gibi geçer.

  dxc --kuru         başlatmadan, enjekte edilecek metni göster
  dxc harita         haritayı yenile (--zorla: hepsini yeniden yazdır,
                     --modelsiz, --goster)
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

async function komutHarita(acik: Set<string>): Promise<number> {
  if (acik.has('goster')) {
    const h = haritaOku();
    if (!h) { console.error(hata('harita', 'harita yok', 'dxc ile üret')); return 1; }
    console.log(h); return 0;
  }
  const s = await haritaTazele({ zorla: acik.has('zorla'), modelsiz: acik.has('modelsiz') });
  son(`${tik()} harita ${vurgu(HARITA_YOLU)} ${sure(s.kodMs + s.modelMs)}`);
  return 0;
}

/** Her açılışta depolar taranır (9 ms, bedava) ve harita gerekiyorsa tazelenir.
 *  Yeni depo eklendiyse yalnız onun açıklaması yazdırılır; var olanlara dokunulmaz.
 *  Kullanıcı hiçbir şey kurmaz, hiçbir komut ezberlemez: terminale `dxc` yazar. */
let sonTazeleme = { isVar: false, depoSayisi: 0 };

async function haritaSagla(ekSatir?: string): Promise<string> {
  const s = await haritaTazele(ekSatir === undefined ? {} : { ekSatir });
  sonTazeleme = { isVar: s.isVar, depoSayisi: s.depolar.length };
  return (haritaOku() ?? '').trim();
}

async function baglam(ekSatir?: string): Promise<string> {
  const cwd = process.cwd();
  const depo = iceridekiDepo(cwd);
  const parcalar: string[] = [];
  const harita = await haritaSagla(ekSatir);
  if (harita) parcalar.push(harita);
  else parcalar.push('# Harita\n\nÜretilemedi.');

  if (depo) {
    parcalar.push(`\n---\n\n${depoBlogu(depo)}`);
  } else {
    parcalar.push(`\n---\n\n# Bu klasör\n\n${cwd} — git deposu değil, yapı çıkarılmadı.`);
  }
  return parcalar.join('\n');
}

/** Kancayı claude'a tanıtan ayar. `--settings` kullanıcının kendi
 *  `~/.claude/settings.json` dosyasının ÜSTÜNE yazmaz, yanına ekler: ölçüldü,
 *  yalnız kanca verilerek açılan oturumda kullanıcının dil ayarı korundu.
 *  Böylece dxc hiçbir kalıcı yapılandırma bırakmaz. */
function kancaAyari(): string {
  const alinti = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;
  const komut = `${alinti(process.execPath)} ${alinti(fileURLToPath(import.meta.url))} kanca`;
  return JSON.stringify({ hooks: { UserPromptSubmit: [{ hooks: [{ type: 'command', command: komut }] }] } });
}

/** İki kip: gerçek iş yapıldıysa tam gösteri, yapılmadıysa tek satır.
 *  0,2 sn'lik koşuyu altı satırlık banner ile boğmak istemiyoruz. */
async function baslat(argv: string[], acik: Set<string>): Promise<number> {
  const t0 = Date.now();
  // Nerede olduğumuz ucuz bilgi: kutuya girsin diye model çağrısından önce hesaplanır.
  const depo = iceridekiDepo(process.cwd());
  const nerede = depo ? basename(depo) : (basename(process.cwd()) || process.cwd());
  const buradaSatiri = `${ok()} buradasın: ${vurgu(nerede)}${depo ? '' : GIT_YOK}`;

  const metin = await baglam(buradaSatiri);
  const gecen = Date.now() - t0;

  if (sonTazeleme.isVar) {
    son(`${tik()} ${acik.has('kuru') ? 'kuru koşu' : 'claude başlatılıyor'} ${sure(gecen)}`);
  } else {
    kisaBaslik(`${vurgu(String(sonTazeleme.depoSayisi))} depo · ${vurgu(nerede)}${depo ? '' : GIT_YOK}`, gecen);
  }
  if (acik.has('kuru')) { console.log(metin); return 0; }
  const yol = join(tmpdir(), `dxc-${process.pid}.md`);
  yaz(yol, metin);
  const claudeBayraklari = argv.filter((a) => a !== '--kuru');
  // Bekleme sırasında basılan tuşlar terminal arabelleğinde birikir ve `stdio: 'inherit'`
  // ile claude'a gider: kazara mesaj gönderilmiş olur. Devretmeden önce temizlenir.
  const atilan = stdinBosalt();
  if (atilan) process.stderr.write(` ${atilan} karakterlik tuş girişi atıldı (bekleme sırasında yazılmıştı)\n`);
  return await new Promise((coz) => {
    const c = spawn('claude', ['--append-system-prompt-file', yol, '--settings', kancaAyari(), ...claudeBayraklari], {
      stdio: 'inherit',
      // Kanca ilk istemde açılışta verilen depoyu tekrar yazmasın diye devredilir.
      env: { ...process.env, [ACILIS_DEPO]: depo ?? '' },
    });
    c.on('error', (e) => { console.error(hata('dxc', `claude başlatılamadı (${e.message})`, 'Claude CLI kurulu mu')); coz(127); });
    c.on('exit', (k) => coz(k ?? 0));
  });
}

async function ana(): Promise<number> {
  const argv = process.argv.slice(2);
  const ilk = argv[0];
  // Kanca claude tarafından çağrılır, insan yazmaz: yardımda görünmez ve
  // hiçbir koşulda oturumu bozmaz, her hata yutulur.
  if (ilk === 'kanca') { try { await kancaCalistir(); } catch { /* sessiz */ } return 0; }
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
