// server.js

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Angular (localhost:4200) sunucusundan gelen isteklere izin ver
app.use(cors({ origin: 'http://localhost:4200' }));

// Dosyaları hafızada tutmak için Multer'ı ayarla
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Seçenekleri dosya yollarıyla eşleştir
const logoMap = {
  // Bu publicId'ler, Angular component'inizdeki 'value' ile eşleşmeli
  'i9': path.join(__dirname, 'server-logos/i9.png'),
  'i7': path.join(__dirname, 'server-logos/i7.png'),
  'i5': path.join(__dirname, 'server-logos/i5.png'),
  'windows11': path.join(__dirname, 'server-logos/win11.png'),
  'windows10': path.join(__dirname, 'server-logos/win10.png'),
  '60hz': path.join(__dirname, 'server-logos/60hz_logo.png'),
  '120hz': path.join(__dirname, 'server-logos/120hz_logo.png'),
  '144hz': path.join(__dirname, 'server-logos/144hz_logo.png'),
  'hdmi': path.join(__dirname, 'server-logos/hdmi_logo.png'),
  'intelgraphics': path.join(__dirname, 'server-logos/intelgrap_logo.png'),
};

/**
 * ANA ENDPOINT
 * 'laptopImage' dosyasını ve 'osValue', 'processorValue' metinlerini alır
 */
app.post('/api/composite', upload.single('laptopImage'), async (req, res) => {

  try {
    // Dosya kontrolü
    if (!req.file) {
      return res.status(400).json({ message: 'Laptop görseli yüklenmedi' });
    }

    const laptopImageBuffer = req.file.buffer;
    const { osValue, processorValue, hzValue, ekranKartiValue, hdmiValue } = req.body;

    // Parametre kontrolü
    if (!osValue || !processorValue) {
      return res.status(400).json({ message: 'İşletim sistemi veya işlemci seçimi eksik' });
    }

    // Seçilen logoların dosya yollarını bul
    const osLogoPath = logoMap[osValue];
    const processorLogoPath = logoMap[processorValue];
    const hzLogoPath = hzValue ? logoMap[hzValue] : null;
    const ekranKartiLogoPath = ekranKartiValue ? logoMap[ekranKartiValue] : null;
    const hdmiLogoPath = hdmiValue ? logoMap[hdmiValue] : null;

    if (!osLogoPath || !processorLogoPath) {
      return res.status(400).json({ message: 'Geçersiz logo seçimi' });
    }

    // Logo dosyalarının varlığını kontrol et
    if (!fs.existsSync(osLogoPath)) {
      return res.status(400).json({ message: `OS logosu bulunamadı: ${osLogoPath}` });
    }
    if (!fs.existsSync(processorLogoPath)) {
      return res.status(400).json({ message: `İşlemci logosu bulunamadı: ${processorLogoPath}` });
    }
    if (hzLogoPath && !fs.existsSync(hzLogoPath)) {
      return res.status(400).json({ message: `Hz logosu bulunamadı: ${hzLogoPath}` });
    }
    if (ekranKartiLogoPath && !fs.existsSync(ekranKartiLogoPath)) {
      return res.status(400).json({ message: `Ekran kartı logosu bulunamadı: ${ekranKartiLogoPath}` });
    }
    if (hdmiLogoPath && !fs.existsSync(hdmiLogoPath)) {
      return res.status(400).json({ message: `HDMI logosu bulunamadı: ${hdmiLogoPath}` });
    }

    // Ana görselin boyutlarını al
    const laptopMetadata = await sharp(laptopImageBuffer).metadata();
    const laptopWidth = laptopMetadata.width;

    if (!laptopWidth || laptopWidth <= 0) {
      return res.status(400).json({ message: 'Görsel boyutları alınamadı' });
    }

    // Kategori bazlı logo boyutları
    const baseLogoSize = Math.max(100, Math.min(Math.floor(laptopWidth * 0.30), 700));
    
    // Kategori bazlı boyut çarpanları
    const sizeMultipliers = {
      os: 1.0,           // OS: Normal boyut
      processor: 1.0,    // İşlemci: Normal boyut
      hz: 0.9,          // Hz: Biraz daha küçük
      ekranKarti: 3,  // Ekran Kartı: %50 daha büyük
      hdmi: 1.5         // HDMI: %50 daha büyük
    };

    const osLogoSize = Math.floor(baseLogoSize * sizeMultipliers.os);
    const processorLogoSize = Math.floor(baseLogoSize * sizeMultipliers.processor);
    const hzLogoSize = Math.floor(baseLogoSize * sizeMultipliers.hz);
    const ekranKartiLogoSize = Math.floor(baseLogoSize * sizeMultipliers.ekranKarti);
    const hdmiLogoSize = Math.floor(baseLogoSize * sizeMultipliers.hdmi);

    console.log(`Ana görsel genişliği: ${laptopWidth}px`);
    console.log(`Logo boyutları - OS/Processor: ${osLogoSize}px, Hz: ${hzLogoSize}px, Ekran Kartı/HDMI: ${ekranKartiLogoSize}px`);

    // Orijinal logo boyutlarını kontrol et ve logla
    const checkLogoSize = async (logoPath, logoName) => {
      if (logoPath && fs.existsSync(logoPath)) {
        const metadata = await sharp(logoPath).metadata();
        console.log(`${logoName} orijinal boyutu: ${metadata.width}x${metadata.height}px`);
        return metadata;
      }
      return null;
    };

    await checkLogoSize(osLogoPath, 'OS');
    await checkLogoSize(processorLogoPath, 'İşlemci');
    await checkLogoSize(hzLogoPath, 'Hz');
    await checkLogoSize(ekranKartiLogoPath, 'Ekran Kartı');
    await checkLogoSize(hdmiLogoPath, 'HDMI');

    // Logoları resize et
    let osLogoBuffer, processorLogoBuffer, hzLogoBuffer, ekranKartiLogoBuffer, hdmiLogoBuffer;
    try {
      // OS ve Processor için withoutEnlargement: true (küçük kalabilir)
      osLogoBuffer = await sharp(osLogoPath)
        .resize(osLogoSize, osLogoSize, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .png()
        .toBuffer();
      
      processorLogoBuffer = await sharp(processorLogoPath)
        .resize(processorLogoSize, processorLogoSize, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .png()
        .toBuffer();

      // Resize sonrası boyutları ana görselden küçük olduğundan emin olmak için yardımcı fonksiyon
      const ensureSizeWithinBounds = async (logoBuffer, maxWidth, maxHeight, logoName) => {
        const metadata = await sharp(logoBuffer).metadata();
        if (metadata.width > maxWidth || metadata.height > maxHeight) {
          console.log(`${logoName} çok büyük (${metadata.width}x${metadata.height}), sınırlandırılıyor...`);
          return await sharp(logoBuffer)
            .resize(maxWidth, maxHeight, {
              fit: 'inside',
              withoutEnlargement: false
            })
            .png()
            .toBuffer();
        }
        return logoBuffer;
      };

      // Hz, Ekran Kartı ve HDMI için büyütme yapılabilir (withoutEnlargement yok)
      if (hzLogoPath) {
        hzLogoBuffer = await sharp(hzLogoPath)
          .resize(hzLogoSize, hzLogoSize, {
            fit: 'inside' // Oranları koru, belirtilen boyutun içine sığdır ama büyütebilir
          })
          .png()
          .toBuffer();
        // Ana görselden büyükse sınırla
        hzLogoBuffer = await ensureSizeWithinBounds(hzLogoBuffer, laptopWidth, laptopMetadata.height, 'Hz');
        const hzResizedMetadata = await sharp(hzLogoBuffer).metadata();
        console.log(`Hz resize sonrası: ${hzResizedMetadata.width}x${hzResizedMetadata.height}px`);
      }

      if (ekranKartiLogoPath) {
        ekranKartiLogoBuffer = await sharp(ekranKartiLogoPath)
          .resize(ekranKartiLogoSize, ekranKartiLogoSize, {
            fit: 'inside' // Oranları koru, belirtilen boyutun içine sığdır ama büyütebilir
          })
          .png()
          .toBuffer();
        // Ana görselden büyükse sınırla
        ekranKartiLogoBuffer = await ensureSizeWithinBounds(ekranKartiLogoBuffer, laptopWidth, laptopMetadata.height, 'Ekran Kartı');
        const ekranKartiResizedMetadata = await sharp(ekranKartiLogoBuffer).metadata();
        console.log(`Ekran Kartı resize sonrası: ${ekranKartiResizedMetadata.width}x${ekranKartiResizedMetadata.height}px`);
      }

      if (hdmiLogoPath) {
        hdmiLogoBuffer = await sharp(hdmiLogoPath)
          .resize(hdmiLogoSize, hdmiLogoSize, {
            fit: 'inside' // Oranları koru, belirtilen boyutun içine sığdır ama büyütebilir
          })
          .png()
          .toBuffer();
        // Ana görselden büyükse sınırla
        hdmiLogoBuffer = await ensureSizeWithinBounds(hdmiLogoBuffer, laptopWidth, laptopMetadata.height, 'HDMI');
        const hdmiResizedMetadata = await sharp(hdmiLogoBuffer).metadata();
        console.log(`HDMI resize sonrası: ${hdmiResizedMetadata.width}x${hdmiResizedMetadata.height}px`);
      }
    } catch (logoError) {
      console.error('Logo resize hatası:', logoError);
      return res.status(500).json({ 
        message: 'Logolar işlenirken hata oluştu',
        error: logoError.message 
      });
    }

    // Composite array'ini oluştur
    const compositeArray = [
      {
        input: osLogoBuffer,
        gravity: 'southwest', // Sol alt
      },
      {
        input: processorLogoBuffer,
        gravity: 'southeast', // Sağ alt
      }
    ];

    // Yeni logoları ekle (varsa)
    if (hzLogoBuffer) {
      compositeArray.push({
        input: hzLogoBuffer,
        gravity: 'northeast', // Sağ üst
      });
    }

    if (ekranKartiLogoBuffer) {
      compositeArray.push({
        input: ekranKartiLogoBuffer,
        gravity: 'northwest', // Sol üst
      });
    }

    if (hdmiLogoBuffer) {
      // Sağ orta için: left ve top koordinatlarını manuel hesapla
      // Resize edilmiş boyutları kullan
      const laptopHeight = laptopMetadata.height;
      const laptopWidth = laptopMetadata.width;
      const hdmiResizedMetadata = await sharp(hdmiLogoBuffer).metadata();
      
      // Sağ tarafta, kenardan biraz içeride (20px)
      const hdmiLeft = laptopWidth - hdmiResizedMetadata.width - 20;
      // Dikey olarak ortada
      const hdmiTop = Math.floor(laptopHeight / 2) - Math.floor(hdmiResizedMetadata.height / 2);
      
      console.log(`HDMI konumu: left=${hdmiLeft}, top=${hdmiTop}, boyut=${hdmiResizedMetadata.width}x${hdmiResizedMetadata.height}`);
      
      compositeArray.push({
        input: hdmiLogoBuffer,
        left: hdmiLeft,
        top: hdmiTop
      });
    }

    // Logoları yerleştirmek için Sharp'ı kullan
    const finalImageBuffer = await sharp(laptopImageBuffer)
      .composite(compositeArray)
      .jpeg({ quality: 90 }) // JPEG olarak sıkıştır
      .toBuffer(); // Hafızaya al

    // Yeni birleştirilmiş görseli yanıt olarak gönder
    res.set('Content-Type', 'image/jpeg');
    res.send(finalImageBuffer);

  } catch (error) {
    console.error('Görüntü işleme hatası:', error);
    console.error('Hata stack:', error.stack);
    res.status(500).json({ 
      message: 'Görüntü işlenirken hata oluştu',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

  }
});

// Test endpoint - logo dosyalarını kontrol et
app.get('/api/test-logos', (req, res) => {
  const logoStatus = {};
  for (const [key, logoPath] of Object.entries(logoMap)) {
    logoStatus[key] = {
      path: logoPath,
      exists: fs.existsSync(logoPath)
    };
  }
  res.json(logoStatus);
});

app.listen(port, () => {
  console.log(`Görüntü işleme sunucusu http://localhost:${port} adresinde çalışıyor`);
  console.log('Logo dosyaları kontrol ediliyor...');
  for (const [key, logoPath] of Object.entries(logoMap)) {
    if (fs.existsSync(logoPath)) {
      console.log(`✓ ${key}: ${logoPath}`);
    } else {
      console.error(`✗ ${key}: ${logoPath} BULUNAMADI!`);
    }
  }
});