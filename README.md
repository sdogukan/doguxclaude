<h1 align="center">doguxclaude</h1>

<p align="center">
  <b>Makineni zaten bilen Claude Code.</b><br>
  <sub>Terminale <code>dxc</code> yaz. Gerisi kendiliğinden.</sub>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/doguxclaude"><img src="https://img.shields.io/npm/v/doguxclaude?color=a855f7&labelColor=1a1a2e&label=npm" alt="npm"></a>
  <img src="https://img.shields.io/badge/kurulum-s%C4%B1f%C4%B1r%20ad%C4%B1m-a855f7?labelColor=1a1a2e" alt="sıfır kurulum">
  <img src="https://img.shields.io/badge/token-%2562%20daha%20az-22d3ee?labelColor=1a1a2e" alt="%62 daha az token">
  <img src="https://img.shields.io/badge/lisans-MIT-a855f7?labelColor=1a1a2e" alt="MIT">
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

```bash
npm install -g doguxclaude
dxc
```

<p align="center">
  <b>Alandaki her şey kurulum istiyor. Bu, tek komut.</b><br>
  <sub>Ötekiler Obsidian kurdurur, Docker ayağa kaldırtır, 39 yer tutucu doldurtur.<br>
  Burada kurulacak bir şey yok. Ezberlenecek komut yok. Sadece <code>dxc</code>.</sub>
</p>

```

 ██████╗  ██╗  ██╗  ██████╗
 ██╔══██╗ ╚██╗██╔╝ ██╔════╝
 ██║  ██║  ╚███╔╝  ██║
 ██║  ██║  ██╔██╗  ██║
 ██████╔╝ ██╔╝ ██╗ ╚██████╗
 ╚═════╝  ╚═╝  ╚═╝  ╚═════╝

   dogu x claude  ·  Dogu X Vibes

╭──────────────────────────────────────╮
│ ▸ 11 depo tarandı 220 ms             │
│ + Projects/web-app yeni depo         │
│ ~ Desktop/doguxclaude yapısı değişti │
│ ▸ buradasın: api-platform            │
╰──────────────────────────────────────╯
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

```
╭─ dxc olmadan ────────────────────────────────────╮
│ › api-platform nedir, tek cümle                  │
│                                                  │
│   ⎿ ls -d ~/*api-platform*     depoyu arıyor     │
│   ⎿ ls api-platform/           yapıyı arıyor     │
│   ⎿ cat README.md              ✗ böyle dosya yok │
│                                                  │
│   83.906 token · 15,8 sn                         │
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
│   48.915 token · 10,6 sn                            │
╰─────────────────────────────────────────────────────╯
```

Yapı bloğu kök dosyaları **ada ada** yazar. Artık tahmin etmiyor.

---

## Angarya koda, yargı modele

Bu alandaki araçların çoğu aynı refleksi paylaşıyor: **işi modele yaptır.**
Vektör veritabanı kur, gömme üret, her düzenlemede bir alt ajan çalıştır.

Biz tersini yapıyoruz. **Bir deponun yapısını çıkarmak okuma işidir, yargı değil.**
`git ls-files` bunu 10 ms'de yapar ve asla bayatlamaz. Modele yalnız gerçekten
yargı gerektiren tek şeyi soruyoruz: bu depo ne iş yapıyor, tek cümle, bir kez.

| Ne | Süre |
|---|---|
| 11 depoyu tara, haritayı tazele | **250 ms** |
| 1.120 dosyalık deponun yapısını çıkar | **10 ms** |
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

## Alanda ne var

| | Kurulum | Hafıza nasıl yazılır | Model maliyeti |
|---|---|---|---|
| [claude-code-memory-setup](https://github.com/lucasrosati/claude-code-memory-setup) <sub>966★</sub> | Obsidian + 3 eklenti, Graphify, Python paketi, cron | `/save` yazmayı hatırlarsan | — |
| [claudecode-harness](https://github.com/anothervibecoder-s/claudecode-harness) <sub>222★</sub> | Şablonu kopyala, **39 yer tutucu** doldur, kancayı kendin yaz | Model talimatı unutmazsa | — |
| [Claude-code-memory](https://github.com/Durafen/Claude-code-memory) <sub>74★</sub> | İki depo, **Docker, Qdrant**, gömme API anahtarı | İndeksleyiciyi çalıştırınca | Her düzenlemede 60 sn'ye kadar Sonnet |
| [clauth Hive Mind](https://github.com/umuplus/clauth) <sub>6★</sub> | Profil başına aç, **her oturum Y/n** onayla | Onaylarsan | Oturum başına tam ajan koşusu |
| **doguxclaude** | **Yok** | **Kendiliğinden** | **Oturum başına tek cümle** |

**İkisi araç bile değil.** 966 yıldızlı olanda 433 satır çalıştırılabilir kod ve
1.276 satır README var; `/save` ile `/resume` gerçek komut değil, CLAUDE.md içine
düzyazı yazılmış talimatlar. 222 yıldızlı olanda iki markdown dosyası var, tek bir
kod bloğu yok, bahsettiği kanca depoda mevcut değil.

**Rakamları da tutmuyor.** Biri "71,5 kat az token" diyor; kaynağı iki tahminin
bölümü ve aynı sayfa başka yerde "499 kat" yazıyor. Bir diğerinin README'sindeki
sayıların depoda tek bir benchmark karşılığı yok.

Bizim rakamlarımızın yöntemi aşağıda yazılı, kaybettiğimiz senaryo dahil.

### Nerede geridiyiz

**Derinlik.** Onlar tree-sitter ile fonksiyon ve sınıf düzeyine iniyor. Bizim
haritamız klasör ve dosya adında kalıyor.

**Kalıcılık.** Hafızamız 30 satır; otuz birinci gelince en eski kalıcı olarak
siliniyor. clauth'un wiki'si birikiyor ve aranabiliyor.

**Olgunluk.** Sıfır kullanıcı, şimdilik yalnız macOS'ta denendi.

Bunlar tercih. Arama ve grafik eklemek altyapı ister; altyapı da kurulum demek.
Biz sıfır kurulumu koruyoruz.

---

## Hafıza

Sen çıkarken o oturum tek cümleye iner ve haritanın altına yazılır. Ertesi gün
`dxc` yazdığında nerede kaldığın zaten orada.

```
## Hafıza

- 2026-09-06 · doguxclaude · Kanca sorulan deponun yapısını verecek şekilde
  değişti; npm yayını erişim anahtarına takıldı.
- 2026-09-05 · api-platform · Fargate akışı planlandı, CDK stack açık kaldı.
```

Otuz satır tavanı var, dosya şişmez. Arka planda koşar, terminal anında geri gelir.
Pencereyi kapatsan bile yazılır.

---

## Ölçüm

Aynı sorular, `dxc` ile ve `dxc` olmadan.

| Soru | Token | Süre | Tur |
|---|---|---|---|
| "Nerede kalmıştım" <br><sub>hafıza sayesinde</sub> | 357K → **136K** · %62 az | 81,5 → **41,3 sn** · %49 hızlı | 19,7 → 12,0 |
| "Bu depo nedir, nerede" <br><sub>harita + yapı sayesinde</sub> | 107K → **70K** · %35 az | 22,0 → **14,3 sn** · %35 hızlı | 5,8 → 4,5 |

Hafızasız oturumda model ne yaptığını **dosyalardan kazıyor**: git kayıtlarına
bakıyor, dosya saatlerine bakıyor, README'yi ve kaynak dosyaları açıyor. Yaklaşık
yirmi tur, seksen saniye.

Maliyet de **öngörülebilir** hale geliyor. Hafızasız üç koşu 196K, 412K ve 463K
token harcadı; arada iki buçuk kat fark var. Hafızalı koşular 99K, 147K, 163K.

**Her zaman kazanmaz.** Küçük bir depoda zaten derine inen bir soruda yapıyı
önceden vermek ajanı daha çok gezdirdi: %5 fazla token, %21 daha yavaş. dxc
"bu nedir, nerede, hangi dosya var" sorularında kazandırır.

<sub>İki depo (28 ve 1.120 dosya), iki soru tipi, hafıza için ayrı senaryo.
Harita ve yapıda ikişer, hafızada üçer koşu. Hafıza satırları elle yazılmadı,
sistemin gerçek oturum kayıtlarından ürettiği satırlar kullanıldı. Token, girdi
ve önbellek dahil toplam işlenen jetondur; `claude -p --output-format json`
çıktısından.</sub>

---

## Komutlar

```
dxc            başlat
dxc sifirla    haritayı sıfırdan üret
```

Hepsi bu. `~/.claude/settings.json` dosyana hiçbir şey yazılmaz.

Kurallar ve ölçümler: [`NE-YAPIYOR.md`](NE-YAPIYOR.md) · Tasarım: [`TASLAK.md`](TASLAK.md)

---

## English

`dxc` starts Claude Code with your machine already in context: a **map** of every
git repo, the **structure** of the repo you ask about (from `git ls-files`, 10 ms),
and a **memory** of your last 30 sessions (one sentence each, written on exit).

**Grunt work in code, judgement in the model.** Extracting a repo's structure is a
reading, not a judgement, so code does it and it never goes stale. The model is
asked only what this repo is for, one sentence, once per repo.

Measured, same questions with and without dxc. On "where did I leave off", memory
cuts **62% of tokens** and **49% of time**. On "what is this repo", the map and
structure cut **35%** of both. Cost also becomes predictable: without memory three
runs spent 196K, 412K and 463K tokens; with memory, 99K, 147K, 163K.

Setup for the alternatives ranges from six tools and a cron job, to Docker plus
Qdrant plus an embeddings API key, to filling in 39 placeholders. Setup here:

```bash
npm install -g doguxclaude && dxc
```

Where we are behind: no AST, no semantic search, and memory is capped at 30 lines
before the oldest is dropped for good. Trade-offs for zero setup, listed above
rather than hidden.

<p align="center">
  <sub>MIT · Doğukan Şahin · <a href="https://github.com/sdogukan">Dogu X Vibes</a></sub>
</p>
