// src/utils/exportUtils.js
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
import { PLYExporter } from 'three/examples/jsm/exporters/PLYExporter';

const downloadFile = (data, filename, type) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const exportObj = (mesh) => {
    if (!mesh) {
        console.error("No mesh to export.");
        return;
    }
    const exporter = new OBJExporter();
    const result = exporter.parse(mesh);
    downloadFile(result, 'model.obj', 'text/plain');
};

export const exportStl = (mesh) => {
    if (!mesh) {
        console.error("No mesh to export.");
        return;
    }
    const exporter = new STLExporter();
    // STLExporter returns an ArrayBuffer for binary, or string for ASCII
    const result = exporter.parse(mesh, { binary: true }); // Export as binary STL
    downloadFile(result, 'model.stl', 'application/octet-stream');
};

export const exportPly = (mesh) => {
    if (!mesh) {
        console.error("No mesh to export.");
        return;
    }
    const exporter = new PLYExporter();
    // PLYExporter returns a string for ASCII, or ArrayBuffer for binary
    const result = exporter.parse(mesh, { binary: false }); // Export as ASCII PLY
    downloadFile(result, 'model.ply', 'text/plain');
};