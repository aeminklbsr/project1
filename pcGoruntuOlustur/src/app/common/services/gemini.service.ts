import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, from } from 'rxjs';

import { switchMap, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';



@Injectable({

  providedIn: 'root'

})

export class GeminiService {



  private apiKey = environment.geminiAPIKey;

  private apiUrl = `/api/gemini/v1beta/models/gemini-2.0-flash:generateContent`;



  constructor(private http: HttpClient) { }



  /**

   * Bir dosyayı Gemini API'nin istediği Base64 formatına dönüştürür

   */

  private async fileToGenerativePart(file: File) {

    const base64encoded = await new Promise<string>((resolve) => {

      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => resolve((reader.result as string).split(',')[1]);

    });

    return {

      inlineData: {

        mimeType: file.type,

        data: base64encoded

      }

    };

  }



  /**

   * Görüntüyü ve KULLANICININ YAZDIĞI KOMUTU analiz için Gemini API'ye gönderir

   */

  getCoordinates(laptopImageFile: File, userPromptText: string): Observable<{x: number, y: number}> {

   

    // 1. Gemini'ye vereceğimiz asıl komut (Prompt)

    // KULLANICININ GİRDİSİNİ ALIP, DAHA TEKNİK BİR KOMUTA GÖMÜYORUZ

    const systemPrompt = `Görüntüdeki laptop bilgisayarı analiz et. Önce EKRAN ALANINI tespit et, sonra "${userPromptText}" logosu için uygun bir koordinat belirle.



ADIM 1 - EKRAN TESPİTİ (ÇOK ÖNEMLİ):

1. Görüntüde açık, ışıklı, içerik gösteren dikdörtgen alanı bul = BU EKRAN

2. Ekran genellikle görüntünün üst kısmında, parlak/aydınlık görünen dikdörtgen

3. Ekranın sınırlarını (bezel/çerçeve) çok dikkatli belirle

4. Ekranın altında klavye var - klavye EKRAN DEĞİL, yasak alan

5. Ekranın sol üst köşesini (x, y) ve boyutlarını (genişlik, yükseklik) zihninde belirle



ADIM 2 - LOGO YERLEŞTİRME:

"${userPromptText}" logosu için (logo boyutu: 100x100 piksel):



- Eğer "Intel Core" veya "i5" veya "i7" veya "i9" içeriyorsa:

  → Ekranın SAĞ ALT KÖŞESİNE yakın bir konum seç

  → Ekranın sağ kenarından yaklaşık 50-100 piksel içeride

  → Ekranın alt kenarından yaklaşık 50-100 piksel içeride

  → Logo ekranın içinde kalmalı, ekran dışına çıkmamalı

 

- Eğer "Windows" veya "Windows 10" veya "Windows 11" içeriyorsa:

  → Ekranın SOL ALT KÖŞESİNE yakın bir konum seç

  → Ekranın sol kenarından yaklaşık 50-100 piksel içeride

  → Ekranın alt kenarından yaklaşık 50-100 piksel içeride

  → Logo ekranın içinde kalmalı, ekran dışına çıkmamalı



KRİTİK KONTROL:

- Logo koordinatı (x, y) MUTLAKA ekranın sınırları içinde olmalı

- Logo KLAVYE üzerine, GÖVDE üzerine veya ekran dışına ASLA yerleştirilmemeli

- Logo ekranın görünür piksel alanının içinde olmalı



ÇIKTI:

Sadece JSON formatında {'x': sayı, 'y': sayı} olarak cevap ver.

- x ve y değerleri piksel cinsinden tam sayı

- Koordinatlar görüntünün sol üst köşesinden (0,0) başlar

- Başka hiçbir açıklama, metin veya yorum ekleme



ŞİMDİ: Görüntüyü dikkatle analiz et, önce ekran alanını doğru tespit et, sonra "${userPromptText}" logosu için ekranın içinde, ekranın kenarlarında uygun bir koordinat belirle.`;



    // 2. Dosyayı Base64'e dönüştür

    return from(this.fileToGenerativePart(laptopImageFile)).pipe(

      // 3. Dosya hazır olduğunda, HTTP çağrısına geç

      switchMap(imagePart => {

       

        // 4. API'ye gönderilecek gövde (body)

        const body = {

          contents: [

            {

              parts: [

                { text: systemPrompt }, // BİZİM YÖNLENDİRMEMİZ

                imagePart             // RESİM

              ]

            }

          ]

        };



        // 5. API'ye POST isteği gönder

        // API key'i header'da gönderiyoruz (query parametresi yerine)

        const headers = new HttpHeaders({

          'x-goog-api-key': this.apiKey,

          'Content-Type': 'application/json'

        });

       

        console.log('API URL:', this.apiUrl);

        console.log('Request body:', JSON.stringify(body, null, 2));

        return this.http.post<any>(this.apiUrl, body, { headers });

      }),

      // 6. API'den gelen yanıtı (response) işle

      map(response => {

        try {

          console.log('API Response:', JSON.stringify(response, null, 2));

         

          // Response yapısını kontrol et

          if (!response || !response.candidates || !Array.isArray(response.candidates) || response.candidates.length === 0) {

            throw new Error('API yanıtında candidates bulunamadı');

          }



          const candidate = response.candidates[0];

          if (!candidate || !candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {

            throw new Error('API yanıtında content.parts bulunamadı');

          }



          const part = candidate.content.parts[0];

          if (!part) {

            throw new Error('API yanıtında parts[0] bulunamadı');

          }



          // Text alanını bul (bazen 'text' bazen başka bir alan olabilir)

          let jsonText: string | null = null;

         

          if (part.text) {

            jsonText = part.text;

          } else if (typeof part === 'string') {

            jsonText = part;

          } else if (part.functionCall) {

            throw new Error('API function call döndü, text bekleniyordu');

          } else {

            // Tüm alanları kontrol et

            console.log('Part içeriği:', part);

            throw new Error('API yanıtında text alanı bulunamadı');

          }



          if (!jsonText || jsonText.trim() === '') {

            throw new Error('API yanıtı boş');

          }



          console.log('Parse edilecek JSON text:', jsonText);



          // JSON string'den gereksiz karakterleri temizle (markdown code blocks, vb.)

          let cleanedText = jsonText.trim();

         

          // Eğer markdown code block içindeyse çıkar

          if (cleanedText.startsWith('```')) {

            const lines = cleanedText.split('\n');

            cleanedText = lines.slice(1, -1).join('\n').trim();

          }

         

          // JSON etiketlerini temizle

          cleanedText = cleanedText.replace(/^json\s*/i, '').trim();

         

          // Sadece JSON objesini al (eğer başka metin varsa)

          const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

          if (jsonMatch) {

            cleanedText = jsonMatch[0];

          }



          // Tek tırnakları çift tırnaklara çevir (Python dict formatından JSON'a)

          // Önce property name'lerdeki tek tırnakları çift tırnaklara çevir

          cleanedText = cleanedText.replace(/'/g, '"');

         

          // Eğer sayısal değerler çift tırnak içindeyse (örn: "714"), tırnakları kaldır

          cleanedText = cleanedText.replace(/":\s*"(\d+)"/g, '": $1');



          console.log('Temizlenmiş JSON text:', cleanedText);



          // JSON string'i parse et

          const parsed = JSON.parse(cleanedText);

         

          // x ve y değerlerinin varlığını kontrol et

          if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number') {

            throw new Error(`Geçersiz koordinat formatı: x=${parsed.x}, y=${parsed.y}`);

          }



          console.log('Başarıyla parse edildi:', parsed);

          return { x: parsed.x, y: parsed.y };

         

        } catch (e) {

          console.error("API'den gelen yanıt parse edilemedi:", e);

          console.error("Tam response:", JSON.stringify(response, null, 2));

          throw new Error(`API yanıtı parse edilemedi: ${e instanceof Error ? e.message : String(e)}`);

        }

      })

    );

  }

}