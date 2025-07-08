// src/components/ControlPanel.js
import React, { useRef, useState, useEffect } from 'react';

const ControlPanel = ({ onFileLoaded, onProcessImage, processedImage }) => {
    const uploadAreaRef = useRef(null);
    const fileInputRef = useRef(null);
    const originalCanvasRef = useRef(null);
    const processedCanvasRef = useRef(null);

    const [algorithm, setAlgorithm] = useState('sobel');
    const [threshold, setThreshold] = useState(100);
    const [blur, setBlur] = useState(1.0);
    const [extrusionDepth, setExtrusionDepth] = useState(50);
    const [isProcessEnabled, setIsProcessEnabled] = useState(false);

    // Effect to display processed image when it changes
    useEffect(() => {
        if (processedImage && processedCanvasRef.current) {
            const ctx = processedCanvasRef.current.getContext('2d');
            processedCanvasRef.current.width = processedImage.width;
            processedCanvasRef.current.height = processedImage.height;
            ctx.putImageData(processedImage, 0, 0);
        }
    }, [processedImage]);

    const handleFile = (file) => {
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

        if (!validTypes.includes(file.type)) {
            // You might want to pass this status up to App.js or use a global state for notifications
            console.error('Please upload a valid image file (PNG, JPG, SVG)');
            setIsProcessEnabled(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = originalCanvasRef.current;
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                setIsProcessEnabled(true);
                onFileLoaded(img); // Pass the loaded image to the parent component
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        uploadAreaRef.current.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        uploadAreaRef.current.classList.add('dragover');
    };

    const handleDragLeave = () => {
        uploadAreaRef.current.classList.remove('dragover');
    };

    return (
        <div className="control-panel">
            <div className="section">
                <h3>📁 Upload Drawing</h3>
                <div
                    className="upload-area"
                    ref={uploadAreaRef}
                    onClick={() => fileInputRef.current.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <div className="upload-content">
                        <div className="upload-icon">🎨</div>
                        <p><strong>Click to upload</strong> or drag and drop your drawing</p>
                        <p>Supports PNG, JPG, JPEG, SVG</p>
                        <input
                            type="file"
                            className="file-input"
                            ref={fileInputRef}
                            accept=".png,.jpg,.jpeg,.svg"
                            onChange={(e) => e.target.files.length > 0 && handleFile(e.target.files[0])}
                        />
                    </div>
                </div>
            </div>

            <div className="section">
                <h3>🔧 Processing Parameters</h3>
                <div className="control-group">
                    <label htmlFor="algorithm">Edge Detection Algorithm:</label>
                    <select id="algorithm" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
                        <option value="sobel">Sobel (Recommended for sketches)</option>
                        <option value="canny">Canny (Sharp edges)</option>
                        <option value="laplacian">Laplacian (Fine details)</option>
                    </select>
                </div>

                <div className="control-group">
                    <label htmlFor="threshold">Edge Threshold: <span id="thresholdValue">{threshold}</span></label>
                    <input
                        type="range"
                        id="threshold"
                        min="10"
                        max="255"
                        value={threshold}
                        onChange={(e) => setThreshold(parseInt(e.target.value))}
                    />
                </div>

                <div className="control-group">
                    <label htmlFor="blur">Blur Level: <span id="blurValue">{blur}</span></label>
                    <input
                        type="range"
                        id="blur"
                        min="0"
                        max="5"
                        value={blur}
                        step="0.1"
                        onChange={(e) => setBlur(parseFloat(e.target.value))}
                    />
                </div>

                <div className="control-group">
                    <label htmlFor="extrusionDepth">Extrusion Depth: <span id="extrusionValue">{extrusionDepth}</span></label>
                    <input
                        type="range"
                        id="extrusionDepth"
                        min="10"
                        max="200"
                        value={extrusionDepth}
                        onChange={(e) => setExtrusionDepth(parseInt(e.target.value))}
                    />
                </div>

                <button
                    className="btn"
                    id="processBtn"
                    disabled={!isProcessEnabled}
                    onClick={() => onProcessImage({ algorithm, threshold, blur, extrusionDepth, originalCanvas: originalCanvasRef.current })}
                >
                    🚀 Generate 3D Model
                </button>
            </div>

            <div className="section">
                <h3>📊 Preview</h3>
                <div className="canvas-container">
                    <canvas id="originalCanvas" ref={originalCanvasRef} style={{ display: 'none' }}></canvas>
                    <canvas id="processedCanvas" ref={processedCanvasRef}></canvas>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;