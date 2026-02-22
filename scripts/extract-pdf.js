const fs = require('fs');
const pdfParse = require('pdf-parse');

const filePath = process.argv[2];

if (!filePath) {
    console.error("No file path provided to pdf extractor script.");
    process.exit(1);
}

try {
    const buffer = fs.readFileSync(filePath);
    pdfParse(buffer).then(data => {
        // Log the text to stdout so the parent process can read it
        console.log(data.text);
    }).catch(err => {
        console.error("PDF Parse native error: " + err.message);
        process.exit(1);
    });
} catch (fsErr) {
    console.error("FS Error reading PDF before parse: " + fsErr.message);
    process.exit(1);
}
