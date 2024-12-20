import React from 'react';
import { useState, useEffect } from 'react';
import cpvDesignations from '../../cpvDesignations.json';
import './ByCpvDesignation.css';

const ByCpvDesignation = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCpv, setSelectedCpv] = useState(cpvDesignations[0]?.cpvDesignation || ''); // Default to the first CPV

    // Fetch data based on query type and selected CPV
    useEffect(() => {
        setLoading(true);
        const endpoint = `http://localhost:3000/api/rank-contracted-companies-by-public-entities-count?cpv=${encodeURIComponent(selectedCpv)}`
        fetch(endpoint)
            .then((res) => res.json())
            .then((data) => {
                setCompanies(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedCpv]);

    return (
        <div>
            <h1 align="center">Public Procurement Analysis</h1>
            <div align="center">
                <label htmlFor="cpv-dropdown">Select CPV Designation:</label>
                <select
                    id="cpv-dropdown"
                    value={selectedCpv}
                    onChange={(e) => setSelectedCpv(e.target.value)}
                >
                    {cpvDesignations.map((category, index) => (
                        <option key={index} value={category.cpvDesignation}>
                            {category.cpvDesignation}
                        </option>
                    ))}
                </select>
            </div>
            <br />
            <br />
            {loading ? (
                <p align="center">Loading...</p>
            ) : (
                <div>
                    <h2>Top 10 Companies</h2>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Company Name</th>
                                <th>Total Value Normalized</th>
                                <th>Contracts Count</th>
                                <th>Public Entities Count</th>
                                <th>Total Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.length > 0 ? (
                                companies.map((company, index) => (
                                    <tr key={index}>
                                        <td>{company.otherCompanyName}</td>
                                        <td>{company.totalCpvValueNormalizedFormatted}</td>
                                        <td>{company.contractsCount}</td>
                                        <td>{company.publicEntitiesCount}</td>
                                        <td>{company.totalCpvValueFormatted}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">No companies found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <h2>Global Statistics</h2>
                    <p>considering all companies and not just the top 10</p>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Average Normalized Value</th>
                                <th>Standard Deviation Normalized Value</th>
                                <th>Total Contracts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.length > 0 ? (
                                <tr>
                                    <td>{companies[0].globalAvgCpvValueNormalizedFormatted}</td>
                                    <td>{companies[0].globalStdDevCpvValueNormalizedFormatted}</td>
                                    <td>{companies[0].globalContractsCount}</td>
                                </tr>
                            ) : (
                                <tr>
                                    <td colSpan="3">No data available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );    
};

export default ByCpvDesignation;