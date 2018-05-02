const puppeteer = require('puppeteer');

const ASSEMBLY_DISTRICT_COUNT = 80;
const SENATE_DISTRICT_COUNT = 40;

async function generatePdf(url, pdfPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'networkidle2'});
  await page.pdf({path: pdfPath, format: 'Letter'});

  await browser.close();
}

async function run() {
  console.log("Generating Assembly PDFs...");

  for (let i = 1; i <= ASSEMBLY_DISTRICT_COUNT; i++) {
    await generatePdf(`http://localhost:3000/assembly/${i}`, `${__dirname}/public/pdfs/SB-827-Assembly-${i}.pdf`);
    if (i % 5 === 0) {
      console.log(`Finished ${i} out of ${ASSEMBLY_DISTRICT_COUNT} Assembly districts.`);
    }
  }

  for (let i = 1; i <= SENATE_DISTRICT_COUNT; i++) {
    await generatePdf(`http://localhost:3000/senate/${i}`, `${__dirname}/public/pdfs/SB-827-Senate-${i}.pdf`);
    if (i % 5 === 0) {
      console.log(`Finished ${i} out of ${SENATE_DISTRICT_COUNT} Senate districts.`);
    }
  }
}

run();
