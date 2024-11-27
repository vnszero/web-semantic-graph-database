import React from 'react';
import { useState, useEffect } from 'react';
import './ByDistributionContracts.css';

const ByDistributionContracts = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch data based on query type and selected CPV
    useEffect(() => {
        setLoading(true);
        const endpoint = `http://localhost:3000/api/rank-public-entities-by-distribution-of-contracts`
        fetch(endpoint)
            .then((res) => res.json())
            .then((data) => {
                setCompanies(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    },[]);

    return (
        <div>
            <h1 align="center">Public Procurement Analysis</h1>
            <h2 align="center">Distribution of contracts across companies</h2>
            <br />
            <br />
            {loading ? (
                <p align="center">Loading...</p>
            ) : (
                <table border="1">
                    <thead>
                        <tr>
                            <th>Public Entities Count</th>
                            <th>Company Name</th>
                            <th>Contracts Count</th>
                            <th>Total Contracts</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.length > 0 ? (
                            companies.map((company, index) => (
                                <tr key={index}>
                                    <td>{company.publicEntityName}</td>
                                    <td>{company.otherCompanyName}</td>
                                    <td>{company.contractCount}</td>
                                    <td>{company.totalContracts}</td>
                                    <td>{((company.contractCount / company.totalContracts) * 100).toFixed(2)}%</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3">No companies found.</td>
                            </tr>
                        )}


                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ByDistributionContracts;
