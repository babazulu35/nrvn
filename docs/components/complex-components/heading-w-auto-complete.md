# Auto-complete Özellikli İçerik Başlığı

![Screenshot](images/heading-w-autocomplete-1.png)

Detay sayfalarında, bulunulan entity başlığını aynı zamanda bir navigasyon unsuruna çeviren bir component'tir.

[Kapak görseli](https://trello.com/c/6S7wZFrE/5-kapak-gorseli) ve benzer alanlarda gösterilen başlığı ezerek, bu başlığın kendi tipindeki alanları listeyip, onlara ulaştırabilecek bir component olarak işlev görür.

## İşleyiş

Kullancı, başlığın yanındaki tetikleyiciye tıklayarak ikincil bir ekran açar. Bu ekran içinde bir arama alanı ve arama yapmadan listelenen içerikler listelenir.

### Arama yapmadan listelenen içeriker (preset'ler)

Bu içerikler kişinin son güncellediği veriler, ya da ilgisini çekebilecek diğer veriler olabilir. Bunların, kullanılan entity'nin yapısına uygun şekilde elde edilip component'e parametre olarak geçilmesi gerekir.

Bu liste önceden bir request ile hazırlanabileceği gibi, açılış tetiklendiği anda da çekilerek kullanıcıua teklif edilebilir.

Kullanıcı **arama için keyword girişi yapınca** her keyup'a bir delay eklenerek (arka arkaya çalışması engellenmelidir, delay süresi içinde gelen keyup'lar throttle edilmelidir) sunucudan arama yapılır. Arama sonuçları preset olarak gelmiş içeriklerin yerine gelir.

Kullanıcı bunlardan birisine tıklayarak seçim yapabilir. Seçim yapmadan kapatırsa tüm arama süreci sıfırlanır, eğer ekran açıkken input kutusu boşaltılırsa arama sonuçları temizlenmeli ve yerine preset'ler gelmelidir.

## Component İşlevleri

### Arama alanı açılabilir ve kapatılabilir

![Screenshot](images/heading-w-autocomplete-2.png)

Component içinden, tetikleyiciye basıldığında arama alanı açılabilimelidir. Kapatma aşağıdaki şekillerde gerçekleşir:

- Kapatma tetikleyicisi kullanılarak,
- Ekranda boş bir alana tıklayarak,
- Klavye'den esc'e basarak

Arama alanı kapatıldığı zaman tüm input içerikleri sıfırlanmalı, arama sonuçları yerini *eğer varsa* preset'lere bırakmalıdır.

### Arama yapılabilir

Kullanıcılar, input girişi yaparak arama yapabilir bu durumda:

- Throttle etmek suretiyle, onkeyup'da dışarı arama parametresini içeren bir event emit edilir. Bu event'in yakalanması, aramanın gerçekleştirilmesi ve arama sonuçlarını besleyen bound veri kaynağının güncellenmesi suretiyle arama sonuçları ekrana getirilir.
- Arama sonuçları tıklanabilir. Tıklama sonucunda, ilgili object'i içeren bir event emit edilir. Yukarıda bu event yakalanarak ilgili action tetiklenir.
- Arama kutusu içeriği boşaltılırsa, arama sonuçları temizlenip preset'ler gösterilmeye devam eder.

Arama esnasında, input'un içine dahil edilmiş olan https://trello.com/c/lsPI9lFV/42-spinner-a-donebilen-tek-ikon-promise-icon 'un gösterilmesi beklenir.

!!! note "Bilgi"
	Arama sonuç üretmezse, boş göstermek yerine kullanıcıya feedback vermek gerekir. Aksi durumda, kullanıcı aramanın işlemediğini düşünebilir.

## Veriler, Parametreler

Bu alan bir wrapper olarak sayfa başlığı metnin kabul eder. Onun dışında ek olarak aşağıdaki verileri parametre olarak alması gerekir.

- **Preset'ler** Bunlar, arama yapmadan önce kullanıcıya kolaylık amacı ile gösterilen listenin içerikleridir. Opsiyoneldir.
- **isLoading durumu** Bu veri input içindeki https://trello.com/c/lsPI9lFV/42-spinner-a-donebilen-tek-ikon-promise-icon 'un aktif olup olmadığını belirler.
- **Arama sonuçları** Arama ya da sunucudan gelen veriler sonuçlandığı zaman parametre geçilerek içeride listelenmesi sağlanır. Eğer sonuç bulunmazsa length=0 olan boş bir array dönülmelidir. Bu sayede "sonuç bulunamadı" gösterimi yapılabilir.

Bu listeye ek olarak:

- **Preset'lerin ikonları** değişebilir niteliktedir.
- **Arama sonucları ikonları** aranan entity'e göre değişiklik göstermektedir. 