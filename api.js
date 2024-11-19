const express = require('express');
const neo4j = require('neo4j-driver');
const router = express.Router();

// Connect to Neo4j
const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'strongpassword123')
);

router.post('/query', async (req, res) => {
    const query = req.body.query;

    const session = driver.session();
    try {
        const result = await session.run(query);
        res.json(result.records.map(record => record.toObject()));
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
});

const startApi = (app, driver) => {
    app.use('/api', router);
};

module.exports = startApi;