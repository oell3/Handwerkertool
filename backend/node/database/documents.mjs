
import puppeteer from "puppeteer";

async function generatePDF(revisionId, config) {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(`http://localhost:8080/angebote/${revisionId}/pdf`, {
        waitUntil: 'load'
    });


    const filePath = `./pdfs/angebot_${revisionId}.pdf`;

    

    
    const header = await getHeader(config);
console.log("Header",await header);
    await page.pdf({
        path: filePath,
        format: 'A4',
        displayHeaderFooter: true,
        headerTemplate: header,
        footerTemplate: `
       <div class="footer" style="margin-bottom: 30px;
       bottom:0;
      left: 0;
      right: 0;
      background: white;
      z-index: 1000;
      text-align: center;
      font-size: 10px;
      color: #666;
      width:100%;
      border-top: 1px solid #999;" 
      bis_skin_checked="1">
        test
       </div>
   `,

   margin: {
    top: '200px', // INCREASE THIS VALUE
    bottom: '50px',
    left: '25mm',
    right: '15mm'
  }
})
    await browser.close();

    return filePath;
    
}

async function ImageToBase(imagePath, format){
    return await fetch(imagePath, { method: "GET" })
.then(async (response) => {
if (response.status === 200) {
const imageBuffer = await response.arrayBuffer();

const base64Image = Buffer.from(imageBuffer).toString('base64');;
return `data:image/${format};base64,` + base64Image;
}
});
}

async function getHeader(config){


    if(config.logo.url && config.header.showCompany){
         const logoPosition = getposition(config);
         const position = getCompanyPosition(config)
        const headerlogo = await ImageToBase(`http://localhost:8080/${config.logo.url}`, config.logo.format);
        return `
         <div class="" style="top: 0; left: 25mm; right: 15mm; height: 100px; background-color: #f0f0f0; width: 100%;font-size: 12px; padding: 10px;">
        <img src="${headerlogo}" alt="Logo" style="${logoPosition};width: ${config.logo.width}px; margin: 10px;">
        <div class="header-content" style="${position};">

          
            <div bis_skin_checked="1">
              ${config.company.name}
            </div>

        </div>
        
     
    `
    }
    if(config.logo.url && !config.header.showCompany){
         const logoPosition = getposition(config);
        const headerlogo = await ImageToBase(config.logo.url);
        return `
        <div class="" style="top: 0; left: 25mm; right: 15mm; height: 100px; background-color: #f0f0f0; width: 100%;text-align: center; font-size: 12px; padding: 10px; display: flex; align-items: center; justify-content: center;">
        
        <img src="${headerlogo}" alt="Logo" style="${logoPosition};width: ${config.logo.width}px; height: 80px; margin: 10px;">        
        </div>
    `
    }
    if(!config.logo.url && config.header.showCompany){
        const position = getCompanyPosition(config)
         return `  <div class="" style="top: 0; left: 25mm; right: 15mm; height: 100px; background-color: #f0f0f0; width: 100%;text-align: center; font-size: 12px; padding: 10px; display: flex; align-items: center; justify-content: center;">
        <div class="header-content" style="${position};">

          
            <div bis_skin_checked="1">
              ${config.company.name}
            </div>

        </div>
        
        </div>
        `
    }
    return ``;

}

function getposition(config){
    if(config.logo.position === 'left'){
        return 'float:left'
    }

    if(config.logo.position ==='right'){
        return 'float: right'
    }

    if(config.logo.position ==='center'){
        return 'display:block;margin: 0 auto'
    }
}

function getCompanyPosition(config){

if(config.header.CompanyPosition === "right") return 'float:right';
if(config.header.CompanyPosition === "left") return 'float:left';

}

export {generatePDF}
