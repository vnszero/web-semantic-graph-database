const neo4j = require('neo4j-driver');
const { parse } = require('json2csv');
const fs = require('fs').promises;

// Neo4j driver configuration
const driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', 'strongpassword123')
);

// Convert Neo4j integers to JavaScript numbers
const neo4jIntegerToNumber = (value) => {
    return neo4j.isInt(value) ? value.toNumber() : value;
};

async function fetchDataForCpvDesignations() {
    let cpvDesignations = [];

    // Read and parse the JSON file
    try {
        console.log('Reading JSON file...');
        let cpvData = await fs.readFile('./data/input/cpv-designation-filter.json', 'utf8'); // Use await with readFile
        cpvData = cpvData.trim();
        cpvData = JSON.parse(cpvData);

        if (!Array.isArray(cpvData)) {
            throw new Error("JSON data is not an array. Check the structure of your JSON file.");
        }

        cpvData.forEach((cpv) => {
            if (cpv && cpv.cpvDesignation) { // Check if cpv and cpv.cpvDesignation exist
                cpvDesignations.push(cpv.cpvDesignation);
            } else {
                console.warn("Invalid CPV entry found:", cpv); // Log invalid entries
            }
        });

        console.log(`Loaded ${cpvDesignations.length} valid CPV designations from JSON.`);
    } catch (error) {
        console.error("Error reading or parsing JSON file:", error.message);
        return;
    }

    let results = [];

    // Process each CPV designation
    for (const cpvDesignation of cpvDesignations) {
        const session = driver.session();
        try {
            const query = `
                MATCH (pe:PublicEntity)-[:HAS_LEGAL_TENDER]->(c:Contract {cpvDesignation: $cpvDesignation})
                WITH 
                    apoc.agg.statistics(c.cpvValueNormalized) AS stats
                MATCH (pe:PublicEntity)-[:HAS_LEGAL_TENDER]->(c:Contract {cpvDesignation: $cpvDesignation})-[:ASSOCIATED_WITH]->(oc:OtherCompany)
                WITH 
                    oc, 
                    COUNT(DISTINCT pe) AS publicEntitiesCount, 
                    COUNT(c) AS contractsCount, 
                    SUM(c.cpvValue) AS totalCpvValue, 
                    SUM(c.cpvValueNormalized) AS totalCpvValueNormalized
                ORDER BY 
                    totalCpvValueNormalized DESC, 
                    contractsCount DESC, 
                    publicEntitiesCount DESC, 
                    totalCpvValue DESC
                RETURN 
                    oc.name AS otherCompanyName, 
                    $cpvDesignation AS cpvDesignation,
                    apoc.number.format(totalCpvValueNormalized, '#,##0.00') AS totalCpvValueNormalizedFormatted, 
                    contractsCount, 
                    publicEntitiesCount,
                    apoc.number.format(totalCpvValue, '#,##0.00') AS totalCpvValueFormatted
            `;

            const queryResult = await session.run(query, { cpvDesignation });
            queryResult.records.forEach((record) => {
                results.push({
                    otherCompanyName: record.get('otherCompanyName'),
                    cpvDesignation: record.get('cpvDesignation'),
                    totalCpvValueNormalizedFormatted: record.get('totalCpvValueNormalizedFormatted'),
                    contractsCount: neo4jIntegerToNumber(record.get('contractsCount')),
                    publicEntitiesCount: neo4jIntegerToNumber(record.get('publicEntitiesCount')),
                    totalCpvValueFormatted: record.get('totalCpvValueFormatted'),
                });
            });

            console.log(`Processed CPV designation: ${cpvDesignation}`);
            try {
                const csv = parse(results);
                const fileName = cpvDesignation.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove accents
                fs.writeFile('./data/output/cpvDesignationsCsv/' + fileName + '.csv', csv, 'utf8');
                results = []; // Clear the results array
            } catch (error) {
                console.error('Error writing results to CSV:', error);
            }
        } catch (error) {
            console.error(`Error processing CPV designation "${cpvDesignation}":`, error);
        } finally {
            await session.close();
        }
    }
    // finish the process
    await driver.close();
    console.log('Data fetching completed.');
}

fetchDataForCpvDesignations();