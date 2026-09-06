# Ne yapıyor

dxc üç şey yapar: **harita**, **yapı enjeksiyonu**, **hafıza**.
Harita nerede ne olduğunu, yapı içinde ne olduğunu, hafıza ne konuşulduğunu söyler.

| | Ne zaman üretilir | Nerede durur | Model çalışır mı |
|---|---|---|---|
| **Harita** | yeni ya da şekli değişmiş depo varsa | `index.md` üst bölüm | evet, depo başına bir kez |
| **Yapı** | bir deponun adını andığın anda | hiçbir yerde, o an üretilir | hayır, hep kod |
| **Hafıza** | oturum kapanınca | `index.md` alt bölüm | evet, oturum başına bir kez |

Normal bir açılışta model **hiç çalışmaz**. Harita güncelse tarama 250 ms sürer
ve oturum açılır.

---

## 1. Harita — `~/.doguxclaude/index.md`

### Nedir

Makinendeki bütün git depolarının tek satırlık listesi. Her deponun yanında ne
iş yaptığını anlatan bir cümle, dosya sayısı ve son değişiklik tarihi vardır.

`index.md` iki bölümlüdür: üstte bu harita, altta `## Hafıza` başlığıyla son otuz
oturum. İkisi de aynı dosyada olduğu için tek seferde yükleniyor.

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
4. Sonuç `index.md`'nin **üst bölümüne** yazılır. Alt bölümdeki hafıza satırları
   önce okunur ve olduğu gibi geri konur; harita tazelenirken oturum geçmişi
   silinmez. Ayrıntı: [İki yazıcı, tek dosya](#iki-yazıcı-tek-dosya).

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
- **Bir deponun adını her andığında**, o depo için. `UserPromptSubmit` kancası ile gelir.
- **İçinde bulunduğun depo için**, adını anmasan da.

**Bir depo oturum başına en fazla bir kez yazılır.** On bir deponun hepsi girse
toplam yaklaşık 4.000 token; pratikte bir iki depo girer.

Kuralın "adı geçen depo" olmasının sebebi ölçümdür. Önce "bulunduğun depo" diye
yazılmıştı ve işe yaramadı: sen bir depoyu sorduğunda model henüz orada değildir,
oraya cevap verirken girer. Yapı hep bir istem geç geliyordu ve o istemde artık
gereksizdi. Canlı oturumda web-app yapısı api-platform sorulurken, api-platform yapısı
oturum kimliği sorulurken geldi; ikisi de boşa gitti.

Ad eşleşmesi Türkçe harfe duyarsızdır: sen "öğrenci-portalı" yazarsın, klasör
"ogrenci-portali"dir, ikisi eşleşir. Üç harften kısa adlar eşleşmez ki her cümleye
takılmasın.

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

## 3. Hafıza — `index.md` içinde, haritanın altında

### Nedir

Son otuz oturum, her biri tek cümle. Haritayla aynı dosyada, `## Hafıza`
başlığının altında durur, o yüzden ayrıca yüklenmesi gerekmez.

### Nasıl yazılır

Oturum kapanınca. `dxc` claude'u başlatıp bekleyen ana süreçtir; claude çıkınca
kontrol ona döner ve şunu yapar:

1. Oturumun kayıt dosyasını açar. Yolu tahmin etmez: kanca her istemde
   `transcript_path` alıyor ve dxc'ye bırakıyor.
2. Kayıttan yalnız konuşmayı çıkarır, araç çağrılarını ve çıktılarını atar.
   Ölçüldü: kaydın yalnız yüzde 6,4'ü konuşmadır.
3. Son 25.000 karakteri alır. "Nerede kaldık" sorusunun cevabı sondadır ve
   girdi sınırlı kalınca çağrı da hızlı olur.
4. Modele tek çağrı yapar, tek cümle ister. Ölçüldü: 110 KB'lık kayıt, 6,2 saniye.
5. Cümleyi hafıza bölümünün **en üstüne** koyar. Otuzu aşan alttan düşer.

Bunların hepsi **arka planda** olur. `dxc`'den çıktığın anda terminal geri gelir,
özet sen farkına varmadan yazılır.

Kanca hiç çalışmadıysa kayıt yolu yoktur ve hiçbir şey yazılmaz. Konuşulmamış
oturuma cümle yazılmaz.

### İki yazıcı, tek dosya

`index.md`'ye iki ayrı yazıcı yazar ve **birbirinin bölümüne dokunmaz**:

| Yazıcı | Ne zaman | Hangi bölüm |
|---|---|---|
| harita tazeleyici | her `dxc` çağrısında | üst bölüm |
| çıkış yazıcısı | oturum kapanınca | `## Hafıza` altı |

Harita tazeleyici dosyayı yeniden üretirken hafıza bölümünü önce okur ve olduğu
gibi geri koyar. Çıkış yazıcısı da yalnız hafıza bölümüne satır ekler. Üzerine
yazma olmaz.

### Neden şişmez

Otuz satır tavanı var. Otuz birinci gelince en eski düşer. Dosya sabit kalır.

---

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
| web-app | 28 | 3 | 17 |
| data-service | 246 | 4 | 44 |
| api-platform | 1.120 | 22 | 75 |

Kırk kat dosya, dört kat satır.


---

---

## Nerede ne duruyor

| yol | ne | oturuma yüklenir mi |
|---|---|---|
| `~/.doguxclaude/index.md` | harita **ve** hafıza | evet |
| `~/.doguxclaude/durum.json` | şekil parmak izleri | hayır |
| `~/.doguxclaude/oturum/` | oturumda yazılmış depolar, oturum kayıt yolu | hayır |
