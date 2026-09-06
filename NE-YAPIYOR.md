# Ne yapıyor

dxc iki şey yapar. Biri **harita**, öbürü **yapı enjeksiyonu**. İkisi de aynı
kod tarafından, aynı kurallarla üretilir.

---

## 1. Harita — `~/.doguxclaude/index.md`

### Nedir

Makinendeki bütün git depolarının tek satırlık listesi. Her deponun yanında ne
iş yaptığını anlatan bir cümle, dosya sayısı ve son değişiklik tarihi vardır.

Her oturumun başında sisteme yüklenir. Böylece model, sen yolunu söylemeden
hangi deponun nerede olduğunu bilir.

### Nasıl oluşur

1. Ev dizininden aşağı taranır. İki kural: **nokta ile başlayan klasöre girilmez**
   (araç üretimi depolar orada), **bir depo bulununca içine inilmez** (proje
   içindeki derleme çıktısı da depo olabilir).
2. Her depo için klasör yapısı çıkarılır (kurallar aşağıda). Bu adım koddur,
   model yoktur.
3. Yapılar modele verilir. Model her depo için **tek cümle** yazar. Yalnız klasör
   ve dosya adlarından çıkarabildiğini yazar; emin olmadığına "belirsiz" der.
4. Sonuç `index.md`'ye yazılır.

### Ne zaman yenilenir

Her `dxc` çalıştırışında depolar yeniden taranır. Tarama bedavadır, ölçüldü:
11 depo, 178 ms.

Model yalnız iki durumda çalışır:

- **yeni bir depo eklenmişse**
- **var olan bir deponun klasör ADLARI değişmişse**

Dosya sayısının değişmesi yenileme yapmaz. Sebebi basit: açıklama klasör
adlarından çıkarılıyor, dosya sayısı deponun ne iş yaptığını değiştirmiyor.

Bunu ölçen şey **şekil parmak izi**: yapı metninden bütün sayılar silinir,
kalan ad ağacının özeti alınır. Ad ağacı aynıysa açıklama hâlâ geçerlidir.

Parmak izleri `durum.json`'da tutulur, `index.md`'de değil. Çünkü `index.md`
her oturuma yükleniyor ve makine verisi orada boşuna token harcar.

---

## 2. Yapı enjeksiyonu

### Nedir

İçinde bulunduğun deponun klasör ağacı. Koddan üretilir, ölçüldü: 8-11 ms.
Model çalışmaz, hiçbir yerde saklanmaz, o anda üretilir.

### Ne zaman verilir

- **`dxc` yazdığın anda**, bulunduğun klasörün deposu için. Sistem istemine girer.
- **Oturum içinde başka bir depoya girdiğinde**, o depo için. `UserPromptSubmit`
  kancası ile gelir.

Aynı depoda kaldığın sürece hiçbir şey verilmez. Maliyet yalnız geçişte ödenir.

Kanca `claude --settings` ile geçici olarak tanıtılır. Senin
`~/.claude/settings.json` dosyana **hiçbir şey yazılmaz**; ölçüldü, yalnız kanca
verilerek açılan oturumda kullanıcının kendi ayarları korunuyor.

### İçinde ne var

- kök dosyaların **hepsi**, ada ada
- klasörler, yanında altındaki toplam dosya sayısı
- klasör içindeki dosya adları **yok**

Bir de dört satırlık yönerge: yapıyı öğrenmek için `ls`/`find`/`tree` çalıştırma,
bu özet dosya içeriğini içermez, deponun kendi CLAUDE.md'si geçerliliğini korur.

Bu yönerge ölçümle eklendi: aynı soruda ajanın araç çağrısı 6'dan 1'e düştü.

---

## Yapı çıkarma kuralları

Aynı altı kural hem harita hem enjeksiyon için geçerlidir.

1. **Dosya listesi `git ls-files`'tan gelir.** `node_modules`, `dist`, `.gitignore`
   içindeki her şey kendiliğinden düşer. Ayrı dışlama listesi tutulmaz.
2. **Bir klasörün ağırlığı, altındaki toplam dosya sayısıdır.** Alt klasörler dahil.
3. **Eşik, toplam dosyanın ellide biridir** (yüzde iki), en az 3.
4. **Ağırlığı eşiğin üstündeki klasörün içine inilir**, altındakinin inilmez.
   Eşiğin altındakinin yalnız adı ve sayısı yazılır.
5. **Yan yana dörtten fazla küçük klasör tek satıra toplanır**, ama adların
   TAMAMI yazılır. Ölçüldü: üç örnek verilince ajan kalanları öğrenmek için
   `ls` çalıştırıyordu.
6. **En fazla altı seviye inilir.**

Eşiğin oran olmasının sebebi: sabit derinlikte büyük depoda çıktı patlar, küçük
depoda hiçbir şey görünmez. Oran olunca çıktı dosya sayısıyla büyümez.

| depo | dosya | eşik | satır |
|---|---|---|---|
| cozdukce | 28 | 3 | 17 |
| dijji-onprem | 246 | 4 | 44 |
| dijji-ai | 1.120 | 22 | 75 |

Kırk kat dosya, dört kat satır.

---

## Nerede ne duruyor

| yol | ne | oturuma yüklenir mi |
|---|---|---|
| `~/.doguxclaude/index.md` | harita | evet |
| `~/.doguxclaude/durum.json` | şekil parmak izleri | hayır |
| `~/.doguxclaude/oturum/` | oturum başına son enjekte edilen depo | hayır |
