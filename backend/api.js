const express = require('express');
const neo4j = require('neo4j-driver');
const router = express.Router();

// Connect to Neo4j
const driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', 'strongpassword123')
);

const neo4jIntegerToNumber = (value) => {
    return neo4j.isInt(value) ? value.toNumber() : value;
};

router.get('/rank-contracted-companies-by-public-entities-count', async (req, res) => {
    const { cpv } = req.query;
    console.log('cpv: ', cpv);

    const query = `
        MATCH (pe:PublicEntity)-[:HAS_LEGAL_TENDER]->(c:Contract {cpvDesignation: $cpv})-[:ASSOCIATED_WITH]->(oc:OtherCompany)
        WITH oc, COUNT(DISTINCT pe) AS publicEntitiesCount, COUNT(c) AS contractsCount
        ORDER BY publicEntitiesCount DESC, contractsCount DESC
        LIMIT 10
        RETURN oc.name AS otherCompanyName, publicEntitiesCount, contractsCount
    `;

    const session = driver.session();
    try {
        const result = await session.run(query, { cpv });
        const responseData = result.records.map(record => ({
            otherCompanyName: record.get('otherCompanyName'),
            publicEntitiesCount: neo4jIntegerToNumber(record.get('publicEntitiesCount')),
            contractsCount: neo4jIntegerToNumber(record.get('contractsCount')),
        }));
        res.json(responseData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    } finally {
        await session.close();
    }
});

router.get('/rank-public-entities-by-distribution-of-contracts', async (req, res) => {

    const query = `
        MATCH (pe:PublicEntity)-[:HAS_LEGAL_TENDER]->(c:Contract)
        WITH pe, COUNT(c) AS totalContracts
        OPTIONAL MATCH (pe)-[:HAS_LEGAL_TENDER]->(c)-[:ASSOCIATED_WITH]->(oc:OtherCompany)
        WITH pe, totalContracts, oc, COUNT(c) AS contractCount
        RETURN 
            pe.name AS publicEntityName, 
            oc.name AS otherCompanyName, 
            contractCount,
            totalContracts
        ORDER BY contractCount DESC
    `;

    const session = driver.session();
    try {
        const result = await session.run(query);
        const responseData = result.records.map(record => ({
            publicEntityName: record.get('publicEntityName'),
            otherCompanyName: record.get('otherCompanyName'),
            contractCount: record.get('contractCount').low,
            totalContracts: record.get('totalContracts').low
        }));

        console.log('responseData: ', responseData);

        res.json(responseData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    } finally {
        await session.close();
    }
});

const startApi = (app, driver) => {
    app.use('/api', router);
};

module.exports = startApi;