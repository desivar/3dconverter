// src/utils/threeDUtils.js
import * as THREE from 'three';
import { findContours } from './imageUtils'; // Import findContours

export const generate3DModel = (imageData, extrusionDepth) => {
    const width = imageData.width;
    const height = imageData.height;

    // Remove previous mesh logic handled in useThreeDViewer hook

    // Create extruded geometry from contours
    const shape = new THREE.Shape();
    const contours = findContours(imageData);

    if (contours.length === 0) {
        console.warn("No contours found for 3D model generation.");
        return null;
    }

    // Use the largest contour for extrusion
    const mainContour = contours.reduce((a, b) => a.length > b.length ? a : b);

    if (mainContour.length < 3) { // A shape needs at least 3 points
        console.warn("Main contour has too few points for a valid shape.");
        return null;
    }

    // Offset points to center the shape
    shape.moveTo(mainContour[0].x - width / 2, -(mainContour[0].y - height / 2));
    for (let i = 1; i < mainContour.length; i++) {
        shape.lineTo(mainContour[i].x - width / 2, -(mainContour[i].y - height / 2));
    }
    // The shape is automatically closed by ExtrudeGeometry

    // Create extruded geometry
    const extrudeSettings = {
        depth: extrusionDepth,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 2,
        bevelThickness: 2
    };

    const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Create new mesh
    const material = new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        shininess: 100,
        transparent: true,
        opacity: 0.9
    });

    const mesh = new THREE.Mesh(extrudeGeometry, material);
    mesh.position.z = -extrusionDepth / 2; // Center the extrusion
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
};