<h1 align="center">doguxclaude</h1>

<p align="center">
  <b>Makineni zaten bilen Claude Code.</b><br>
  <sub>Terminale <code>dxc</code> yaz. Gerisi kendiliğinden.</sub>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/doguxclaude"><img src="https://img.shields.io/npm/v/doguxclaude?color=a855f7&labelColor=1a1a2e&label=npm" alt="npm"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A522-22d3ee?labelColor=1a1a2e" alt="node">
  <img src="https://img.shields.io/badge/token-%2535%20daha%20az-a855f7?labelColor=1a1a2e" alt="%35 daha az token">
  <img src="https://img.shields.io/badge/haf%C4%B1za-%2562%20daha%20az-22d3ee?labelColor=1a1a2e" alt="hafıza %62 daha az">
  <img src="https://img.shields.io/badge/lisans-MIT-22d3ee?labelColor=1a1a2e" alt="MIT">
</p>

```
╭──────────────────────┬──────────────────────┬──────────────────────╮
│                      │                      │                      │
│         %62          │         %49          │         %35          │
│    DAHA AZ TOKEN     │      DAHA HIZLI      │    DAHA AZ TOKEN     │
│                      │                      │                      │
│   "nerede kaldım"    │   "nerede kaldım"    │   "bu depo nedir"    │
│     357K → 136K      │    82 sn → 41 sn     │      107K → 70K      │
│                      │                      │                      │
│        hafıza        │        hafıza        │    harita + yapı     │
╰──────────────────────┴──────────────────────┴──────────────────────╯
           aynı sorular, dxc ile ve dxc olmadan · üçer koşu           
```

<p align="center"><sub>aynı sorular, <code>dxc</code> ile ve <code>dxc</code> olmadan · ikişer koşu · <a href="#ölçüm">ölçüm ayrıntısı</a></sub></p>

```bash
npm install -g doguxclaude
dxc
```

```

 ██████╗  ██╗  ██╗  ██████╗
 ██╔══██╗ ╚██╗██╔╝ ██╔════╝
 ██║  ██║  ╚███╔╝  ██║
 ██║  ██║  ██╔██╗  ██║
 ██████╔╝ ██╔╝ ██╗ ╚██████╗
 ╚═════╝  ╚═╝  ╚═╝  ╚═════╝

   dogu x claude  ·  Dogu X Vibes

 ╭──────────────────────────────────────────╮
 │ ▸ 11 depo tarandı 220 ms                 │
 │ + Projects/web-app yeni depo             │
 │ ~ Desktop/doguxclaude yapısı değişti     │
 │ ▸ buradasın: api-platform                │
 ╰──────────────────────────────────────────╯
 ✔ claude başlatılıyor 187 ms
```

<p align="center">
  <b>Her açılışta sıfır model çağrısı.</b> Harita güncelse tarama 250 ms, oturum açılır.
</p>

---

## Üç şey yapar

```
╭───────────────╮   ╭───────────────╮   ╭───────────────╮
│    HARİTA     │   │     YAPI      │   │    HAFIZA     │
│               │   │               │   │               │
│  nerede ne    │   │  içinde ne    │   │  ne konuştuk  │
│     var       │   │     var       │   │               │
│               │   │               │   │               │
│  11 depo      │   │  10 ms        │   │  30 oturum    │
│  tek satır    │   │  koddan       │   │  tek cümle    │
╰───────────────╯   ╰───────────────╯   ╰───────────────╯
     her açılış        adını anınca         çıkarken
```

---

## Neden

Claude Code'a bir depoyu sorduğunda önce onu **aramaya** çıkar. Nerede olduğunu
bilmez, içinde ne olduğunu bilmez, hangi dosyanın var olduğunu bilmez.

Aynı soru, aynı depo, üçer kez ölçüldü.

```
╭─ dxc olmadan ────────────────────────────────────╮
│ › api-platform nedir, tek cümle                  │
│                                                  │
│   ⎿ ls -d ~/*api-platform*     depoyu arıyor     │
│   ⎿ ls api-platform/           yapıyı arıyor     │
│   ⎿ cat README.md              ✗ böyle dosya yok │
│                                                  │
│   66.264 token · 13,4 sn · 4,0 tur               │
╰──────────────────────────────────────────────────╯
```

Ajan, olmayan bir `README.md`'yi tahmin etti ve hata aldı. O depoda `CLAUDE.md`
var. Bilmesinin bir yolu yoktu.

```
╭─ dxc ile ───────────────────────────────────────────╮
│ › api-platform nedir, tek cümle                     │
│                                                     │
│   harita ve yapı zaten elinde, arama yok            │
│   ⎿ cat CLAUDE.md              doğrudan doğru dosya │
│                                                     │
│   48.180 token · 9,8 sn · 2,5 tur                   │
╰─────────────────────────────────────────────────────╯
```

Yapı bloğu kök dosyaları **ada ada** yazar. Artık tahmin etmiyor.

### Ölçüm
<a id="ölçüm"></a>

Aynı sorular, `dxc` ile ve `dxc` olmadan, her biri ikişer koşu.

| Soru | Token | Süre | Tur |
|---|---|---|---|
| "Bu depo nedir, nerede" <br><sub>harita + yapı sayesinde</sub> | 107K → **70K** · %35 az | 22,0 → **14,3 sn** · %35 hızlı | 5,8 → 4,5 |
| "Nerede kalmıştım" <br><sub>hafıza sayesinde</sub> | 357K → **136K** · %62 az | 81,5 → **41,3 sn** · %49 hızlı | 19,7 → 12,0 |

Hafızasız oturumda model ne yaptığını **dosyalardan kazıyor**: git kayıtlarına
bakıyor, dosya saatlerine bakıyor, README'yi, tasarım notlarını ve kaynak
dosyaları açıyor. Yaklaşık yirmi tur, seksen saniye. Hafıza satırı elindeyken
cevabı zaten biliyor, kalan iş yalnız doğrulamak.

Maliyet de **öngörülebilir** hale geliyor. Hafızasız üç koşu 196K, 412K ve 463K
token harcadı, arada iki buçuk kat fark var: model her seferinde başka bir kazı
yolu deniyor. Hafızalı koşular 99K, 147K ve 163K.

**Her zaman kazanmaz.** Ölçtüğüm dördüncü bir senaryoda kaybetti: küçük bir
depoda "paketler ne işe yarıyor" gibi zaten derine inen bir soruda yapıyı
önceden vermek ajanı daha çok gezdirdi (%5 fazla token, %21 daha yavaş).
dxc "bu nedir, nerede, hangi dosya var" sorularında kazandırır; zaten kazı
gerektiren bir soruda etkisi küçülür.

<sub>Ölçüm: iki depo (28 ve 1.120 dosya), iki soru tipi, hafıza için ayrı bir
senaryo. Harita ve yapı senaryolarında ikişer, hafızada üçer koşu, bu makine.
Hafıza satırları elle yazılmadı, sistemin gerçek oturum kayıtlarından ürettiği
satırlar kullanıldı. Token, girdi ve önbellek dahil toplam işlenen jetondur;
`claude -p --output-format json` çıktısından.</sub>

---

## Nasıl bu kadar hızlı

> **Yapı bir okumadır, yargı değil.** O yüzden onu kod yapar.
> Yalnız tek satırlık açıklama yargıdır. Onu model yapar, depo başına bir kez,
> klasör adları değişene kadar bir daha da yapmaz.

| Ne | Süre |
|---|---|
| 11 depoyu tara, haritayı tazele | **250 ms** |
| 1.120 dosyalık deponun yapısını çıkar | **10 ms** |
| Enjeksiyon kancası | **95 ms** |
| Oturumu tek cümleye indir | **6 sn**, arka planda |

Çıktı kod tabanıyla büyümez:

```
    28 dosya  ▏████                      14 satır
   246 dosya  ▏███████████               41 satır
 1.120 dosya  ▏████████████████████      72 satır
```

Bir klasör, dosyaların en az **yüzde ikisini** tutuyorsa açılır. Küçük kardeşler
tek satıra toplanır ama **adların tamamı yazılır**. Ölçüldü: üç örnek verilince
ajan kalanları öğrenmek için `ls` çalıştırıyordu.

---

## Sıfır ayar

`~/.claude/settings.json` dosyana **hiçbir şey yazılmaz.** Kanca her koşuda
`--settings` ile veriliyor, senin kendi ayarların olduğu gibi kalıyor.

Kurulacak bir şey yok. Yapılandırma yok. Ezberlenecek komut yok.

---

## Hafıza

Sen çıkarken, o oturum tek cümleye iner ve haritanın altına yazılır.
Ertesi gün `dxc` yazdığında nerede kaldığın zaten orada.

```
## Hafıza

Son oturumlar, en yeni üstte.

- 2026-09-06 · doguxclaude · Kanca sorulan deponun yapısını verecek
  şekilde değişti, npm anahtarları güçlendirildi; yayın 2FA'ya takılı.
- 2026-09-05 · api-platform · Fargate akışı planlandı, CDK stack açık.
```

Otuz satır tavanı var. Otuz birinci gelince en eski düşer. Dosya şişmez.

Arka planda koşar, terminal anında geri gelir.

---

## Neden başka türlü

Bu alandaki araçların çoğu aynı refleksi paylaşıyor: **işi modele yaptır.**
Vektör veritabanı kur, gömme üret, her düzenlemede bir alt ajan çalıştır, her
oturumda bir analiz koşusu aç.

Biz tersini yapıyoruz. **Bir deponun yapısını çıkarmak okuma işidir, yargı
değil.** Okumaya model koşmak hem yavaş hem pahalı. `git ls-files` bunu 10 ms'de
yapıyor ve asla bayatlamıyor. Modele yalnızca gerçekten yargı gerektiren tek şeyi
soruyoruz: bu depo ne iş yapıyor, tek cümle, depo başına bir kez.

Angaryayı kod hallediyor. Model zaten zeki, ona sadece gerekeni veriyoruz.

### Alanda ne var

| | Kurulum | Hafıza nasıl yazılır | Model maliyeti | Ölçüm |
|---|---|---|---|---|
| [claude-code-memory-setup](https://github.com/lucasrosati/claude-code-memory-setup) <sub>966★</sub> | Obsidian + 3 eklenti, Graphify, Python paketi, tarayıcı eklentisi, cron | `/save` yazmayı hatırlarsan | AST modunda yok | Yok. "71,5x" iki tahminin bölümü; aynı sayfa başka yerde "499x" diyor |
| [claudecode-harness](https://github.com/anothervibecoder-s/claudecode-harness) <sub>222★</sub> | Şablonu kopyala, 39 yer tutucu doldur, Stop kancasını kendin yaz | Model talimatı unutmazsa | — | Yok |
| [Claude-code-memory](https://github.com/Durafen/Claude-code-memory) <sub>74★</sub> | İki ayrı depo, Docker, Qdrant, gömme API anahtarı, proje başına koleksiyon | İndeksleyiciyi çalıştırınca | Her Write/Edit'te 60 sn'ye kadar bloklayan Sonnet alt süreci | README'de sayılar var, depoda benchmark yok |
| [clauth Hive Mind](https://github.com/umuplus/clauth) <sub>6★</sub> | Profil başına aç, her oturum sonu Y/n onayla | Onaylarsan | Oturum başına tam ajan koşusu | Yok |
| **doguxclaude** | **Yok** | **Kendiliğinden** | **Oturum başına tek cümle** | **Üçer koşu, yöntem sayfada** |

İki tanesi araç bile değil. 966 yıldızlı olanda 433 satır çalıştırılabilir kod ve
1.276 satır README var; `/save` ile `/resume` gerçek komut değil, CLAUDE.md içine
düzyazı yazılmış talimatlar. 222 yıldızlı olanda iki markdown dosyası var, tek bir
kod bloğu yok, bahsettiği Stop kancası depoda mevcut değil.

### Nerede geridiyiz

Bunu saklamıyoruz, çünkü rakiplerin en çok kaybettiği yer burası.

**Derinlik.** Graphify ve Qdrant tabanlı indeksleyici tree-sitter ile fonksiyon ve
sınıf düzeyine iniyor, çağrı ve kalıtım grafiği çıkarıyor. Bizim haritamız klasör
ve dosya adında kalıyor. "Bu fonksiyona benzer başka nerede var" diye soramazsın.

**Kalıcılık.** Hafızamızın tavanı 30 satır ve otuz birinci gelince en eski
**kalıcı olarak siliniyor**. clauth'un wiki'si birikiyor, kategorilere ayrılıyor,
aranabiliyor. Bizde arama yok, sadece enjeksiyon var.

**Olgunluk.** Sıfır kullanıcı. Şimdilik yalnız macOS'ta denendi.

Bunlar tercih, eksik değil. Aramayı ve grafiği eklemek altyapı istiyor; altyapı
istemek de kurulum demek. Biz sıfır kurulumu koruyoruz.

---

## Komutlar

```
dxc                 başlat (claude bayrakları olduğu gibi geçer)
dxc --kuru          başlatmadan, enjekte edilecek metni göster
dxc harita          haritayı yeniden üret (--zorla, --modelsiz, --goster)
dxc ozet [klasör]   bir deponun yapısını çıkar (kod, model yok)
```

## Nerede ne duruyor

| Yol | Ne | Oturuma yüklenir mi |
|---|---|---|
| `~/.doguxclaude/index.md` | harita **ve** hafıza | evet |
| `~/.doguxclaude/durum.json` | şekil parmak izleri | hayır |
| `~/.doguxclaude/oturum/` | oturum içi iz | hayır |

Kurallar ve ölçümler: [`NE-YAPIYOR.md`](NE-YAPIYOR.md) · Tasarım: [`TASLAK.md`](TASLAK.md)

---

## English

`dxc` starts Claude Code with your machine already in context. Three things:
a **map** of every git repo (one line each), the **structure** of the repo you
ask about (injected the moment you name it, extracted from code in 10 ms), and
a **memory** of your last 30 sessions (one sentence each, written on exit).

**Measured, same questions with and without dxc.** On "where did I leave off",
memory cuts **62% of the tokens** and **49% of the time** (357K → 136K, 82 s → 41 s).
On "what is this repo", the map and structure cut **35%** of both. One scenario
got worse, a deep question in a tiny repo, and it is in the table below rather
than hidden.

Cost also becomes predictable. Without memory, three runs of the same question
spent 196K, 412K and 463K tokens: the agent improvises a different dig each time.
With memory: 99K, 147K, 163K.

Structure is a reading, not a judgement, so code does it. Only the one-line
description is a judgement, so the model does it once per repo. Scanning 11 repos
takes 250 ms. Output does not grow with the codebase: 1,120 files become 72 lines.

Nothing is written to `~/.claude/settings.json`. Zero config, nothing to memorise.

**Why it is built this way.** Most tools in this space reach for the model: a
vector database, embeddings, a subagent on every edit, an analysis run every
session. Extracting a repo's structure is a reading, not a judgement, so code
does it in 10 ms and it never goes stale. The model is asked only the one thing
that is genuinely a judgement: what this repo is for, one sentence, once per repo.

Setup for the alternatives ranges from six tools and a cron job, to Docker plus
Qdrant plus an embeddings API key, to copying a template and filling in 39
placeholders. Setup here is `npm install -g doguxclaude`.

Where we are behind: no AST, no semantic search, and memory is capped at 30 lines
before the oldest is dropped for good. Those are trade-offs for zero setup, and
they are in the comparison table above rather than hidden.

```bash
npm install -g doguxclaude && dxc
```

<p align="center">
  <sub>MIT · Doğukan Şahin · <a href="https://github.com/sdogukan">Dogu X Vibes</a></sub>
</p>
