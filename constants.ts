
import type { Section } from './types';

export const sections: Section[] = [
  {
    id: 'I',
    title: 'İskelet Yapın',
    questions: [
      {
        id: 'I.1',
        text: 'Dikey çizginiz (boyunuz değil, ne kadar uzun göründüğünüz):',
        options: [
          { id: 'a', text: 'Uzun', subtext: 'İnsanlar her zaman olduğumdan daha uzun olduğumu düşünür.' },
          { id: 'b', text: 'Orta derecede uzun', subtext: 'İnsanlar bazen biraz daha uzun olduğumu tahmin ederler, ama çok değil.' },
          { id: 'c', text: 'Orta', subtext: 'İnsanlar genellikle boyumu doğru tahmin eder veya şaşırmazlar.' },
          { id: 'd', text: 'Kısa yapılı', subtext: 'İnsanlar genellikle biraz daha kısa olduğumu düşünür ve kıvrımlı hatlarım boyumdan daha çok dikkat çeker.' },
          { id: 'e', text: 'Minyon', subtext: 'Küçük yapılı olduğum herkes için çok belirgindir.' },
        ],
      },
      {
        id: 'I.2',
        text: 'Omuzlarınızın şeklini en iyi tanımlayan ifade:',
        options: [
          { id: 'a', text: 'Dar, keskin' },
          { id: 'b', text: 'Geniş, küt' },
          { id: 'c', text: 'Simetrik, orantılı' },
          { id: 'd', text: 'Eğimli ama sivri uçlu' },
          { id: 'e', text: 'Eğimli ve yuvarlak' },
        ],
      },
      {
        id: 'I.3',
        text: 'Kollarınızın ve bacaklarınızın uzunluğunu en iyi tanımlayan ifade:',
        options: [
          { id: 'a', text: 'Uzun, dar' },
          { id: 'b', text: 'Uzun, geniş' },
          { id: 'c', text: 'Orta, boyumla ve üst gövdemle orantılı' },
          { id: 'd', text: 'Küçük, hafifçe kısa' },
          { id: 'e', text: 'Küçük, boyuma ve üst gövdeme oranla çok kısa' },
        ],
      },
      {
        id: 'I.4',
        text: 'Ellerinizin ve ayaklarınızın boyutu ve şeklini en iyi tanımlayan ifade:',
        options: [
          { id: 'a', text: 'Uzun ve dar' },
          { id: 'b', text: 'Büyük ve geniş' },
          { id: 'c', text: 'Orta; ne uzun, ne geniş, ne narin, ne de küçük' },
          { id: 'd', text: 'Küçük, dar, narin' },
          { id: 'e', text: 'Küçük ve hafif geniş' },
        ],
      },
    ],
  },
  {
    id: 'II',
    title: 'Vücut Hatların',
    questions: [
      {
        id: 'II.1',
        text: 'Vücudunuzun genel şeklini en iyi tanımlayan ifade:',
        options: [
          { id: 'a', text: 'Uzun, zayıf, kaslı' },
          { id: 'b', text: 'Geniş, kaslı olmaya eğilimli' },
          { id: 'c', text: 'Simetrik, dengeli oranlara sahip' },
          { id: 'd', text: 'Çok şekilli, narin bir kum saati figürü' },
          { id: 'e', text: 'Çok yumuşak, dolgun kıvrımlı, olgun bir kum saati' },
        ],
      },
      {
        id: 'II.2',
        text: 'Göğüs/gövde bölgenizi en iyi tanımlayan ifade:',
        options: [
          { id: 'a', text: 'Düz, gergin', subtext: 'Kilo aldığımda bile bu bölgede yağlanma olmaz.' },
          { id: 'b', text: 'Geniş, enli', subtext: 'Kilo aldığımda burada biraz yağlanma olur, ama çok değil.' },
          { id: 'c', text: 'Orta, belim ve kalçalarımla orantılı' },
          { id: 'd', text: 'Şekilli, kıvrımlı, belime göre daha belirgin', subtext: 'Gövdem biraz kısa ve kilo aldığımda burada yağlanma olur.' },
          { id: 'e', text: 'Çok belirgin, dolgun kıvrımlı', subtext: 'Zayıf ya da kilolu olsam da her zaman "göğüslüyümdür".' },
        ],
      },
      {
        id: 'II.3',
        text: 'Bel oyuntunuzu en iyi tanımlayan ifade:',
        options: [
            { id: 'a', text: 'Uzun ama erkeksi şekilde düz', subtext: 'Kilo aldığımda bile bu böyledir.' },
            { id: 'b', text: 'Uzun ama çok düz (zayıfken) veya kalın (kiloluyken) olmaya eğilimli' },
            { id: 'c', text: 'Orta, hafif belirgin ama aşırı ince değil' },
            { id: 'd', text: 'Göğüs ve kalçalarıma oranla çok ince' },
            { id: 'e', text: 'Yumuşak hatlarla belirgin ama hafif geniş olmaya eğilimli' },
        ]
      },
      {
        id: 'II.4',
        text: 'Kalça çizginizi en iyi tanımlayan ifade:',
        options: [
          { id: 'a', text: 'Sivrilen, düz ve erkeksi dar', subtext: 'Ancak kilo aldığımda burada kalınlaşma eğilimi gösterir.' },
          { id: 'b', text: 'Düz, hafif sivrilen ve hafif geniş', subtext: 'Fazla kilolar her zaman kalçamda toplanır.' },
          { id: 'c', text: 'Orta, göğüs ve belimle orantılı' },
          { id: 'd', text: 'Şekilli ve yuvarlak, belime göre daha belirgin' },
          { id: 'e', text: 'Kilom ne olursa olsun son derece yumuşak ve yuvarlak' },
        ]
      },
      {
        id: 'II.5',
        text: 'Üst kollarınızdaki ve uyluklarınızdaki etli yapıyı en iyi tanımlayan ifade:',
        options: [
          { id: 'a', text: 'Uzun, esnek ve kaslı' },
          { id: 'b', text: 'Uzun ve kaslı olmaya eğilimli' },
          { id: 'c', text: 'Orta; ne aşırı yumuşak ne de aşırı kaslı veya sinirli' },
          { id: 'd', text: 'Yumuşak, hafifçe kısa' },
          { id: 'e', text: 'Çok yumuşak, hafif geniş ve etli, hafifçe kısa' },
        ]
      },
    ],
  },
  {
    id: 'III',
    title: 'Yüz Kemiklerin',
    questions: [
      {
        id: 'III.1',
        text: 'Çene hattınızın şeklini en iyi tanımlayan ifade:',
        options: [
            { id: 'a', text: 'Keskin; ya çok sivri, ya çok belirgin ya da çok köşeli' },
            { id: 'b', text: 'Geniş veya küt, hafifçe enli' },
            { id: 'c', text: 'Orta, simetrik; ne geniş, ne keskin, ne de yuvarlak' },
            { id: 'd', text: 'Narin, sivrilen veya hafifçe dar' },
            { id: 'e', text: 'Yuvarlak veya yumuşakça geniş' },
        ]
      },
      {
        id: 'III.2',
        text: 'Burnunuzun şeklini en iyi tanımlayan ifade:',
        options: [
            { id: 'a', text: 'Keskin veya belirgin' },
            { id: 'b', text: 'Geniş veya küt ama büyükçe, muhtemelen enli' },
            { id: 'c', text: 'Orta, simetrik; ne aşırı büyük ne de aşırı yuvarlak' },
            { id: 'd', text: 'Narin, sivrilen, dar' },
            { id: 'e', text: 'Yuvarlak, yumuşakça geniş ama büyük değil' },
        ]
      },
      {
        id: 'III.3',
        text: 'Elmacık kemiklerinizin şeklini en iyi tanımlayan ifade:',
        options: [
            { id: 'a', text: 'Yüksek, belirgin' },
            { id: 'b', text: 'Geniş' },
            { id: 'c', text: 'Simetrik, orta' },
            { id: 'd', text: 'Narin, dar, hafifçe yuvarlak' },
            { id: 'e', text: 'Yuvarlak, yumuşakça geniş, "elma yanaklı"' },
        ]
      },
    ]
  },
  {
    id: 'IV',
    title: 'Yüz Detayların',
    questions: [
        {
            id: 'IV.1',
            text: 'Gözlerinizin şeklini en iyi tanımlayan ifade:',
            options: [
                { id: 'a', text: 'Dar, düz, birbirine yakın veya badem şeklinde' },
                { id: 'b', text: 'Dar, düz, birbirinden ayrık' },
                { id: 'c', text: 'Orantılı aralıklı, simetrik, orta büyüklükte' },
                { id: 'd', text: 'Yuvarlak, birbirine hafif yakın, muhtemelen hafif badem şeklinde veya yukarı çekik' },
                { id: 'e', text: 'Çok yuvarlak ve çok büyük' },
            ]
        },
        {
            id: 'IV.2',
            text: 'Dudaklarınızın şeklini en iyi tanımlayan ifade:',
            options: [
                { id: 'a', text: 'Düz, dar, bazen "ince dudaklı" olarak tanımlanır' },
                { id: 'b', text: 'Düz, güçlü, hafif geniş ama dolgun değil' },
                { id: 'c', text: 'Orta, dengeli şekilli; ne düz ne de aşırı dolgun' },
                { id: 'd', text: 'Hafif dolgun ve yuvarlak' },
                { id: 'e', text: 'Çok dolgun, çok yuvarlak ve çok çekici' },
            ]
        },
        {
            id: 'IV.3',
            text: 'Yanaklarınızdaki etli yapıyı en iyi tanımlayan ifade:',
            options: [
                { id: 'a', text: 'Kilo aldığımda bile gergin ve düz' },
                { id: 'b', text: 'Oldukça gergin ama kilo aldığımda biraz "şişkinleşme" eğilimi gösterir' },
                { id: 'c', text: 'Orta, yumuşak ama şişkin değil' },
                { id: 'd', text: 'Yumuşak ve etli, fazla kiloyla aşırı dolgunlaşabilir' },
                { id: 'e', text: 'En zayıf halimde bile çok yumuşak, çok etli, çok yuvarlak' },
            ]
        },
    ]
  },
];
