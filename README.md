# SkinAlert

**SkinAlert** este o aplicație web de screening orientativ pentru leziuni cutanate. Încarci o fotografie, iar aplicația o analizează direct în browser pentru a semnala dacă merită o evaluare dermatologică.


> **Important:** SkinAlert nu oferă un diagnostic medical și nu înlocuiește consultul la dermatolog. Orice leziune nouă, schimbată sau suspectă trebuie evaluată de un medic.

## Ce face aplicația

- Analizează fotografii JPEG, PNG și WebP ale alunițelor sau leziunilor cutanate.
- Verifică automat calitatea imaginii înainte de analiză: claritate, luminozitate și contrast.
- Afișează un rezultat orientativ — „Benign” sau „Suspect” — împreună cu o recomandare de urmărire.
- Procesează fotografia local, pe  dispozitivul utilizatorului: imaginea nu este încărcată pe un server.
- Încarcă modelele AI doar la prima analiză și le păstrează în cache-ul browserului pentru utilizările ulterioare.
- Include o interfață responsive, accesibilă și optimizată pentru mișcare redusă.

## Tehnologii

- [Angular](https://angular.dev/) 20
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
- [OpenCV.js](https://docs.opencv.org/)
- [GSAP](https://gsap.com/) și [Lenis](https://lenis.darkroom.engineering/)

## Cum funcționează analiza


1. Utilizatorul selectează o fotografie a leziunii.
2. Aplicația verifică dacă fotografia este suficient de clară și bine iluminată.
3. Imaginea este preprocesată local: redimensionare, diminuarea firelor de păr și normalizarea culorilor.
4. Două modele ONNX rulează local în browser, iar rezultatele lor sunt combinate.
5. Aplicația afișează un rezultat orientativ și recomandă, când este necesar, consult dermatologic.

## Rulare locală

### Cerințe

- Node.js 22.22.3 sau mai nou
- npm

### Instalare

```bash
git clone https://github.com/CristianCiulica/SkinAlert.git
cd SkinAlert
npm install
npm start
```

Aplicația va fi disponibilă la `http://localhost:4200`.

### Build de producție

```bash
npm run build
```

Build-ul este generat în `dist/skinalert/browser`.

## Structura proiectului

```text
src/app/
├── core/
│   ├── analyzer.service.ts  # încărcarea modelelor și inferența locală
│   ├── motion.service.ts    # preferința pentru mișcare redusă
│   └── scroll.service.ts    # sincronizarea animațiilor de scroll
├── landing/
│   ├── landing.component.ts # structura paginii principale
│   └── sections/            # hero, analizor, tehnologie, FAQ etc.
└── shared/                  # directive și utilitare reutilizabile

public/models/               # modelele ONNX folosite în browser
ml/                          # scripturi și resurse pentru antrenarea/evaluarea modelului
```

## Confidențialitate

Analiza rulează în întregime în browser. Fotografia aleasă nu părăsește dispozitivul și nu este trimisă către un server SkinAlert.

## Limitări și utilizare responsabilă

Rezultatul poate fi influențat de calitatea imaginii, lumină, focalizare, poziția leziunii și de limitările inerente ale modelului. SkinAlert este un instrument educațional și de orientare pentru screening; nu este un dispozitiv medical certificat și nu trebuie folosit pentru autodiagnostic sau pentru amânarea îngrijirii medicale.

Dacă observi o leziune nouă, asimetrică, cu margini neregulate, culoare neuniformă, în creștere sau care sângerează, programează un consult dermatologic, indiferent de rezultatul afișat de aplicație.

## Deployment

Proiectul include configurarea pentru [Netlify](https://www.netlify.com/) în `netlify.toml`. Modelele AI și resursele de inferență sunt configurate cu cache pe termen lung pentru a reduce timpul de încărcare la vizitele următoare.

## Licență

Acest proiect este destinat uzului educațional și demonstrativ. Pentru utilizare comercială sau medicală, verifică separat cerințele legale, de confidențialitate și de validare clinică aplicabile.
