const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const neo4j = require('neo4j-driver');

// Function to import a single CSV file
async function importCsvFile(filePath, driver) {
  return new Promise((resolve, reject) => {
    const nodes = [];
    const session = driver.session(); // Create a new session for each file import
    let counter = 0; // Counter to track progress

    fs.createReadStream(filePath)
      .pipe(csvParser({ separator: ';' }))
      .on('data', (row) => nodes.push(row))
      .on('end', async () => {
        try {
          for (const row of nodes) {
            const params = {
              object: row['Objeto do Contrato']?.trim() || '',
              typeProcedure: row['Tipo de Procedimento']?.trim() || '',
              contractType: row['Tipo(s) de Contrato']?.trim() || '',
              cpv: row['CPV']?.trim() || '',
              cpvType: row['CPV Tipo ']?.trim() || '',
              cpvDesignation: row['CPV Designação']?.trim() || '',
              cpvValue: parseFloat(row['CPV Valor']?.replace(',', '.') || '0'),
              contractPrice: parseFloat(row['Preço Contratual']?.replace(',', '.') || '0'),
              publicationDate: row['Data de Publicação']?.trim() || '',
              signingDate: row['Data de Celebração do Contrato']?.trim() || '',
              executionPeriod: row['Prazo de Execução']?.trim() || '',
              executionLocation: row['Local de Execução']?.trim() || '',
              justification: row['Fundamentação']?.trim() || '',
              status: row['Estado']?.trim() || '',
              publicEntity: row['Entidade(s) Adjudicante(s)']?.trim() || '',
              otherCompany: row['Entidade(s) Adjudicatária(s)']?.trim() || ''
            };

            if (!params.publicEntity || !params.otherCompany) {
              console.warn(`Incomplete data skipped: ${JSON.stringify(row)}`);
              continue;
            }

            // Extract the identifier from parentheses for matching
            const publicEntityId = params.publicEntity.match(/\((\d+)\)/)?.[1] || null;
            const otherCompanyId = params.otherCompany.match(/\((\d+)\)/)?.[1] || null;

            if (!publicEntityId || !otherCompanyId) {
              console.warn(`Could not extract unique ID from: ${JSON.stringify(row)}`);
              continue;
            }

            // Extract number from executionPeriod (e.g., "365 dias")
            const executionPeriodNumber = parseInt(params.executionPeriod.match(/\d+/)?.[0] || '0', 10);

            if (executionPeriodNumber > 0) {
                // Normalize the cpvValue by executionPeriod
                params['cpvValueNormalized'] = parseFloat(
                  (params['cpvValue'] / executionPeriodNumber).toFixed(2)
                );
            } else {
                console.warn(`Invalid execution period for row: ${JSON.stringify(row)}`);
                params['cpvValueNormalized'] = params['cpvValue']; // it means that execution period does not matter
            }

            await session.writeTransaction(async (tx) => {
              // Merge the public entity using the extracted identifier, keeping the full name as a property
              await tx.run(
                `MERGE (pe:PublicEntity {id: $publicEntityId})
                 ON CREATE SET pe.name = $publicEntity`,
                { publicEntityId, publicEntity: params.publicEntity }
              );

              // Merge the other company using the extracted identifier, keeping the full name as a property
              await tx.run(
                `MERGE (oc:OtherCompany {id: $otherCompanyId})
                 ON CREATE SET oc.name = $otherCompany`,
                { otherCompanyId, otherCompany: params.otherCompany }
              );

              // Merge the contract
              const contractResult = await tx.run(
                `MERGE (c:Contract {
                  id: apoc.create.uuid(),
                  object: $object,
                  typeProcedure: $typeProcedure,
                  contractType: $contractType,
                  cpv: $cpv,
                  cpvType: $cpvType,
                  cpvDesignation: $cpvDesignation,
                  cpvValue: $cpvValue,
                  cpvValueNormalized: $cpvValueNormalized,
                  contractPrice: $contractPrice,
                  publicationDate: $publicationDate,
                  signingDate: $signingDate,
                  executionPeriod: $executionPeriod,
                  executionLocation: $executionLocation,
                  justification: $justification,
                  status: $status
                }) RETURN c`,
                params
              );

              const contractNode = contractResult.records[0]?.get('c');

              if (contractNode) {
                // Link the public entity to the contract
                await tx.run(
                  `MATCH (pe:PublicEntity {id: $publicEntityId}), (c:Contract {id: $contractId})
                   MERGE (pe)-[:HAS_LEGAL_TENDER]->(c)`,
                  { publicEntityId, contractId: contractNode.properties.id }
                );

                // Link the contract to the other company
                await tx.run(
                  `MATCH (c:Contract {id: $contractId}), (oc:OtherCompany {id: $otherCompanyId})
                   MERGE (c)-[:ASSOCIATED_WITH]->(oc)`,
                  { contractId: contractNode.properties.id, otherCompanyId }
                );
              }
            });

            // Increment the counter and display progress
            counter++;
            if (counter % 250 === 0) {
              console.log(`${counter} records processed...`);
            }
          }

          console.log(`Successful import for file: ${filePath}`);
          resolve();
        } catch (error) {
          console.error(`Import Error ${filePath}:`, error);
          reject(error);
        } finally {
          await session.close();
        }
      })
      .on('error', (error) => {
        console.error(`Failed to read file ${filePath}:`, error);
        reject(error);
      });
  });
}

// Function to import all CSV files from health folder
async function importAllCsvFiles(driver) {
  const folderPath = path.join(__dirname, 'contracts/health');
  const files = fs.readdirSync(folderPath).filter((file) => file.endsWith('.csv'));

  for (const file of files) {
    console.log(`Start file import: ${file}`);
    await importCsvFile(path.join(folderPath, file), driver);
  }

  console.log('Mission Complete! all CSV files imported.');
}

module.exports = { importAllCsvFiles };