<h1 align="center">doguxclaude</h1>

<p align="center">
  <b>Makineni zaten bilen Claude Code.</b><br>
  <sub>Terminale <code>dxc</code> yaz. Gerisi kendiliğinden.</sub>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/doguxclaude"><img src="https://img.shields.io/npm/v/doguxclaude?color=a855f7&labelColor=1a1a2e&label=npm" alt="npm"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A522-22d3ee?labelColor=1a1a2e" alt="node">
  <img src="https://img.shields.io/badge/ayar-s%C4%B1f%C4%B1r-a855f7?labelColor=1a1a2e" alt="sıfır ayar">
  <img src="https://img.shields.io/badge/lisans-MIT-22d3ee?labelColor=1a1a2e" alt="MIT">
</p>

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

<p align="center"><sub>İlk açılış haritayı çıkarır. Sonraki her açılış tek satır, çeyrek saniye.</sub></p>

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

Claude Code'a bir depoyu sorduğunda aramaya çıkar. Gerçek oturumlarda ölçüldü.

```
╭─ dxc olmadan ──────────────────────────────────╮
│ › api-platform nedir, tek cümle                │
│                                                │
│   ⎿ ls                                         │
│   ⎿ find . -type f | head -80                  │
│   ⎿ cat README.md        ✗ böyle bir dosya yok │
│   ⎿ cat CLAUDE.md                              │
│                                                │
│   3 araç çağrısı · 10.494 bayt · 20 sn         │
╰────────────────────────────────────────────────╯
```

Ajan, olmayan bir `README.md`'yi tahmin etti ve hata aldı. O depoda `CLAUDE.md`
var. Bilmesinin bir yolu yoktu.

```
╭─ dxc ile ──────────────────────────────────────╮
│ › api-platform nedir, tek cümle                │
│                                                │
│   yapı zaten elinde. 1.120 dosya, kök dosyalar │
│   ada ada yazılı, CLAUDE.md orada görünüyor.   │
│                                                │
│   ⎿ cat CLAUDE.md                              │
│                                                │
│   1 araç çağrısı · 647 token · tahmin yok      │
╰────────────────────────────────────────────────╯
```

Yapı bloğu kök dosyaları **ada ada** yazar. Artık tahmin etmiyor.

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

Structure is a reading, not a judgement, so code does it. Only the one-line
description is a judgement, so the model does it once per repo. Scanning 11 repos
takes 250 ms. Output does not grow with the codebase: 1,120 files become 72 lines.

Nothing is written to `~/.claude/settings.json`. Zero config, nothing to memorise.

```bash
npm install -g doguxclaude && dxc
```

<p align="center">
  <sub>MIT · Doğukan Şahin · <a href="https://github.com/sdogukan">Dogu X Vibes</a></sub>
</p>
