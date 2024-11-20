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
    const query = `
        MATCH (pe:PublicEntity)-[:HAS_LEGAL_TENDER]->(c:Contract {cpvDesignation: 'Produtos farmacêuticos'})-[:ASSOCIATED_WITH]->(oc:OtherCompany)
        WITH oc, COUNT(DISTINCT pe) AS publicEntitiesCount, COUNT(c) AS contractsCount
        ORDER BY publicEntitiesCount DESC, contractsCount DESC
        LIMIT 10
        RETURN oc.name AS otherCompanyName, publicEntitiesCount, contractsCount
    `;

    const session = driver.session();
    try {
        const result = await session.run(query);
        const responseData = result.records.map(record => ({
            otherCompanyName: record.get('otherCompanyName'),
            publicEntitiesCount: neo4jIntegerToNumber(record.get('publicEntitiesCount')),
            contractsCount: neo4jIntegerToNumber(record.get('contractsCount'))
        }));
        res.json(responseData);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'An error occurred while fetching the data' });
    } finally {
        await session.close();
    }
});

router.get('/rank-contracted-companies-by-contracts-count', async (req, res) => {
    const query = `
        MATCH (pe:PublicEntity)-[:HAS_LEGAL_TENDER]->(c:Contract {cpvDesignation: 'Produtos farmacêuticos'})-[:ASSOCIATED_WITH]->(oc:OtherCompany)
        WITH oc, COUNT(DISTINCT pe) AS publicEntitiesCount, COUNT(c) AS contractsCount
        ORDER BY contractsCount DESC, publicEntitiesCount DESC
        LIMIT 10
        RETURN oc.name AS otherCompanyName, publicEntitiesCount, contractsCount
    `;

    const session = driver.session();
    try {
        const result = await session.run(query);
        const responseData = result.records.map(record => ({
            otherCompanyName: record.get('otherCompanyName'),
            publicEntitiesCount: neo4jIntegerToNumber(record.get('publicEntitiesCount')),
            contractsCount: neo4jIntegerToNumber(record.get('contractsCount'))
        }));
        res.json(responseData);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'An error occurred while fetching the data' });
    } finally {
        await session.close();
    }
});

router.get('/company-public-entities', async (req, res) => {
    const { companyName } = req.query;

    const session = driver.session();
    try {
        const query = `
            MATCH (pe:PublicEntity)-[:HAS_LEGAL_TENDER]->(c:Contract)-[:ASSOCIATED_WITH]->(oc:OtherCompany {name: $companyName})
            RETURN pe.name AS publicEntityName, COUNT(c) AS contractCount
            ORDER BY contractCount DESC
        `;
        const result = await session.run(query, { companyName });
        const publicEntities = result.records.map(record => ({
            publicEntityName: record.get('publicEntityName'),
            contractCount: neo4jIntegerToNumber(record.get('contractCount'))
        }));
        res.json(publicEntities);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'An error occurred while fetching the data' });
    } finally {
        await session.close();
    }
});

const startApi = (app, driver) => {
    app.use('/api', router);
};

module.exports = startApi;