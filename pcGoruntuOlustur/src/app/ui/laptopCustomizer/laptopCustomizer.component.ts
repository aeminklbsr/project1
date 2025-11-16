// laptopCustomizer.component.ts

import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// YENİ SERVİSİMİZİ IMPORT EDİYORUZ
import { ProcessingService } from '../../common/services/processing.service';
// import { ... } from '@cloudinary/ng'; // Cloudinary importları kaldırıldı
// import { ... } from '@cloudinary/url-gen'; // Cloudinary importları kaldırıldı

@Component({
  selector: 'app-laptopCustomizer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // CloudinaryModule ve AdvancedImageComponent kaldırıldı
  ],
  templateUrl: './laptopCustomizer.component.html',
  styleUrls: ['./laptopCustomizer.component.css']
})
export class LaptopCustomizerComponent {
  
  public uploadedLaptopFile: File | null = null;
  public uploadedLaptopPreviewSrc: string | null = null; 
  
  // YENİ: Bu değişken, sunucudan gelen Object URL'i tutacak
  public finalGeneratedImage: string | null = null; 

  public selectedProcessorValue: string = '';
  public selectedOperatingSystem: string = '';
  public selectedHz: string = '';
  public selectedEkranKarti: string = '';
  public selectedHdmi: string = '';

  public isLoading = false;
  public errorMessage = '';

  // Cloudinary ayarları kaldırıldı
  
  // Seçenekler (değişmedi, 'value' değerlerinin 'logoMap' ile eşleştiğinden emin olun)
  public processorOptions = [
    { name: 'Intel Core i9', value: 'i9', logo: '...' },
    { name: 'Intel Core i7', value: 'i7', logo: '...' },
    { name: 'Intel Core i5', value: 'i5', logo: '...' }
  ];
  public operatingSystemOptions = [
    { name: 'Windows 11', value: 'windows11', logo: '...' },
    { name: 'Windows 10', value: 'windows10', logo: '...' },
  ];

  public hzOptions = [
    { name: '60 Hz', value: '60hz', logo: '...' },
    { name: '120 Hz', value: '120hz', logo: '...' },
    { name: '144 Hz', value: '144hz', logo: '...' },
  ];

  public hdmiOptions = [
    { name: 'HDMI', value: 'hdmi', logo: '...' },
  ];

  public ekranKartiOptions = [
    { name: 'Intel Graphics', value: 'intelgraphics', logo: '...' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    // YENİ SERVİSİ ENJEKTE ET
    private processingService: ProcessingService 
  ) {}

  // onLaptopFileChange (değişmedi, önizleme için harika)
  onLaptopFileChange(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadedLaptopFile = file;
      this.finalGeneratedImage = null; // Eski sonucu temizle
      this.errorMessage = '';
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedLaptopPreviewSrc = e.target.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // onGenerateClick (TAMAMEN GÜNCELLENDİ)
  onGenerateClick() {
    if (!this.uploadedLaptopFile || !this.selectedProcessorValue || !this.selectedOperatingSystem) {
      alert("Lütfen tüm seçimleri yapın.");
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    this.finalGeneratedImage = null;

    this.processingService.generateCompositeImage(
      this.uploadedLaptopFile!,
      this.selectedOperatingSystem,
      this.selectedProcessorValue,
      this.selectedHz || undefined,
      this.selectedEkranKarti || undefined,
      this.selectedHdmi || undefined
    ).subscribe({
      next: (objectUrl) => {
        // BAŞARILI: Sunucudan gelen URL'yi ayarla
        this.finalGeneratedImage = objectUrl;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.handleError(err, "Sunucu taraflı görüntü işleme");
      }
    });
  }
  
  // handleError
  private handleError(err: any, context: string) {
    let errorMsg = `${context} alınırken bir hata oluştu: `;
    
    if (err instanceof Error) {
      errorMsg += err.message;
    } else if (err?.message) {
      errorMsg += err.message;
    } else if (typeof err === 'string') {
      errorMsg += err;
    } else {
      errorMsg += 'Bilinmeyen bir hata oluştu';
    }
    
    console.error('Hata detayı:', err);
    this.errorMessage = errorMsg;
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}