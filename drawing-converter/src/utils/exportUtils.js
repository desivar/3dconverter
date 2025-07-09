// src/utils/exportUtils.js

import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
import { PLYExporter } from 'three/examples/jsm/exporters/PLYExporter';

// Helper function to show status (assuming this is defined elsewhere or needs to be provided)
// For now, let's just make a placeholder if you don't have a global one
const showStatus = (message, type) => {
    console.log(`Status (${type}): ${message}`);
    // In a real app, you would update a UI element here,
    // or pass this function as a prop/context from a higher component.
};

// --- Export Functions ---
function saveString(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
}

export function exportObj(currentMesh, scene) {
    if (!currentMesh) {
        showStatus('No 3D model to export.', 'error');
        return;
    }
    showStatus('Exporting OBJ...', 'info');

    // Now, OBJExporter is imported directly, so you don't need the typeof check
    const exporter = new OBJExporter();
    const objectToExport = scene || currentMesh;
    const result = exporter.parse(objectToExport);
    saveString(result, 'model.obj');
    showStatus('OBJ exported successfully!', 'success');
}

export function exportStl(currentMesh) {
    if (!currentMesh) {
        showStatus('No 3D model to export.', 'error');
        return;
    }
    showStatus('Exporting STL...', 'info');

    // Now, STLExporter is imported directly
    const exporter = new STLExporter();
    const result = exporter.parse(currentMesh);
    saveString(result, 'model.stl');
    showStatus('STL exported successfully!', 'success');
}

export function exportPly(currentMesh) {
    if (!currentMesh) {
        showStatus('No 3D model to export.', 'error');
        return;
    }
    showStatus('Exporting PLY...', 'info');

    // Now, PLYExporter is imported directly
    const exporter = new PLYExporter();
    exporter.parse(currentMesh.geometry, function (result) {
        saveString(result, 'model.ply');
        showStatus('PLY exported successfully!', 'success');
    }, { binary: false });
}