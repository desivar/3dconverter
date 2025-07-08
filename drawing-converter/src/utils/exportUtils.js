import * as THREE from 'three'; // You might already have this or need to import if using Three.js directly
// If you are using specific exporters, you'll need to import them too.
// For example, if you installed them via npm:
// import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';
// import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
// import { PLYExporter } from 'three/examples/jsm/exporters/PLYExporter';

// If you are relying on global THREE object from <script> tags,
// you might not need the imports above, but that's generally not
// the recommended way in modern React.

// Helper function to show status (assuming this is defined elsewhere or needs to be provided)
// For now, let's just make a placeholder
const showStatus = (message, type) => {
    console.log(`Status (${type}): ${message}`);
    // In a real app, you would update a UI element here
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

export function exportObj(currentMesh, scene) { // Added 'scene' as a parameter for OBJ export
    if (!currentMesh) {
        showStatus('No 3D model to export.', 'error');
        return;
    }
    showStatus('Exporting OBJ...', 'info');

    // IMPORTANT: Ensure OBJExporter is properly imported/available
    // If you're using ES modules, you'd do:
    // import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';
    // const exporter = new OBJExporter();
    // If relying on global window.THREE, then it should be fine.
    if (typeof THREE.OBJExporter === 'undefined') {
        showStatus('OBJExporter not loaded. Please ensure the script is included or imported.', 'error');
        console.error('OBJExporter not found. Make sure you have included it from Three.js examples or imported it.');
        return;
    }
    const exporter = new THREE.OBJExporter();
    // You mentioned "Export the whole scene, or just currentMesh"
    // If you always want the currentMesh, pass currentMesh.
    // If you want the whole scene, you need to pass the scene object to this function.
    // I've updated the function signature to accept 'scene'.
    const objectToExport = scene || currentMesh; // Use scene if provided, otherwise currentMesh
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

    // IMPORTANT: Ensure STLExporter is properly imported/available
    if (typeof THREE.STLExporter === 'undefined') {
         showStatus('STLExporter not loaded. Please ensure the script is included or imported.', 'error');
         console.error('STLExporter not found. Make sure you have included it from Three.js examples or imported it.');
         return;
    }

    const exporter = new THREE.STLExporter();
    const result = exporter.parse(currentMesh); // Export only the current mesh
    saveString(result, 'model.stl');
    showStatus('STL exported successfully!', 'success');
}

export function exportPly(currentMesh) {
    if (!currentMesh) {
        showStatus('No 3D model to export.', 'error');
        return;
    }
    showStatus('Exporting PLY...', 'info');
    
    // IMPORTANT: Ensure PLYExporter is properly imported/available
    if (typeof THREE.PLYExporter === 'undefined') {
         showStatus('PLYExporter not loaded. Please ensure the script is included or imported.', 'error');
         console.error('PLYExporter not found. Make sure you have included it from Three.js examples or imported it.');
         return;
    }

    const exporter = new THREE.PLYExporter();
    exporter.parse(currentMesh.geometry, function (result) {
        saveString(result, 'model.ply');
        showStatus('PLY exported successfully!', 'success');
    }, { binary: false }); // Set binary: true for binary PLY
}

// You need to decide where 'scene' comes from for exportOBJ.
// It's likely that 'scene' is available where 'currentMesh' is managed (e.g., in ViewerPanel or a higher-level component/hook).
// You'll need to pass 'scene' as a prop to ExportSection.js if you want to export the entire scene via OBJ.
// For example, in ExportSection.js, you might have:
// <button className="btn" onClick={() => exportObj(currentMesh, scene)} ...>
// And then in ExportSection:
// const ExportSection = ({ currentMesh, scene }) => { ... }