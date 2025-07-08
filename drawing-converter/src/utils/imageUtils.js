// src/utils/imageUtils.js

// Convert to grayscale
const toGrayscale = (imageData) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const grayscale = new Uint8ClampedArray(width * height);
    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        grayscale[i / 4] = gray;
    }
    return grayscale;
};

// Create Gaussian kernel
const createGaussianKernel = (sigma) => {
    const size = Math.ceil(sigma * 3) * 2 + 1;
    const kernel = [];
    const center = Math.floor(size / 2);

    for (let i = 0; i < size; i++) {
        kernel[i] = [];
        for (let j = 0; j < size; j++) {
            const x = i - center;
            const y = j - center;
            kernel[i][j] = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
        }
    }
    return kernel;
};

// Gaussian blur implementation
const applyGaussianBlur = (data, width, height, sigma) => {
    if (sigma <= 0) return data; // No blur needed

    const kernel = createGaussianKernel(sigma);
    const result = new Uint8ClampedArray(width * height);
    const kernelSize = kernel.length;
    const radius = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sum = 0;
            let weightSum = 0;

            for (let i = -radius; i <= radius; i++) {
                for (let j = -radius; j <= radius; j++) {
                    const px = Math.max(0, Math.min(width - 1, x + i));
                    const py = Math.max(0, Math.min(height - 1, y + j));
                    const weight = kernel[i + radius][j + radius];

                    sum += data[py * width + px] * weight;
                    weightSum += weight;
                }
            }
            result[y * width + x] = sum / weightSum;
        }
    }
    return result;
};

// Sobel operator implementation
const applySobelOperator = (data, width, height) => {
    const result = new Uint8ClampedArray(width * height);
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let gx = 0, gy = 0;
            for (let j = -1; j <= 1; j++) {
                for (let i = -1; i <= 1; i++) {
                    const pixel = data[(y + j) * width + (x + i)];
                    const kernelIndex = (j + 1) * 3 + (i + 1);
                    gx += pixel * sobelX[kernelIndex];
                    gy += pixel * sobelY[kernelIndex];
                }
            }
            const magnitude = Math.sqrt(gx * gx + gy * gy);
            result[y * width + x] = Math.min(255, magnitude);
        }
    }
    return result;
};

// Simplified Canny edge detection
const applyCannyEdgeDetection = (data, width, height, threshold) => {
    const sobel = applySobelOperator(data, width, height);
    const result = new Uint8ClampedArray(width * height);

    const lowThreshold = threshold * 0.5;
    const highThreshold = threshold * 1.5;

    for (let i = 0; i < sobel.length; i++) {
        if (sobel[i] > highThreshold) {
            result[i] = 255;
        } else if (sobel[i] > lowThreshold) {
            result[i] = 128;
        } else {
            result[i] = 0;
        }
    }
    return result;
};

// Laplacian operator implementation
const applyLaplacianOperator = (data, width, height) => {
    const result = new Uint8ClampedArray(width * height);
    const kernel = [0, -1, 0, -1, 4, -1, 0, -1, 0];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let sum = 0;
            for (let j = -1; j <= 1; j++) {
                for (let i = -1; i <= 1; i++) {
                    const pixel = data[(y + j) * width + (x + i)];
                    const kernelIndex = (j + 1) * 3 + (i + 1);
                    sum += pixel * kernel[kernelIndex];
                }
            }
            result[y * width + x] = Math.abs(sum);
        }
    }
    return result;
};

export const applyEdgeDetection = (imageData, algorithm, threshold, blur) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const grayscale = toGrayscale(imageData);
    let blurred = grayscale;
    if (blur > 0) {
        blurred = applyGaussianBlur(grayscale, width, height, blur);
    }

    let edges;
    switch (algorithm) {
        case 'sobel':
            edges = applySobelOperator(blurred, width, height);
            break;
        case 'canny':
            edges = applyCannyEdgeDetection(blurred, width, height, threshold);
            break;
        case 'laplacian':
            edges = applyLaplacianOperator(blurred, width, height);
            break;
        default:
            edges = applySobelOperator(blurred, width, height);
    }

    const result = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < edges.length; i++) {
        const value = edges[i] > threshold ? 255 : 0;
        result[i * 4] = value;
        result[i * 4 + 1] = value;
        result[i * 4 + 2] = value;
        result[i * 4 + 3] = 255;
    }
    return new ImageData(result, width, height);
};

// Contour finding utilities
// Find contours in binary image
export const findContours = (imageData) => {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const visited = new Array(width * height).fill(false);
    const contours = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = y * width + x;
            const pixelIndex = i * 4;

            if (!visited[i] && data[pixelIndex] > 128) {
                const contour = traceContour(x, y, width, height, data, visited);
                if (contour.length > 10) { // Filter small contours
                    contours.push(contour);
                }
            }
        }
    }
    return contours;
};

// Trace contour using Moore neighborhood
const traceContour = (startX, startY, width, height, data, visited) => {
    const contour = [];
    let x = startX, y = startY;
    let direction = 0; // 0: right, 1: down, 2: left, 3: up

    // Neighboring pixel offsets (clockwise, starting from right)
    const offsets = [
        [1, 0], [1, 1], [0, 1], [-1, 1],
        [-1, 0], [-1, -1], [0, -1], [1, -1]
    ];

    let count = 0;
    const maxIterations = width * height * 2; // Safety break

    do {
        contour.push({x, y});
        visited[y * width + x] = true;

        let found = false;
        // Search for the next edge pixel in a clockwise direction
        for (let i = 0; i < 8; i++) {
            const checkDir = (direction + i) % 8; // Iterate through all 8 neighbors
            const dx = offsets[checkDir][0];
            const dy = offsets[checkDir][1];
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const pixelIndex = (ny * width + nx) * 4;
                if (data[pixelIndex] > 128) { // If it's an edge pixel
                    x = nx;
                    y = ny;
                    direction = checkDir; // Update direction to point towards the new pixel
                    found = true;
                    break;
                }
            }
        }
        if (!found) break; // If no next pixel is found, break to avoid infinite loop
        count++;
    } while ((x !== startX || y !== startY || count < 2) && count < maxIterations);
    // The `count < 2` condition ensures that a contour with only one point (which is not a real contour) doesn't terminate prematurely.

    return contour;
};