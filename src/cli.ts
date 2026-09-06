#!/usr/bin/env node
/** dxc — Claude Code'u makinendeki depoların haritasıyla başlatır.
 *
 *  İnsan yüzeyi tek komut: `dxc`. Diğerleri tanı içindir, ezberlenmesi gerekmez. */
import { spawn } from 'node:child_process';
import { readdirSync, rmSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { depoBlogu } from './baglam.js';
import { haritaOku, haritaTazele, mevcutAciklamalar } from './harita.js';
import { konusmaKuyrugu, oturumCumlesi, oturumYaz } from './hafiza.js';
import { ACILIS_DEPO, kancaCalistir, KOSU, kosuYolu, OTURUM_DIZINI, projeAdi } from './kanca.js';
import { kisaBaslik, ok, son, stdinBosalt, sure, tik, vurgu } from './ekran.js';
import { depoOzeti } from './ozet.js';
import { iceridekiDepo } from './tarama.js';
import { hata, HARITA_YOLU, oku, yaz } from './util.js';

/** Git deposu olmayan klasör için soluk not. */
const GIT_YOK = ' \x1b[2m(git deposu değil, yapı verilmedi)\x1b[0m';

const KULLANIM = `dxc — Claude'u makinendeki depoların haritasıyla başlatır

  dxc            başlat. Kurulum yok, yapılandırma yok, ezberlenecek komut yok.
                 Claude bayrakları olduğu gibi geçer.

  dxc sifirla    haritayı sıfırdan üret. Bir depo yanlış anlaşıldıysa kullan.

Tanı komutları (gerekmez): --kuru, harita, ozet
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
  yetimleriSupur();   // kapanışı kaçırılmış oturumlar burada toplanır
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
  const kosu = `${process.pid}-${Date.now()}`;
  return await new Promise((coz) => {
    const c = spawn('claude', ['--append-system-prompt-file', yol, '--settings', kancaAyari(), ...claudeBayraklari], {
      stdio: 'inherit',
      // ACILIS_DEPO: kanca ilk istemde açılışta verilen depoyu tekrar yazmasın.
      // KOSU: kanca oturumun kayıt dosyasını bu kimlikle bıraksın, çıkışta okunsun.
      env: { ...process.env, [ACILIS_DEPO]: depo ?? '', [KOSU]: kosu },
    });
    c.on('error', (e) => { console.error(hata('dxc', `claude başlatılamadı (${e.message})`, 'Claude CLI kurulu mu')); coz(127); });
    c.on('exit', (k) => { hafizayiArkadaYaz(kosu, depo ? basename(depo) : '-'); coz(k ?? 0); });

    // Pencere kapatılınca (Cmd+W) işletim sistemi SIGHUP gönderir ve dxc ölür;
    // `exit` olayı hiç gelmez. O yüzden sinyali yakalayıp hafızayı ölmeden önce
    // başlatıyoruz. Yazıcı `detached` olduğu için kendi süreç grubunda kalır ve
    // bizimle birlikte ölmez. SIGINT yakalanmaz: Ctrl+C oturumu bitirmez,
    // claude'un kendi işidir; yakalarsak yarım oturumu hafızaya yazarız.
    for (const sinyal of ['SIGHUP', 'SIGTERM'] as const) {
      process.once(sinyal, () => { hafizayiArkadaYaz(kosu, depo ? basename(depo) : '-'); process.exit(0); });
    }
  });
}

/** Kapanışı kaçırılmış oturumları toplar.
 *
 *  Neden gerekli (canlı oturumda ölçüldü): `dxc` claude'un çıkışını bekleyen ana
 *  süreçtir. `/exit` ile çıkarsan hafıza yazılır. Ama terminal PENCERESİNİ
 *  kapatırsan işletim sistemi dxc'yi de öldürür ve yazacak vakti olmaz; iz dosyası
 *  ortada kalır. İnsanlar pencereyi kapatır, yani bu kenar durum değil.
 *
 *  Sinyal yakalamak yerine süpürme seçildi: SIGKILL ya da elektrik kesintisi de
 *  yakalanmaz, süpürme hepsini toplar. İzin adındaki pid hâlâ yaşıyorsa o oturum
 *  sürüyor demektir, ona dokunulmaz. */
function yetimleriSupur(): void {
  let adlar: string[];
  try { adlar = readdirSync(OTURUM_DIZINI); } catch { return; }
  for (const ad of adlar) {
    const m = /^kosu-(\d+)-(\d+)\.txt$/.exec(ad);
    if (!m) continue;
    const pid = Number(m[1]);
    const yas = Date.now() - Number(m[2]);
    // Süreç yaşıyorsa oturum sürüyor. Bir günden eskiyse pid yeniden kullanılmış olabilir.
    if (yas < 86_400_000 && yasiyor(pid)) continue;
    const yol = join(OTURUM_DIZINI, ad);
    const [kayit, proje] = (oku(yol) ?? '').split('\n');
    try { rmSync(yol, { force: true }); } catch { /* yoksa sorun değil */ }
    if (!kayit) continue;
    arkaPlandaOzetle(kayit.trim(), (proje || projeyiYoldanCikar(kayit.trim())).trim());
  }
}

/** Proje adı ize yazılmamışsa (eski biçim) kayıt yolundan çıkarır.
 *  Claude Code kayıtları `~/.claude/projects/<slug>/` altında tutar; slug, çalışma
 *  dizininin harf-rakam dışındaki her karakteri `-` yapılmış halidir. Haritadaki
 *  depoların slug'ını hesaplayıp eşleştiriyoruz: tahmin değil, birebir karşılaştırma. */
function projeyiYoldanCikar(kayitYolu: string): string {
  const slug = basename(dirname(kayitYolu));
  for (const goreli of mevcutAciklamalar().keys()) {
    const tam = join(homedir(), goreli);
    if (tam.replace(/[^A-Za-z0-9]/g, '-') === slug) return basename(tam);
  }
  // Depoya denk gelmiyorsa slug'ı yola çevirip klasör adını kullan.
  // Slug'da her ayraç '-' olduğu için yol birebir geri gelmez; ad yeterli.
  return projeAdi(slug === '-' ? '/' : slug.replace(/-/g, '/'));
}

function yasiyor(pid: number): boolean {
  try { process.kill(pid, 0); return true; } catch { return false; }
}

/** Özetlemeyi ayrı, kopuk bir süreçte başlatır: terminal beklemez. */
function arkaPlandaOzetle(kayit: string, proje: string): void {
  const cocuk = spawn(process.execPath, [fileURLToPath(import.meta.url), 'hafiza-yaz', kayit, proje],
    { detached: true, stdio: 'ignore' });
  cocuk.unref();
}

/** Oturum kapanınca hafıza satırını ARKA PLANDA yazdırır: terminal anında geri döner.
 *  Kanca hiç çalışmadıysa kayıt yolu yoktur; o zaman yazacak bir şey de yoktur. */
function hafizayiArkadaYaz(kosu: string, proje: string): void {
  const isaret = kosuYolu(kosu);
  const kayit = oku(isaret);
  try { rmSync(isaret, { force: true }); } catch { /* yoksa sorun değil */ }
  const [yolu, kayitliProje] = (kayit ?? '').split('\n');
  if (!yolu) return;
  arkaPlandaOzetle(yolu.trim(), (kayitliProje || proje).trim());
}

/** Arka plan komutu: konuşmayı özetleyip haritanın hafıza bölümüne ekler. */
function komutHafizaYaz(konum: string[]): number {
  const [kayit, proje] = konum;
  if (!kayit || !proje) return 1;
  const o = oturumCumlesi(konusmaKuyrugu(kayit));
  // Klasörü model söyler; istem bunu zorunlu kılıyor. Yine de boş dönerse
  // açılış yerine düşülür ki satır hiçbir zaman etiketsiz kalmasın.
  if (o) oturumYaz(o.proje ?? (proje === '-' ? null : proje), o.cumle);
  return 0;
}

async function ana(): Promise<number> {
  const argv = process.argv.slice(2);
  const ilk = argv[0];
  // Kanca claude tarafından çağrılır, insan yazmaz: yardımda görünmez ve
  // hiçbir koşulda oturumu bozmaz, her hata yutulur.
  if (ilk === 'kanca') { try { await kancaCalistir(); } catch { /* sessiz */ } return 0; }
  if (ilk === 'help' || ilk === '--help' || ilk === '-h') { console.log(KULLANIM); return 0; }
  if (ilk === 'hafiza-yaz') return komutHafizaYaz(argv.slice(1));
  // 'sifirla' insan yüzeyidir; 'harita' ve 'ozet' tanı içindir, ezberlenmesi gerekmez.
  if (ilk === 'sifirla') return komutHarita(new Set(['zorla']));
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
