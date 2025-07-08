// src/components/ExportSection.js
import React from 'react';
import { exportObj, exportStl, exportPly } from '../utils/exportUtils';

const ExportSection = ({ currentMesh }) => {
    const isExportEnabled = !!currentMesh;

    return (
        <div className="export-section">
            <h3>📥 Export 3D Model</h3>
            <p>Download your 3D model in various formats for 3D printing or modeling software</p>
            <div className="export-buttons">
                <button className="btn" onClick={() => exportObj(currentMesh)} disabled={!isExportEnabled}>📄 Export OBJ</button>
                <button className="btn" onClick={() => exportStl(currentMesh)} disabled={!isExportEnabled}>🏗️ Export STL</button>
                <button className="btn" onClick={() => exportPly(currentMesh)} disabled={!isExportEnabled}>📊 Export PLY</button>
            </div>
        </div>
    );
};

export default ExportSection;