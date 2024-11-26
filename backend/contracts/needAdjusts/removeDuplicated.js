const fs = require('fs');
const path = require('path');
const Papa = require('papaparse'); // Install with `npm install papaparse`

const directoryPath = './'; // Directory containing your CSV files
const outputFile = 'output.csv'; // Output file name
const compositeKeyColumns = ['CPV Valor', 'Data de Publicação']; // Composite key columns

// Helper function to parse a CSV file
function parseCsv(filePath) {
  const csvData = fs.readFileSync(filePath, 'utf8');
  return Papa.parse(csvData, { header: true, delimiter: ';' }).data; // Specify ';' as the delimiter
}

// Helper function to write to a CSV file
function writeCsv(filePath, data) {
  const csvContent = Papa.unparse(data, { delimiter: ';' }); // Use ';' as the delimiter
  fs.writeFileSync(filePath, csvContent, 'utf8');
}

// Main function
function processCsvFiles() {
  const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.csv'));
  const uniqueRows = [];
  const uniqueKeys = new Set();

  files.forEach(file => {
    console.log(`Processing file: ${file}`);
    const filePath = path.join(directoryPath, file);
    const rows = parseCsv(filePath);

    rows.forEach(row => {
        // Helper function to count occurrences of '('
        const countOccurrences = (str, char) => (str.match(new RegExp(`\\${char}`, 'g')) || []).length;
      
        // Skip rows where "CPV Valor" is NaN
        // Skip rows where "Entidade(s) Adjudicante(s)" or "Entidade(s) Adjudicatária(s)" is a list
        if (
          isNaN(parseFloat(row['CPV Valor'])) || 
          countOccurrences(row['Entidade(s) Adjudicante(s)'], '(') >= 2 || 
          countOccurrences(row['Entidade(s) Adjudicatária(s)'], '(') >= 2
        ) {
          return;
        }

      // Create a composite key
      const compositeKey = compositeKeyColumns.map(col => row[col]).join('|');
      
      // Add the row if the composite key is unique
      if (!uniqueKeys.has(compositeKey)) {
        uniqueKeys.add(compositeKey);
        uniqueRows.push(row);
      }
    });
  });

  console.log(`Writing ${uniqueRows.length} unique rows to ${outputFile}`);
  writeCsv(outputFile, uniqueRows);
}

// Run the script
processCsvFiles();
