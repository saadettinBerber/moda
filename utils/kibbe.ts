import type { AnalysisResult } from '../types';

type AnswerKey = 'a' | 'b' | 'c' | 'd' | 'e';

type InsightConfig = {
  label: string;
  questionId: string;
  descriptions: Partial<Record<AnswerKey, string>>;
};

const TYPE_DESCRIPTIONS: Record<string, string> = {
  Dramatic: 'Keskin hatlar, güçlü siluetler ve yüksek kontrast stiller bedenini öne çıkarır.',
  'Flamboyant Natural': 'Uzun çizgiler ve salaş zarafet senin doğal enerjini destekler; oversized ceketler ve akışkan kumaşlar harika çalışır.',
  'Soft Natural': 'Yumuşak omuzlar ve akışkan kalıplar ile hafif bohem dokular seni ışıldatır.',
  'Soft Classic': 'Dengeli hatların sofistike, zarif ve hafif yuvarlatılmış siluetler ile parlar.',
  'Dramatic Classic': 'Simetrik bedenin keskin omuz detaylarıyla birleştiğinde modern, rafine bir aura yaratır.',
  Classic: 'Simetri ve sadelik anahtarın; hafif yapılandırılmış ve temiz hatlı parçalar seni vurgular.',
  'Theatrical Romantic': 'Yumuşak kıvrımlarına dramatik dokunuşlar ekleyerek sahne ışıltısını yakalarsın.',
  Romantic: 'Feminen, kıvrımlı ve lüks dokularla romantik enerjini yansıtırsın.',
  'Flamboyant Gamine': 'Kontrast, enerjik desenler ve maskülen-feminen karışım seni canlı kılar.',
  'Soft Gamine': 'Kısa karşıtlığın ve yuvarlak hatların, tatlı ama enerjik kombinlerle bütünleşir.',
  Gamine: 'Keskin/yuvarlak karışımıyla oyunlu desenler ve kırpılmış siluetler sende harika durur.',
  'Karışık (Belirgin Bir Tip Bulunamadı)': 'Cevapların dengeli, bu yüzden farklı Kibbe detaylarını deneyerek kendi karışımını keşfedebilirsin.'
};

const PALETTE_HINTS: Record<string, string> = {
  Dramatic: 'Metaliksiz kontrast paletler, siyah-beyaz bloklar ve mücevher tonları.',
  'Flamboyant Natural': 'Toprak tonları, güneş efektli degrade renkler ve canlı denimler.',
  'Soft Natural': 'Isınmış nötrler, okrenden şeftaliye uzanan tonlar ve eskitilmiş metalikler.',
  'Soft Classic': 'Şampanya, gül altın ve pastel tonlar zarafetini pekiştirir.',
  'Dramatic Classic': 'Saf beyaz, lacivert ve zengin kırmızılar; yapılandırılmış desenlerle harmanla.',
  Classic: 'Nötr paletler, çelik maviler, lacivertler ve hafif yumuşatılmış kontrastlar.',
  'Theatrical Romantic': 'Yakut, zümrüt, parlak fuşya ve saten dokular ile çarpıcı bir aura yarat.',
  Romantic: 'Gül, şeftali, vişne ve inci tonları yumuşak feminen enerjini yansıtır.',
  'Flamboyant Gamine': 'Pop neonlar, siyah-beyaz grafikler ve parlak aksesuarlar.',
  'Soft Gamine': 'Şeker pasteller, parlak ama yumuşak tonlar ve dokulu kumaşlar.',
  Gamine: 'Cesur desen kombinleri; blok renkler ve yüksek kontrastlı küçük ölçekli desenler.',
};

const CLOTHING_SUGGESTIONS: Record<string, string[]> = {
  Dramatic: [
    'Keskin omuz detaylı ceketler ve asimetrik kesimler',
    'Yapılandırılmış takım elbiseler ve uzun çizgili elbiseler'
  ],
  'Flamboyant Natural': [
    'Oversize blazerlar, uzun yelekler ve akışkan pantolonlar',
    'Keten, pamuk ve doğal dokulu kumaşlarla katmanlı kombinler'
  ],
  'Soft Natural': [
    'Yarı yapılı blazerlar ve beli hafif vurgulayan elbiseler',
    'Drapeli üstler, yumuşak triko elbiseler ve doğal desenler'
  ],
  'Soft Classic': [
    'Bel hatını takip eden ceketler ve zarif midi elbiseler',
    'İnce kemerler, pileli etekler ve pastel tonlu takımlar'
  ],
  'Dramatic Classic': [
    'Koleksiyon görünümü veren keskin siluetli elbiseler',
    'Boyfriend değil, bel hizasında biten blazer ve cigarette pantolon'
  ],
  Classic: [
    'Minimalist gömlek elbiseler ve düz kesim pantolon takımları',
    'Tek renkli kombinler ve zarif triko üstler'
  ],
  Natural: [
    'Gevşek dökümlü üstler ve düz kesim pantolonlarla rahat siluetler',
    'Katmanlı kombinler, salaş kazaklar ve özgür hareket eden parçalar'
  ],
  'Theatrical Romantic': [
    'Bedenini saran, inci veya metal detaylı elbiseler',
    'Kruvaze kesimler, peplum ceketler ve dramayı vurgulayan detaylar'
  ],
  Romantic: [
    'Akışkan kumaşlı elbiseler ve bel vurgulu bluzlar',
    'Dantel, saten ve yumuşak drapeli üstler'
  ],
  'Flamboyant Gamine': [
    'Kısa ceketler, crop üstler ve yüksek bel pantolonlar',
    'Cesur desen karışımları ve çarpıcı aksesuarlar'
  ],
  'Soft Gamine': [
    'Beden hatlarını takip eden mini ceketler ve pileli etekler',
    'Yumuşak yapılandırılmış tulumlar ve retro esintili desenler'
  ],
  Gamine: [
    'Kısa siluetler, bol-beden üstler ve dar paça pantolonlar',
    'Kontrast düğmeli blazerlar ve grafik desenli kazaklar'
  ],
};

const HAIR_MAKEUP_SUGGESTIONS: Record<string, string[]> = {
  Dramatic: [
    'Net çizgili kesimler; uzun, düz veya keskin küt saçlar',
    'Koyu dudak tonları ve belirgin eyeliner ile güçlü bakışlar'
  ],
  'Flamboyant Natural': [
    'Katlı, uzun ve hafif dağınık saç kesimleri',
    'Bronz tonlu doğal makyaj, belirgin kaşlar'
  ],
  'Soft Natural': [
    'Gevşek dalgalar ve yumuşak yüzü çerçeveleyen katlar',
    'Sıcak tonlarda aydınlık makyaj; krem allıklar'
  ],
  'Soft Classic': [
    'Orta uzunlukta, içe doğru kıvrılan zarif fönler',
    'Pastel tonlu farlar ve hafif parlak dudaklar'
  ],
  'Dramatic Classic': [
    'Parlak, düz fön veya Hollywood dalgaları',
    'Kırmızı dudak + belirgin eyeliner ile zarif kontrast'
  ],
  Classic: [
    'Hafif içe dönen lob veya düzenli topuzlar',
    'Dengeli makyaj: doğal gözler, belirgin ama yumuşak dudaklar'
  ],
  Natural: [
    'Uzun katlı kesimler, serbest dalgalar ve düşük bakım stiller',
    'Bronzlaştırıcı ve doğal parlaklıkla güneş öpmüş bir görünüm'
  ],
  'Theatrical Romantic': [
    'Romantik dalgalar, yüzü çerçeveleyen bukleler',
    'Işıltılı farlar ve belirgin aydınlatıcı vurgular'
  ],
  Romantic: [
    'Yumuşak dalgalar veya büyük bukleler, hacimli topuzlar',
    'Şeftali tonlarında allık ve parlak dudaklarla taze görünüm'
  ],
  'Flamboyant Gamine': [
    'Pixie, kısa bob veya asimetrik kesimler',
    'Neon eyeliner veya cesur dudaklarla oyunlu makyaj'
  ],
  'Soft Gamine': [
    'Kısa lob, hafif dalga veya vintage bukle',
    'Pastel göz makyajı ve pembe tonlu dudaklar'
  ],
  Gamine: [
    'Kısa, enerjik kesimler; kahküllerle hareket kat',
    'Mat dudaklar ve belirgin allık ile genç bir enerji'
  ],
};

const ANALYSIS_INSIGHT_CONFIGS: InsightConfig[] = [
  {
    label: 'Dikey Çizgi',
    questionId: 'I.1',
    descriptions: {
      a: 'Uzun ve dramatik – elbiselerde dikey çizgiler seni uzatır.',
      b: 'Orta-uzun denge – hafif yapılandırılmış siluetlerle risk alma.',
      c: 'Oranlı bir siluet – temiz kesimler çizgini korur.',
      d: 'Yumuşak ve kıvrımlı – bel vurgusu etkileyici olur.',
      e: 'Minyon cazibesi – kısa kesimler ve tek parça kombinler ideal.'
    }
  },
  {
    label: 'Omuz Şekli',
    questionId: 'I.2',
    descriptions: {
      a: 'Dar ve keskin – vatkalar ve yapılandırılmış omuzlar dramatik durur.',
      b: 'Geniş ve küt – omuzları dengeleyen drapeler kullan.',
      c: 'Simetrik ve dengeli – hemen her yaka formu yakışır.',
      d: 'Eğimli ve sivri – hafif vatkalı bluzlar çizgiyi netleştirir.',
      e: 'Yuvarlak ve yumuşak – omuzları kucaklayan düşük kesimler seç.'
    }
  },
  {
    label: 'Kol & Bacak',
    questionId: 'I.3',
    descriptions: {
      a: 'Uzun ve narin – kol bileğini açıkta bırakmak zarif durur.',
      b: 'Uzun ve güçlü – hafif bol paça pantolonlar proporsiyonu dengeler.',
      c: 'Orantılı – bilekte biten detaylar çizgiyi vurgular.',
      d: 'Kısa ve narin – kolyelerin ve bilekliklerin dikkat çekmesine izin ver.',
      e: 'Kısa ve yumuşak – dar paça yerine sigaret ve havuç kesimler dene.'
    }
  },
  {
    label: 'Vücut Şekli',
    questionId: 'II.1',
    descriptions: {
      a: 'Uzun ve atletik – düz kesim elbiseler ve düz çizgiler mükemmel.',
      b: 'Geniş ve güçlü – bel hatını belirginleştiren kemerlerle dengele.',
      c: 'Simetrik ve dengeli – fit-and-flare siluetler seni tanımlar.',
      d: 'Narin kum saati – bel hattını sarıp yumuşak kumaşlar kullan.',
      e: 'Dolgun kum saati – akışkan kumaşlar ve bel vurgusu anahtar.'
    }
  },
  {
    label: 'Yanaklar',
    questionId: 'IV.3',
    descriptions: {
      a: 'Gergin ve ince – kontür yerine hafif aydınlatıcı kullan.',
      b: 'Dengeli – hafif allık, doğal ışıltı yeterli.',
      c: 'Orta yumuşaklık – krem allıklarla taze görünüm yakala.',
      d: 'Yumuşak ve dolgun – drapeli yakalar yüzünü çerçeveler.',
      e: 'Çok yuvarlak – yüzü uzatan V yakalar ve saç hacmi dengele.'
    }
  }
];

const DEFAULT_STYLE_LIST = [
  'Akışkan elbiseler ve yumuşak düşen kumaşlarla siluetini vurgula.',
  'Doğal makyajla yüz hatlarını öne çıkar, canlı dokunuşlarla ışılda.'
];

export const determineKibbeType = (analysisResult: AnalysisResult): string => {
  const counts = { a: 0, b: 0, c: 0, d: 0, e: 0 };
  Object.values(analysisResult).forEach((ans) => {
    if (ans && ans in counts) {
      counts[ans as keyof typeof counts] += 1;
    }
  });

  const { a, b, c, d, e } = counts;
  const yinDE = d + e;

  if (a >= 13) return 'Dramatic';
  if (e >= 13) return 'Romantic';
  if (c >= 12) return 'Classic';
  if (b >= 12) return 'Natural';

  if (e >= 8 && e > b && e > c) {
    if (a >= 3 && a >= b && a >= c) {
      return 'Theatrical Romantic';
    }
  }

  if (Math.abs(a - yinDE) <= 2 && a + d + e >= 12) {
    if (a > yinDE) return 'Flamboyant Gamine';
    if (yinDE > a) return 'Soft Gamine';
    return 'Gamine';
  }

  const sortedPrimaries = [
    { key: 'c', value: c },
    { key: 'b', value: b },
  ].sort((x, y) => y.value - x.value);
  const primary = sortedPrimaries[0];

  if (primary.key === 'c' && c >= 7) {
    if (a >= 4 && a > yinDE) return 'Dramatic Classic';
    if (yinDE >= 4 && yinDE > a) return 'Soft Classic';
  }

  if (primary.key === 'b' && b >= 7) {
    if (a >= 4 && a > yinDE) return 'Flamboyant Natural';
    if (yinDE >= 4 && yinDE > a) return 'Soft Natural';
  }

  return 'Karışık (Belirgin Bir Tip Bulunamadı)';
};

export const createLocalSummary = (analysisResult: AnalysisResult) => {
  const kibbeType = determineKibbeType(analysisResult);
  const description = TYPE_DESCRIPTIONS[kibbeType] ?? 'Cevapların dengeli, bu yüzden farklı Kibbe esintilerini harmanlayabilirsin.';
  const palette = PALETTE_HINTS[kibbeType] ?? 'Dengeleyici nötrler ile parlayabilir, istediğin Kibbe detayını ekleyebilirsin.';

  return {
    kibbeType,
    description,
    palette,
  };
};

const getListWithFallback = (collection: Record<string, string[]>, key: string): string[] => {
  const exact = collection[key];
  if (exact && exact.length > 0) {
    return exact;
  }

  const normalized = Object.keys(collection).find((variant) => variant.toLowerCase() === key.toLowerCase());
  if (normalized && collection[normalized]?.length) {
    return collection[normalized] as string[];
  }

  return DEFAULT_STYLE_LIST;
};

export const getStyleRecommendations = (kibbeType: string) => ({
  clothing: getListWithFallback(CLOTHING_SUGGESTIONS, kibbeType),
  hairMakeup: getListWithFallback(HAIR_MAKEUP_SUGGESTIONS, kibbeType)
});

export const getAnalysisInsights = (analysisResult: AnalysisResult) => {
  return ANALYSIS_INSIGHT_CONFIGS.map(({ label, questionId, descriptions }) => {
    const answer = analysisResult[questionId];
    const description = answer ? descriptions[answer as AnswerKey] : undefined;
    return {
      label,
      value: description ?? 'Analiz tamamlandığında burada kişisel öngörülerin yer alacak.',
    };
  });
};
