import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, switchMap, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcessingService {

  // Node.js sunucumuzun adresi
  // (Proxy ayarı yaparsak burası '/api/composite' olabilir, şimdilik tam URL'i kullanalım)
  private apiUrl = 'http://localhost:3000/api/composite';

  constructor(private http: HttpClient) { }

  /**
   * Görseli ve seçimleri Node.js sunucusuna gönderir
   * @returns Birleştirilmiş görselin Object URL'ini döndürür
   */
  generateCompositeImage(
    laptopImageFile: File,
    osValue: string,
    processorValue: string,
    hzValue?: string,
    ekranKartiValue?: string,
    hdmiValue?: string,
    klavyeValue?: string,
    maviIsikValue?: string,
    typeCValue?: string,
    wifi6Value?: string
  ): Observable<string> {
    
    // Dosya ve metin verilerini göndermek için FormData kullanmalıyız
    const formData = new FormData();
    formData.append('laptopImage', laptopImageFile, laptopImageFile.name);
    formData.append('osValue', osValue);
    formData.append('processorValue', processorValue);
    if (hzValue) formData.append('hzValue', hzValue);
    if (ekranKartiValue) formData.append('ekranKartiValue', ekranKartiValue);
    if (hdmiValue) formData.append('hdmiValue', hdmiValue);
    if (klavyeValue) formData.append('klavyeValue', klavyeValue);
    if (maviIsikValue) formData.append('maviIsikValue', maviIsikValue);
    if (typeCValue) formData.append('typeCValue', typeCValue);
    if (wifi6Value) formData.append('wifi6Value', wifi6Value);

    return this.http.post(this.apiUrl, formData, {
      // ÖNEMLİ: Yanıtın bir resim/blob olduğunu belirtiyoruz
      responseType: 'blob',
      observe: 'response' // Header'ları da almak için
    }).pipe(
      // Blob'un tipini kontrol et - eğer JSON ise hata mesajıdır
      switchMap(response => {
        const blob = response.body!;
        const contentType = response.headers.get('content-type') || blob.type;
        
        // Eğer yanıt JSON ise, hata mesajını parse et
        if (contentType.includes('application/json')) {
          return from(blob.text()).pipe(
            switchMap((text: string) => {
              try {
                const errorObj = JSON.parse(text);
                return throwError(() => new Error(errorObj.message || 'Sunucu hatası'));
              } catch {
                return throwError(() => new Error('Bilinmeyen hata oluştu'));
              }
            })
          );
        }
        
        // Başarılı durumda blob'u URL'e dönüştür
        return new Observable<string>(observer => {
          observer.next(URL.createObjectURL(blob));
          observer.complete();
        });
      }),
      // HTTP hatalarını yakala
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Hatası:', error);
        // Eğer hata bir blob ise (sunucu JSON göndermiş ama blob olarak algılanmış)
        if (error.error instanceof Blob) {
          return from(error.error.text()).pipe(
            switchMap((text: string) => {
              try {
                const errorObj = JSON.parse(text);
                const errorMessage = errorObj.message || errorObj.error || 'Sunucu hatası';
                console.error('Sunucu hata mesajı:', errorMessage);
                return throwError(() => new Error(errorMessage));
              } catch (parseError) {
                console.error('JSON parse hatası:', parseError);
                return throwError(() => new Error('Bilinmeyen hata oluştu'));
              }
            })
          );
        }
        // Normal HTTP hatası
        const errorMessage = error.message || `HTTP ${error.status}: ${error.statusText}` || 'Bağlantı hatası';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}