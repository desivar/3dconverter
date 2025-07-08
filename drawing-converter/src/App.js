// src/App.js
import React, { useState, useRef, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import ViewerPanel from './components/ViewerPanel';
import ExportSection from './components/ExportSection';
import StatusMessage from './components/StatusMessage';
import { applyEdgeDetection } from './utils/imageUtils';
import { generate3DModel } from './utils/threeDUtils';

function App() {
    const [originalImage, setOriginalImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [currentMesh, setCurrentMesh] = useState(null);
    const [status, setStatus] = useState({ message: '', type: '' });

    const viewerPanelRef = useRef(null); // Ref to access ViewerPanel's methods

    const showStatus = useCallback((message, type) => {
        setStatus({ message, type });
        // Optionally clear status after some time
        setTimeout(() => setStatus({ message: '', type: '' }), 5000);
    }, []);

    const handleFileLoaded = useCallback((img) => {
        setOriginalImage(img);
        setProcessedImage(null); // Clear previous processed image
        setCurrentMesh(null); // Clear previous mesh
        showStatus('Image loaded successfully! Ready to process.', 'success');
    }, [showStatus]);

    const handleProcessImage = useCallback(({ algorithm, threshold, blur, extrusionDepth, originalCanvas }) => {
        if (!originalImage || !originalCanvas) {
            showStatus('Please upload an image first.', 'error');
            return;
        }

        showStatus('Processing image and generating 3D model...', 'info');

        try {
            const ctx = originalCanvas.getContext('2d', { willReadFrequently: true });
            const imageData = ctx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);

            const newProcessedImageData = applyEdgeDetection(imageData, algorithm, threshold, blur);
            setProcessedImage(newProcessedImageData);

            const newMesh = generate3DModel(newProcessedImageData, extrusionDepth);

            if (newMesh) {
                setCurrentMesh(newMesh);
                viewerPanelRef.current.addMesh(newMesh); // Call method on child
                showStatus('3D model generated successfully!', 'success');
            } else {
                setCurrentMesh(null);
                showStatus('Failed to generate 3D model. No valid contours found or other issue.', 'error');
            }

        } catch (error) {
            console.error("Error during image processing or 3D generation:", error);
            showStatus('An error occurred during processing. Check console for details.', 'error');
            setCurrentMesh(null);
        }
    }, [originalImage, showStatus]);

    return (
        <div className="container">
            <Header />
            <div className="main-content">
                <ControlPanel
                    onFileLoaded={handleFileLoaded}
                    onProcessImage={handleProcessImage}
                    processedImage={processedImage}
                />
                <ViewerPanel ref={viewerPanelRef} /> {/* Pass ref to ViewerPanel */}
            </div>
            <ExportSection currentMesh={currentMesh} />
            <StatusMessage message={status.message} type={status.type} />
        </div>
    );
}

export default App;