const fs = require('fs');
const cheerio = require('cheerio');

const inputFile = 'input.html';
const outputFile = 'output.csv';

// Read HTML file
const html = fs.readFileSync(inputFile, 'utf8');
const $ = cheerio.load(html);

const rows = [];

// Iterate through rows
$('tr').each((index, tr) => {
    const tds = $(tr).find('td');
    if (index === 0 || tds.length < 7) return; // Skip header or invalid rows

    rows.push([
        $(tds[0]).text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
        $(tds[1]).text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
        $(tds[2]).text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
        $(tds[3]).text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
        $(tds[4]).text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
        $(tds[5]).text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
        $(tds[6]).find('a').attr('href') ? $(tds[6]).find('a').attr('href').split('id=')[1] : 'N/A'
    ]);
});

console.log('Extracted rows:', rows);

// Append to CSV
const csvContent = rows.map(row => row.join(',')).join('\n') + '\n';
fs.appendFileSync(outputFile, csvContent, 'utf8');

console.log(`Data appended to ${outputFile}`);