import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import ByCpvDesignation from './components/byCpvDesignation/ByCpvDesignation';
import ByCompany from './components/byCompany/ByCompany';
import ByPublicEntity from './components/byPublicEntity/ByPublicEntity';
import ByDistributionContracts from './components/byDistributionContracts/ByDistributionContracts';

const App = () => {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/by-cpv-designation" element={<ByCpvDesignation />} />
                <Route path="/by-company" element={<ByCompany />} />
                <Route path="/by-public-entity" element={<ByPublicEntity />} />
                <Route path="/by-distribution-contracts" element={<ByDistributionContracts />} />
            </Routes>
        </Router>
    );
};

export default App;