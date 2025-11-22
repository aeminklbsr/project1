// Görsel boyutları ve koordinatları yapılandırması
// Tüm görsellerin sabit boyutları ve laptop görseli üzerindeki konumları

module.exports = {
  // Laptop görselinin hedef boyutu (tüm yüklenen laptop görselleri bu boyuta resize edilecek)
  laptop: {
    width: 1400,
    height: 790
  },

  // Logo görsellerinin sabit boyutları (genişlik x yükseklik)
  logoSizes: {
    processor: { width: 250, height: 250, borderRadius: '20%' },    // İşlemci logoları
    os: { width: 400, height: 400 },            // İşletim sistemi logoları
    hz: { width: 130, height: 130 },           // Hz logoları (Küçültüldü - Sağ tarafa sığması için)
    ekranKarti: { width: 250, height: 250 },   // Ekran kartı logoları
    hdmi: { width: 130, height: 130 },         // HDMI logoları (Küçültüldü)
    klavye: { width: 130, height: 130 },       // Klavye Aydınlatma (Küçültüldü)
    maviIsik: { width: 250, height: 250 },     // Mavi Işık
    typeC: { width: 130, height: 130 },        // Type-C (Küçültüldü)
    wifi6: { width: 130, height: 130 }         // Wifi 6 (Küçültüldü)
  },

  // Logo görsellerinin laptop görseli üzerindeki koordinatları (x, y)
  // Koordinatlar sol üst köşeden başlar (0, 0)
  logoPositions: {
    processor: { x: 30, y: 20 },           // İşlemci: Sol üst
    ekranKarti: { x: 30, y: 280 },         // Ekran Kartı: Sol orta (İşlemcinin altı)
    
    // İşletim Sistemi: Ortada en altta
    // (1360/2 - 200/2 = 580)
    os: { x: 540, y: 530 },                
    
    // Sağ taraftaki logolar (5 adet logo sığması için boyutlar küçüldü ve yukarı alındı)
    hz: { x: 1170, y: 40 },                // 1. Sıra
    hdmi: { x: 1170, y: 180 },             // 2. Sıra
    typeC: { x: 1170, y: 320 },            // 3. Sıra
    klavye: { x: 1170, y: 460 },           // 4. Sıra
    wifi6: { x: 1170, y: 600 },            // 5. Sıra
    
    // Sol alttaki logolar
    maviIsik: { x: 30, y: 530 }            // Sol alt (Ekran kartının altı)
  }
};
