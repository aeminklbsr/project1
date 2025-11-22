// server.js

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const imageConfig = require('./imageConfig');

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
  'amdgraphics': path.join(__dirname, 'server-logos/rodeon.jpg'),
  'klavye': path.join(__dirname, 'server-logos/klavye-aydinlatma.png'),
  'maviIsik': path.join(__dirname, 'server-logos/mavi-isik.png'),
  'typeC': path.join(__dirname, 'server-logos/type-c.png'),
  'wifi6': path.join(__dirname, 'server-logos/wifi6.png'),

  // --- YENİ EKLENEN İŞLEMCİLER ---
  'amd_ryzen_5': path.join(__dirname, 'server-logos/işlemciler/amd/amd_ryzen_5.webp'),
  'amd_ryzen_7': path.join(__dirname, 'server-logos/işlemciler/amd/amd_ryzen_7.webp'),
  'amd_ryzen_9': path.join(__dirname, 'server-logos/işlemciler/amd/amd_ryzen_9.webp'),
  'intel_core_i3_new': path.join(__dirname, 'server-logos/işlemciler/intel/Intel_Core_i3.png'),
  'intel_core_i5_new': path.join(__dirname, 'server-logos/işlemciler/intel/Intel_Core_i5.png'),
  'intel_core_i7_new': path.join(__dirname, 'server-logos/işlemciler/intel/Intel_Core_i7.png'),
  'intel_core_i9_new': path.join(__dirname, 'server-logos/işlemciler/intel/Intel_Core_i9.png'),

  // --- YENİ EKLENEN EKRAN KARTLARI ---
  // AMD
  'radeon_rx_6400': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-6400.png'),
  'radeon_rx_6500_xt': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-6500-xt.png'),
  'radeon_rx_6600': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-6600.png'),
  'radeon_rx_6600_xt': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-6600-xt.png'),
  'radeon_rx_6650_xt': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-6650-xt.png'),
  'radeon_rx_6700': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-6700.png'),
  'radeon_rx_6700_xt': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-6700-xt.png'),
  'radeon_rx_6750_xt': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-6750-xt.png'),
  'radeon_rx_6800': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-6800.png'),
  'radeon_rx_6800_xt': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-6800-xt.png'),
  'radeon_rx_6900_xt': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-6900-xt.png'),
  'radeon_rx_6950_xt': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-6950-xt.png'),
  'radeon_rx_7600': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-7600.png'),
  'radeon_rx_7600_xt': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-7600-xt.png'),
  'radeon_rx_7700_xt': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-7700-xt.png'),
  'radeon_rx_7800_xt': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-7800-xt.png'),
  'radeon_rx_7900_xt': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-7900-xt.png'),
  'radeon_rx_7900_xtx': path.join(__dirname, 'server-logos/ekran kartları/amd/radeon-rx-7900-xtx.png'),

  // Intel
  'arc_a380': path.join(__dirname, 'server-logos/ekran kartları/intel/arc-a380.png'),
  'arc_a580': path.join(__dirname, 'server-logos/ekran kartları/intel/arc-a580.png'),
  'arc_a750': path.join(__dirname, 'server-logos/ekran kartları/intel/arc-a750.png'),
  'arc_a770': path.join(__dirname, 'server-logos/ekran kartları/intel/arc-a770.png'),

  // Nvidia
  'geforce_rtx_3050': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-3050.png'),
  'geforce_rtx_3060': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-3060.png'),
  'geforce_rtx_3060_ti': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-3060-ti.png'),
  'geforce_rtx_3070': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-3070.png'),
  'geforce_rtx_3070_ti': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-3070-ti.png'),
  'geforce_rtx_3080': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-3080.png'),
  'geforce_rtx_3080_ti': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-3080-ti.png'),
  'geforce_rtx_3090': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-3090.png'),
  'geforce_rtx_3090_ti': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-3090-ti.png'),
  'geforce_rtx_4050_laptop': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-4050-laptop.png'),
  'geforce_rtx_4060': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-4060.png'),
  'geforce_rtx_4060_ti': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-4060-ti.png'),
  'geforce_rtx_4070': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-4070.png'),
  'geforce_rtx_4070_ti': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-4070-ti.png'),
  'geforce_rtx_4070_super': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-4070-super.png'),
  'geforce_rtx_4080': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-4080.png'),
  'geforce_rtx_4080_super': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-4080-super.png'),
  'geforce_rtx_4090': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-4090.png'),
  'geforce_rtx_5050': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-5050.png'),
  'geforce_rtx_5060': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-5060.png'),
  'geforce_rtx_5060_ti': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-5060-ti.png'),
  'geforce_rtx_5070': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-5070.png'),
  'geforce_rtx_5070_ti': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-5070-ti.png'),
  'geforce_rtx_5080': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-5080.png'),
  'geforce_rtx_5090': path.join(__dirname, 'server-logos/ekran kartları/nvidia/geforce-rtx-5090.png'),
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
    const { osValue, processorValue, hzValue, ekranKartiValue, hdmiValue, klavyeValue, maviIsikValue, typeCValue, wifi6Value } = req.body;

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
    const klavyeLogoPath = klavyeValue ? logoMap[klavyeValue] : null;
    const maviIsikLogoPath = maviIsikValue ? logoMap[maviIsikValue] : null;
    const typeCLogoPath = typeCValue ? logoMap[typeCValue] : null;
    const wifi6LogoPath = wifi6Value ? logoMap[wifi6Value] : null;

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
    if (klavyeLogoPath && !fs.existsSync(klavyeLogoPath)) {
      return res.status(400).json({ message: `Klavye logosu bulunamadı: ${klavyeLogoPath}` });
    }
    if (maviIsikLogoPath && !fs.existsSync(maviIsikLogoPath)) {
      return res.status(400).json({ message: `Mavi Işık logosu bulunamadı: ${maviIsikLogoPath}` });
    }
    if (typeCLogoPath && !fs.existsSync(typeCLogoPath)) {
      return res.status(400).json({ message: `Type-C logosu bulunamadı: ${typeCLogoPath}` });
    }
    if (wifi6LogoPath && !fs.existsSync(wifi6LogoPath)) {
      return res.status(400).json({ message: `Wifi 6 logosu bulunamadı: ${wifi6LogoPath}` });
    }

    // Laptop görselini sabit boyutlara resize et
    const laptopResizedBuffer = await sharp(laptopImageBuffer)
      .resize(imageConfig.laptop.width, imageConfig.laptop.height, {
        fit: 'cover', // Oranları koruyarak kırpma yapar
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    console.log(`Laptop görseli ${imageConfig.laptop.width}x${imageConfig.laptop.height} boyutuna resize edildi`);

    // Sabit logo boyutlarını yapılandırmadan al
    const osLogoSize = imageConfig.logoSizes.os;
    const processorLogoSize = imageConfig.logoSizes.processor;
    const hzLogoSize = imageConfig.logoSizes.hz;
    const ekranKartiLogoSize = imageConfig.logoSizes.ekranKarti;
    const hdmiLogoSize = imageConfig.logoSizes.hdmi;
    const klavyeLogoSize = imageConfig.logoSizes.klavye;
    const maviIsikLogoSize = imageConfig.logoSizes.maviIsik;
    const typeCLogoSize = imageConfig.logoSizes.typeC;
    const wifi6LogoSize = imageConfig.logoSizes.wifi6;

    console.log(`Sabit logo boyutları - OS: ${osLogoSize.width}x${osLogoSize.height}px...`);

    // Logoları sabit boyutlara resize et
    let osLogoBuffer, processorLogoBuffer, hzLogoBuffer, ekranKartiLogoBuffer, hdmiLogoBuffer, klavyeLogoBuffer, maviIsikLogoBuffer, typeCLogoBuffer, wifi6LogoBuffer;
    try {
      // Tüm logoları sabit boyutlara resize et (oranları koruyarak)
      osLogoBuffer = await sharp(osLogoPath)
        .resize(osLogoSize.width, osLogoSize.height, {
          fit: 'contain', // Oranları koru, belirtilen boyutun içine sığdır
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Şeffaf arka plan
        })
        .png()
        .toBuffer();
      
      processorLogoBuffer = await sharp(processorLogoPath)
        .resize(processorLogoSize.width, processorLogoSize.height, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();

      if (hzLogoPath) {
        hzLogoBuffer = await sharp(hzLogoPath)
          .resize(hzLogoSize.width, hzLogoSize.height, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toBuffer();
        const hzResizedMetadata = await sharp(hzLogoBuffer).metadata();
        console.log(`Hz resize sonrası: ${hzResizedMetadata.width}x${hzResizedMetadata.height}px`);
      }

      if (ekranKartiLogoPath) {
        ekranKartiLogoBuffer = await sharp(ekranKartiLogoPath)
          .resize(ekranKartiLogoSize.width, ekranKartiLogoSize.height, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toBuffer();
        const ekranKartiResizedMetadata = await sharp(ekranKartiLogoBuffer).metadata();
        console.log(`Ekran Kartı resize sonrası: ${ekranKartiResizedMetadata.width}x${ekranKartiResizedMetadata.height}px`);
      }

      if (hdmiLogoPath) {
        hdmiLogoBuffer = await sharp(hdmiLogoPath)
          .resize(hdmiLogoSize.width, hdmiLogoSize.height, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toBuffer();
        const hdmiResizedMetadata = await sharp(hdmiLogoBuffer).metadata();
        console.log(`HDMI resize sonrası: ${hdmiResizedMetadata.width}x${hdmiResizedMetadata.height}px`);
      }

      if (klavyeLogoPath) {
        klavyeLogoBuffer = await sharp(klavyeLogoPath)
          .resize(klavyeLogoSize.width, klavyeLogoSize.height, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toBuffer();
      }
      if (maviIsikLogoPath) {
        maviIsikLogoBuffer = await sharp(maviIsikLogoPath)
          .resize(maviIsikLogoSize.width, maviIsikLogoSize.height, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toBuffer();
      }
      if (typeCLogoPath) {
        typeCLogoBuffer = await sharp(typeCLogoPath)
          .resize(typeCLogoSize.width, typeCLogoSize.height, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toBuffer();
      }
      if (wifi6LogoPath) {
        wifi6LogoBuffer = await sharp(wifi6LogoPath)
          .resize(wifi6LogoSize.width, wifi6LogoSize.height, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toBuffer();
      }
    } catch (logoError) {
      console.error('Logo resize hatası:', logoError);
      return res.status(500).json({ 
        message: 'Logolar işlenirken hata oluştu',
        error: logoError.message 
      });
    }

    // Composite array'ini oluştur - sabit koordinatları kullan
    const compositeArray = [
      {
        input: osLogoBuffer,
        left: imageConfig.logoPositions.os.x,
        top: imageConfig.logoPositions.os.y
      },
      {
        input: processorLogoBuffer,
        left: imageConfig.logoPositions.processor.x,
        top: imageConfig.logoPositions.processor.y
      }
    ];

    // Diğer logoları ekle (varsa)
    if (hzLogoBuffer) {
      compositeArray.push({
        input: hzLogoBuffer,
        left: imageConfig.logoPositions.hz.x,
        top: imageConfig.logoPositions.hz.y
      });
      console.log(`Hz konumu: x=${imageConfig.logoPositions.hz.x}, y=${imageConfig.logoPositions.hz.y}`);
    }

    if (ekranKartiLogoBuffer) {
      compositeArray.push({
        input: ekranKartiLogoBuffer,
        left: imageConfig.logoPositions.ekranKarti.x,
        top: imageConfig.logoPositions.ekranKarti.y
      });
      console.log(`Ekran Kartı konumu: x=${imageConfig.logoPositions.ekranKarti.x}, y=${imageConfig.logoPositions.ekranKarti.y}`);
    }

    if (hdmiLogoBuffer) {
      compositeArray.push({
        input: hdmiLogoBuffer,
        left: imageConfig.logoPositions.hdmi.x,
        top: imageConfig.logoPositions.hdmi.y
      });
      console.log(`HDMI konumu: x=${imageConfig.logoPositions.hdmi.x}, y=${imageConfig.logoPositions.hdmi.y}`);
    }

    if (klavyeLogoBuffer) {
      compositeArray.push({
        input: klavyeLogoBuffer,
        left: imageConfig.logoPositions.klavye.x,
        top: imageConfig.logoPositions.klavye.y
      });
    }
    if (maviIsikLogoBuffer) {
      compositeArray.push({
        input: maviIsikLogoBuffer,
        left: imageConfig.logoPositions.maviIsik.x,
        top: imageConfig.logoPositions.maviIsik.y
      });
    }
    if (typeCLogoBuffer) {
      compositeArray.push({
        input: typeCLogoBuffer,
        left: imageConfig.logoPositions.typeC.x,
        top: imageConfig.logoPositions.typeC.y
      });
    }
    if (wifi6LogoBuffer) {
      compositeArray.push({
        input: wifi6LogoBuffer,
        left: imageConfig.logoPositions.wifi6.x,
        top: imageConfig.logoPositions.wifi6.y
      });
    }

    // Logoları yerleştirmek için Sharp'ı kullan
    const finalImageBuffer = await sharp(laptopResizedBuffer)
      .composite(compositeArray)
      .jpeg({ 
        quality: 100, 
        chromaSubsampling: '4:4:4' // Renk kalitesini artırır
      }) 
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