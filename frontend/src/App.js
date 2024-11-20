import React, { useState, useEffect } from 'react';
import './App.css';

function CompaniesTable() {
    const [companies, setCompanies] = useState([]);
    const [queryType, setQueryType] = useState(true);
    const [loading, setLoading] = useState(false);
    const [publicEntities, setPublicEntities] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);

    // Fetch data based on query type
    useEffect(() => {
        setLoading(true);
        const endpoint =
            queryType === true // rankByEntities
                ? 'http://localhost:3000/api/rank-contracted-companies-by-public-entities-count'
                : 'http://localhost:3000/api/rank-contracted-companies-by-contracts-count';
        fetch(endpoint)
            .then((res) => res.json())
            .then((data) => setCompanies(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [queryType]);

    const fetchPublicEntities = (companyName) => {
        fetch(`http://localhost:3000/api/company-public-entities?companyName=${encodeURIComponent(companyName)}`)
            .then((res) => res.json())
            .then((data) => {
                setPublicEntities(data);
                setSelectedCompany(companyName); // Set the selected company for the UI
            })
            .catch(console.error);
    };

    return (
        <div>
            <h1 align="center">Public Procurement Analysis - Pharmaceutical Products</h1>
            <h2 align="center">
                {queryType === true
                    ? 'Top 10 Contracted Companies by Public Entities Count'
                    : 'Top 10 Contracted Companies by Contracts Count'}
            </h2>
            <div align="center">
                <button onClick={() => { 
                    setQueryType(!queryType) 
                    setCompanies([])
                    setSelectedCompany(null)
                    }}>
                    {queryType === true
                        ? 'Show by Contracts Count'
                        : 'Show by Public Entities Count'}
                </button>
            </div>

            {loading ? (
                <p align="center">Loading...</p>
            ) : (
                <table border="1" align="center">
                    <thead>
                        <tr>
                            <th>Company Name</th>
                            <th>Public Entities Count</th>
                            <th>Contracts Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map((company, index) => (
                            <tr key={index} onClick={() =>
                                fetchPublicEntities(company.otherCompanyName)}>
                                <td>{company.otherCompanyName}</td>
                                <td>{company.publicEntitiesCount}</td>
                                <td>{company.contractsCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {selectedCompany && (
                <div align="center">
                    <h2>Public Entities for {selectedCompany}</h2>
                    {publicEntities.length > 0 ? (
                        <table border="1">
                            <thead>
                                <tr>
                                    <th>Public Entity Name</th>
                                    <th>Contract Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {publicEntities.map((entity, index) => (
                                    <tr key={index}>
                                        <td>{entity.publicEntityName}</td>
                                        <td>{entity.contractCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No public entities found for this company.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default CompaniesTable;