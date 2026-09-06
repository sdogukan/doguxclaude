#!/usr/bin/env node
/** dxc — Claude Code'u makinendeki depoların haritasıyla başlatır.
 *
 *  İnsan yüzeyi tek komut: `dxc`. Diğerleri tanı içindir, ezberlenmesi gerekmez. */
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { haritaOku, haritaTazele } from './harita.js';
import { kisaBaslik, kutuBas, ok, satir, son, stdinBosalt, sure, tik, vurgu } from './ekran.js';
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
  kutuBas();
  son(`${tik()} harita ${vurgu(HARITA_YOLU)} ${sure(s.kodMs + s.modelMs)}`);
  return 0;
}

/** Enjekte edilen yapının nasıl kullanılacağı. Liste tek başına yönlendirmiyor:
 *  ölçüldü, ajan yapıyı elinde olduğu halde `ls` ile baştan keşfetti (6 araç çağrısı). */
const YONERGE = [
  'Aşağıdaki klasör yapısı `git ls-files` çıktısından üretildi ve günceldir.',
  'Yapıyı öğrenmek için `ls`, `find`, `tree` çalıştırma; sayılar klasörün altındaki dosya sayısıdır.',
  'Bu özet dosya İÇERİĞİNİ, satır sayılarını ve fonksiyon adlarını içermez; onlar gerekiyorsa doğrudan ilgili dosyayı oku.',
  'Deponun kendi CLAUDE.md dosyası varsa geçerliliğini korur: bu özet onun yerine geçmez, yalnız yapıyı tekrar keşfetme yükünü kaldırır.',
].join('\n');

/** Her açılışta depolar taranır (9 ms, bedava) ve harita gerekiyorsa tazelenir.
 *  Yeni depo eklendiyse yalnız onun açıklaması yazdırılır; var olanlara dokunulmaz.
 *  Kullanıcı hiçbir şey kurmaz, hiçbir komut ezberlemez: terminale `dxc` yazar. */
let sonTazeleme = { isVar: false, depoSayisi: 0 };

async function haritaSagla(): Promise<string> {
  const s = await haritaTazele();
  sonTazeleme = { isVar: s.isVar, depoSayisi: s.depolar.length };
  return (haritaOku() ?? '').trim();
}

async function baglam(): Promise<string> {
  const cwd = process.cwd();
  const depo = iceridekiDepo(cwd);
  const parcalar: string[] = [];
  const harita = await haritaSagla();
  if (harita) parcalar.push(harita);
  else parcalar.push('# Harita\n\nÜretilemedi.');

  if (depo) {
    const o = depoOzeti(depo);
    parcalar.push(`\n---\n\n# Bu depo: ${basename(depo)}\n\n${depo} · ${o.dosyaSayisi} dosya\n\n${YONERGE}\n\n\`\`\`\n${o.metin}\n\`\`\``);
  } else {
    parcalar.push(`\n---\n\n# Bu klasör\n\n${cwd} — git deposu değil, yapı çıkarılmadı.`);
  }
  return parcalar.join('\n');
}

/** İki kip: gerçek iş yapıldıysa tam gösteri, yapılmadıysa tek satır.
 *  0,2 sn'lik koşuyu altı satırlık banner ile boğmak istemiyoruz. */
async function baslat(argv: string[], acik: Set<string>): Promise<number> {
  const t0 = Date.now();
  const metin = await baglam();   // satırlar burada birikir, kip sonra belli olur
  const depo = iceridekiDepo(process.cwd());
  // BULUNDUĞUN klasörü anlatır, haritadaki depoları değil: ikisi karışmasın.
  const nerede = depo ? basename(depo) : (basename(process.cwd()) || process.cwd());
  const gecen = Date.now() - t0;

  if (sonTazeleme.isVar) {
    satir(`${ok()} buradasın: ${vurgu(nerede)}${depo ? '' : GIT_YOK}`);
    kutuBas();
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
    const c = spawn('claude', ['--append-system-prompt-file', yol, ...claudeBayraklari], { stdio: 'inherit' });
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
