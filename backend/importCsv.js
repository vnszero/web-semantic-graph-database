const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const neo4j = require('neo4j-driver');

// Function to import a single CSV file
async function importCsvFile(filePath, driver) {
  return new Promise((resolve, reject) => {
    const nodes = [];
    const session = driver.session(); // Create a new session for each file import

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
              console.warn(`incomplete data drop: ${JSON.stringify(row)}`);
              continue;
            }

            await session.writeTransaction(async (tx) => {
              await tx.run(
                `MERGE (pe:PublicEntity {name: $publicEntity}) RETURN pe`,
                { publicEntity: params.publicEntity }
              );
              await tx.run(
                `MERGE (oc:OtherCompany {name: $otherCompany}) RETURN oc`,
                { otherCompany: params.otherCompany }
              );
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
                await tx.run(
                  `MATCH (pe:PublicEntity {name: $publicEntity}), (c:Contract {id: $contractId})
                   MERGE (pe)-[:HAS_LEGAL_TENDER]->(c)`,
                  { publicEntity: params.publicEntity, contractId: contractNode.properties.id }
                );
                await tx.run(
                  `MATCH (c:Contract {id: $contractId}), (oc:OtherCompany {name: $otherCompany})
                   MERGE (c)-[:ASSOCIATED_WITH]->(oc)`,
                  { contractId: contractNode.properties.id, otherCompany: params.otherCompany }
                );
              }
            });
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