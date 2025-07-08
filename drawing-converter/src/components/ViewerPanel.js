// src/components/ViewerPanel.js
import React, { useRef } from 'react';
import useThreeDViewer from '../hooks/useThreeDViewer'; // Import the custom hook

const ViewerPanel = React.forwardRef(({ currentMesh }, ref) => {
    const threeCanvasRef = useRef(null);
    const { addMeshToScene } = useThreeDViewer(threeCanvasRef);

    // Expose addMeshToScene function to parent via ref
    React.useImperativeHandle(ref, () => ({
        addMesh: addMeshToScene
    }));

    return (
        <div className="viewer-panel">
            <div className="section">
                <h3>🎮 3D Model Viewer</h3>
                <div className="canvas-container">
                    <div id="threeCanvas" ref={threeCanvasRef}></div>
                </div>
                <div style={{ marginTop: '15px', textAlign: 'center', color: '#666' }}>
                    <p>🖱️ Left click + drag to rotate | 🖱️ Right click + drag to pan | 🖱️ Scroll to zoom</p>
                </div>
            </div>
        </div>
    );
});

export default ViewerPanel;