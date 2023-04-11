const { DocumentAnalysisClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");

const fs = require("fs");
var mysql = require('mysql');

async function main() {
  const endpoint = "https://schindtest1.cognitiveservices.azure.com/";
  const apiKey = "6a51019a1563472e9eb17dbda4fc1ee8";
  const modelId = "Run_01";
  console.log("mid",modelId)
  const path = "sample.pdf";
  console.log("fsfsfs")

  
  const readStream = fs.createReadStream(path);

  const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));
  const poller = await client.beginAnalyzeDocument(modelId, readStream, {
    onProgress: ({ status }) => {
      console.log(`status: ${status}`);
    },
  });

  // There are more fields than just these three
  const { documents, pages, tables } = await poller.pollUntilDone();

  console.log("Documents:");
  for (const document of documents || []) {
    console.log(`Type: ${document.docType}`);
    console.log("Fields:");
    sqlhold=""
    for (const [name, field] of Object.entries(document.fields)) {
    sqlB= name;
    sqlV=field.value;
    sqlhold=sqlhold+"'"+sqlV+"' ,";
    console.log("fsfsf:", sqlhold)
      console.log(
        `Field ${name} has value '${field.value}' with a confidence score of ${field.confidence}`
      );
    }
    sqlA = "INSERT INTO `FRecognition` (Project,BidDate,Address,State,ZipCode ,Equipment ,ContactEmail,EmailDate,ContactPhone,ContactName) VALUES (";
      sqlhold = sqlhold.substring(0, sqlhold.length-1);
      sqlF=sqlA+sqlhold+")";
      console.log("sqlholdF",sqlhold);
      console.log("sqlF", sqlF);

      const RTL=mysql.createConnection({host:'localhost', user:"Foreign", password:'Foreign-Donut-02', database:'forms1'});
      RTL.query(sqlF, function (err, result) {
        if (err) throw err;
        console.log("logged");
      })
  }
  console.log("Pages:");
  for (const page of pages || []) {
    console.log(`Page number: ${page.pageNumber} (${page.width}x${page.height} ${page.unit})`);
  }

  console.log("Tables:");
  for (const table of tables || []) {
    console.log(`- Table (${table.columnCount}x${table.rowCount})`);
    for (const cell of table.cells) {
      console.log(`  - cell (${cell.rowIndex},${cell.columnIndex}) "${cell.content}"`);
    }
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});