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
  
  // Drag & Drop state
  public isDragging = false;

  // Filtreleme state'leri
  public processorBrand: 'intel' | 'amd' = 'intel';
  public gpuBrand: 'nvidia' | 'amd' | 'intel' = 'nvidia';
  
  // YENİ: Bu değişken, sunucudan gelen Object URL'i tutacak
  public finalGeneratedImage: string | null = null; 

  public selectedProcessorValue: string = '';
  public selectedOperatingSystem: string = '';
  public selectedHz: string = '';
  public selectedEkranKarti: string = '';
  public selectedHdmi: string = '';
  public selectedKlavye: string = '';
  public selectedMaviIsik: string = '';
  public selectedTypeC: string = '';
  public selectedWifi6: string = '';
  
  // Dosya indirme adı
  public downloadFileName: string = 'ozellestirilmis-laptop';

  public isLoading = false;
  public errorMessage = '';

  // Cloudinary ayarları kaldırıldı
  
  // Seçenekler (değişmedi, 'value' değerlerinin 'logoMap' ile eşleştiğinden emin olun)
  public processorOptions = [
    { name: 'Intel Core i9', value: 'i9', logo: '...' },
    { name: 'Intel Core i7', value: 'i7', logo: '...' },
    { name: 'Intel Core i5', value: 'i5', logo: '...' },
    // Yeni eklenenler
    { name: 'AMD Ryzen 9', value: 'amd_ryzen_9', logo: '...' },
    { name: 'AMD Ryzen 7', value: 'amd_ryzen_7', logo: '...' },
    { name: 'AMD Ryzen 5', value: 'amd_ryzen_5', logo: '...' },
    { name: 'Intel Core i9 (Yeni)', value: 'intel_core_i9_new', logo: '...' },
    { name: 'Intel Core i7 (Yeni)', value: 'intel_core_i7_new', logo: '...' },
    { name: 'Intel Core i5 (Yeni)', value: 'intel_core_i5_new', logo: '...' },
    { name: 'Intel Core i3', value: 'intel_core_i3_new', logo: '...' },
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

  public klavyeOptions = [
    { name: 'Klavye Aydınlatma', value: 'klavye', logo: '...' },
  ];
  
  public maviIsikOptions = [
    { name: 'Mavi Işık Koruması', value: 'maviIsik', logo: '...' },
  ];

  public typeCOptions = [
    { name: 'USB Type-C', value: 'typeC', logo: '...' },
  ];

  public wifi6Options = [
    { name: 'Wi-Fi 6', value: 'wifi6', logo: '...' },
  ];

  public ekranKartiOptions = [
    { name: 'Intel Graphics', value: 'intelgraphics', logo: '...' },
    { name: 'AMD Graphics', value: 'amdgraphics', logo: '...' },

    // AMD Radeon
    { name: 'AMD Radeon RX 7900 XTX', value: 'radeon_rx_7900_xtx', logo: '...' },
    { name: 'AMD Radeon RX 7900 XT', value: 'radeon_rx_7900_xt', logo: '...' },
    { name: 'AMD Radeon RX 7800 XT', value: 'radeon_rx_7800_xt', logo: '...' },
    { name: 'AMD Radeon RX 7700 XT', value: 'radeon_rx_7700_xt', logo: '...' },
    { name: 'AMD Radeon RX 7600 XT', value: 'radeon_rx_7600_xt', logo: '...' },
    { name: 'AMD Radeon RX 7600', value: 'radeon_rx_7600', logo: '...' },
    { name: 'AMD Radeon RX 6950 XT', value: 'radeon_rx_6950_xt', logo: '...' },
    { name: 'AMD Radeon RX 6900 XT', value: 'radeon_rx_6900_xt', logo: '...' },
    { name: 'AMD Radeon RX 6800 XT', value: 'radeon_rx_6800_xt', logo: '...' },
    { name: 'AMD Radeon RX 6800', value: 'radeon_rx_6800', logo: '...' },
    { name: 'AMD Radeon RX 6750 XT', value: 'radeon_rx_6750_xt', logo: '...' },
    { name: 'AMD Radeon RX 6700 XT', value: 'radeon_rx_6700_xt', logo: '...' },
    { name: 'AMD Radeon RX 6700', value: 'radeon_rx_6700', logo: '...' },
    { name: 'AMD Radeon RX 6650 XT', value: 'radeon_rx_6650_xt', logo: '...' },
    { name: 'AMD Radeon RX 6600 XT', value: 'radeon_rx_6600_xt', logo: '...' },
    { name: 'AMD Radeon RX 6600', value: 'radeon_rx_6600', logo: '...' },
    { name: 'AMD Radeon RX 6500 XT', value: 'radeon_rx_6500_xt', logo: '...' },
    { name: 'AMD Radeon RX 6400', value: 'radeon_rx_6400', logo: '...' },

    // Intel Arc
    { name: 'Intel Arc A770', value: 'arc_a770', logo: '...' },
    { name: 'Intel Arc A750', value: 'arc_a750', logo: '...' },
    { name: 'Intel Arc A580', value: 'arc_a580', logo: '...' },
    { name: 'Intel Arc A380', value: 'arc_a380', logo: '...' },

    // Nvidia GeForce
    { name: 'NVIDIA GeForce RTX 5090', value: 'geforce_rtx_5090', logo: '...' },
    { name: 'NVIDIA GeForce RTX 5080', value: 'geforce_rtx_5080', logo: '...' },
    { name: 'NVIDIA GeForce RTX 5070 Ti', value: 'geforce_rtx_5070_ti', logo: '...' },
    { name: 'NVIDIA GeForce RTX 5070', value: 'geforce_rtx_5070', logo: '...' },
    { name: 'NVIDIA GeForce RTX 5060 Ti', value: 'geforce_rtx_5060_ti', logo: '...' },
    { name: 'NVIDIA GeForce RTX 5060', value: 'geforce_rtx_5060', logo: '...' },
    { name: 'NVIDIA GeForce RTX 5050', value: 'geforce_rtx_5050', logo: '...' },
    { name: 'NVIDIA GeForce RTX 4090', value: 'geforce_rtx_4090', logo: '...' },
    { name: 'NVIDIA GeForce RTX 4080 Super', value: 'geforce_rtx_4080_super', logo: '...' },
    { name: 'NVIDIA GeForce RTX 4080', value: 'geforce_rtx_4080', logo: '...' },
    { name: 'NVIDIA GeForce RTX 4070 Super', value: 'geforce_rtx_4070_super', logo: '...' },
    { name: 'NVIDIA GeForce RTX 4070 Ti', value: 'geforce_rtx_4070_ti', logo: '...' },
    { name: 'NVIDIA GeForce RTX 4070', value: 'geforce_rtx_4070', logo: '...' },
    { name: 'NVIDIA GeForce RTX 4060 Ti', value: 'geforce_rtx_4060_ti', logo: '...' },
    { name: 'NVIDIA GeForce RTX 4060', value: 'geforce_rtx_4060', logo: '...' },
    { name: 'NVIDIA GeForce RTX 4050 Laptop', value: 'geforce_rtx_4050_laptop', logo: '...' },
    { name: 'NVIDIA GeForce RTX 3090 Ti', value: 'geforce_rtx_3090_ti', logo: '...' },
    { name: 'NVIDIA GeForce RTX 3090', value: 'geforce_rtx_3090', logo: '...' },
    { name: 'NVIDIA GeForce RTX 3080 Ti', value: 'geforce_rtx_3080_ti', logo: '...' },
    { name: 'NVIDIA GeForce RTX 3080', value: 'geforce_rtx_3080', logo: '...' },
    { name: 'NVIDIA GeForce RTX 3070 Ti', value: 'geforce_rtx_3070_ti', logo: '...' },
    { name: 'NVIDIA GeForce RTX 3070', value: 'geforce_rtx_3070', logo: '...' },
    { name: 'NVIDIA GeForce RTX 3060 Ti', value: 'geforce_rtx_3060_ti', logo: '...' },
    { name: 'NVIDIA GeForce RTX 3060', value: 'geforce_rtx_3060', logo: '...' },
    { name: 'NVIDIA GeForce RTX 3050', value: 'geforce_rtx_3050', logo: '...' },
  ];

  // Filtrelenmiş listeler için getter'lar
  get filteredProcessorOptions() {
    if (this.processorBrand === 'intel') {
      return this.processorOptions.filter(p => p.name.toLowerCase().includes('intel'));
    } else {
      return this.processorOptions.filter(p => p.name.toLowerCase().includes('amd'));
    }
  }

  get filteredEkranKartiOptions() {
    if (this.gpuBrand === 'nvidia') {
      return this.ekranKartiOptions.filter(g => g.name.toLowerCase().includes('nvidia'));
    } else if (this.gpuBrand === 'amd') {
      // "AMD Graphics" ve "Radeon" içerenleri getir
      return this.ekranKartiOptions.filter(g => g.name.toLowerCase().includes('amd') || g.name.toLowerCase().includes('radeon'));
    } else {
      // Intel
      return this.ekranKartiOptions.filter(g => g.name.toLowerCase().includes('intel'));
    }
  }

  constructor(
    private cdr: ChangeDetectorRef,
    // YENİ SERVİSİ ENJEKTE ET
    private processingService: ProcessingService 
  ) {}

  // Drag & Drop Handler'ları
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  handleFile(file: File) {
    if (file && file.type.startsWith('image/')) {
      this.uploadedLaptopFile = file;
      this.finalGeneratedImage = null;
      this.errorMessage = '';
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedLaptopPreviewSrc = e.target.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    } else {
      alert('Lütfen geçerli bir resim dosyası yükleyin.');
    }
  }

  // onLaptopFileChange (değişmedi, önizleme için harika)
  onLaptopFileChange(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.handleFile(file);
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
      this.selectedHdmi || undefined,
      this.selectedKlavye || undefined,
      this.selectedMaviIsik || undefined,
      this.selectedTypeC || undefined,
      this.selectedWifi6 || undefined
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
  
  // Görseli indirme fonksiyonu
  downloadImage() {
    if (!this.finalGeneratedImage) return;

    const link = document.createElement('a');
    link.href = this.finalGeneratedImage;
    // Kullanıcının girdiği dosya adını kullan, boşsa varsayılanı kullan
    // Uzantı ekle (jpeg)
    let fileName = this.downloadFileName.trim() || 'ozellestirilmis-laptop';
    if (!fileName.toLowerCase().endsWith('.jpg') && !fileName.toLowerCase().endsWith('.jpeg')) {
      fileName += '.jpg';
    }
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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