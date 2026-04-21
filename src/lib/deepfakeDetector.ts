/**
 * Client-Side Deepfake Detector (Vanilla JavaScript - No TensorFlow.js)
 * Analyzes images using frequency domain analysis, artifact detection, and texture consistency
 */

export interface DeepfakeAnalysisResult {
  isFake: boolean;
  confidence: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  details: {
    frequencyAnomaly: number;
    compressionArtifacts: number;
    textureInconsistency: number;
    colorAnomalies: number;
  };
}

/**
 * Analyze image for deepfake characteristics
 */
export async function analyzeImageForDeepfake(
  imageElement: HTMLImageElement | CanvasImageSource
): Promise<DeepfakeAnalysisResult> {
  console.log('🔍 Starting deepfake analysis...');
  
  return new Promise((resolve, reject) => {
    try {
      // Convert image to canvas and get pixel data
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D canvas context');

      // Handle different image types
      if (imageElement instanceof HTMLImageElement) {
        canvas.width = imageElement.naturalWidth || 256;
        canvas.height = imageElement.naturalHeight || 256;
        console.log(`📐 Image dimensions: ${canvas.width}x${canvas.height}`);
        ctx.drawImage(imageElement, 0, 0);
      } else {
        canvas.width = 512;
        canvas.height = 512;
        ctx.drawImage(imageElement, 0, 0, 512, 512);
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      console.log(`📊 Pixel data size: ${pixels.length}`);

      // Analyze different aspects
      console.log('📈 Analyzing frequency domain...');
      const frequencyAnomaly = analyzeFrequencyDomain(pixels, canvas.width, canvas.height);
      console.log(`  └─ Frequency anomaly: ${(frequencyAnomaly * 100).toFixed(1)}%`);

      console.log('🔲 Detecting compression artifacts...');
      const compressionArtifacts = detectCompressionArtifacts(pixels, canvas.width, canvas.height);
      console.log(`  └─ Compression artifacts: ${(compressionArtifacts * 100).toFixed(1)}%`);

      console.log('✨ Analyzing texture consistency...');
      const textureInconsistency = analyzeTextureConsistency(pixels, canvas.width, canvas.height);
      console.log(`  └─ Texture inconsistency: ${(textureInconsistency * 100).toFixed(1)}%`);

      console.log('🎨 Detecting color anomalies...');
      const colorAnomalies = detectColorAnomalies(pixels);
      console.log(`  └─ Color anomalies: ${(colorAnomalies * 100).toFixed(1)}%`);

      // Combine scores with weighted average
      const weights = {
        frequency: 0.35,
        compression: 0.25,
        texture: 0.25,
        color: 0.15,
      };

      const combinedScore =
        frequencyAnomaly * weights.frequency +
        compressionArtifacts * weights.compression +
        textureInconsistency * weights.texture +
        colorAnomalies * weights.color;

      // Normalize to 0-100
      const confidence = Math.min(100, Math.max(0, combinedScore * 100));

      console.log(`\n📊 Combined Score: ${combinedScore.toFixed(3)}`);
      console.log(`💯 Confidence: ${confidence.toFixed(1)}%`);

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high';
      if (confidence > 70) {
        riskLevel = 'high';
      } else if (confidence > 40) {
        riskLevel = 'medium';
      } else {
        riskLevel = 'low';
      }

      console.log(`⚠️  Risk Level: ${riskLevel.toUpperCase()}`);
      console.log('✅ Analysis complete!\n');

      const result: DeepfakeAnalysisResult = {
        isFake: confidence > 50,
        confidence: Math.round(confidence),
        riskLevel,
        details: {
          frequencyAnomaly: Math.round(frequencyAnomaly * 100),
          compressionArtifacts: Math.round(compressionArtifacts * 100),
          textureInconsistency: Math.round(textureInconsistency * 100),
          colorAnomalies: Math.round(colorAnomalies * 100),
        },
      };

      resolve(result);
    } catch (error) {
      console.error('❌ Error during analysis:', error);
      reject(error);
    }
  });
}

/**
 * Frequency domain analysis using DCT-like approach
 * Deepfakes show unusual frequency patterns due to upsampling/compression
 */
function analyzeFrequencyDomain(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): number {
  // Extract luma (Y) channel from RGB
  const luma: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i] / 255;
    const g = pixels[i + 1] / 255;
    const b = pixels[i + 2] / 255;
    // Standard luma formula
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    luma.push(y);
  }

  // Check for unnatural repetition in frequency patterns
  let frequencyScore = 0;
  const blockSize = 8;

  for (let by = 0; by < height - blockSize; by += blockSize) {
    for (let bx = 0; bx < width - blockSize; bx += blockSize) {
      const block: number[] = [];
      for (let y = 0; y < blockSize; y++) {
        for (let x = 0; x < blockSize; x++) {
          block.push(luma[(by + y) * width + (bx + x)]);
        }
      }

      // Check for unnatural periodicity (deepfakes often have regular patterns)
      const variance = calculateVariance(block);
      const periodicity = checkPeriodicity(block);

      if (variance < 0.01 || periodicity > 0.7) {
        frequencyScore += 0.1;
      }
    }
  }

  // Normalize
  frequencyScore = Math.min(1, frequencyScore / 10);

  return frequencyScore;
}

/**
 * Detect JPEG/compression artifacts
 * Deepfakes often show artifacts at block boundaries
 */
function detectCompressionArtifacts(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): number {
  // Convert to grayscale
  const gray: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    gray.push(y / 255);
  }

  let artifactScore = 0;
  const blockSize = 8;

  // Check for discontinuities at block boundaries (JPEG compression artifact)
  for (let by = blockSize; by < height; by += blockSize) {
    for (let bx = blockSize; bx < width; bx += blockSize) {
      // Sample pixels across block boundary
      const boundary: number[] = [];
      const inside: number[] = [];

      for (let i = 0; i < 4; i++) {
        // On boundary
        boundary.push(gray[by * width + (bx + i)]);
        // Inside block
        inside.push(gray[(by + 2) * width + (bx + i)]);
      }

      const boundaryVar = calculateVariance(boundary);
      const insideVar = calculateVariance(inside);

      // Unnatural jump at boundaries
      if (Math.abs(boundaryVar - insideVar) > 0.05) {
        artifactScore += 0.05;
      }
    }
  }

  artifactScore = Math.min(1, artifactScore);

  return artifactScore;
}

/**
 * Analyze texture consistency
 * Deepfakes often have smooth/unnatural textures
 */
function analyzeTextureConsistency(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): number {
  // Convert to grayscale
  const gray: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    gray.push(y / 255);
  }

  let textureScore = 0;
  const regions: number[] = [];

  // Divide image into regions and check texture variation
  const regionSize = 64;
  for (let ry = 0; ry < height - regionSize; ry += regionSize) {
    for (let rx = 0; rx < width - regionSize; rx += regionSize) {
      const region: number[] = [];
      for (let y = 0; y < regionSize; y++) {
        for (let x = 0; x < regionSize; x++) {
          region.push(gray[(ry + y) * width + (rx + x)]);
        }
      }

      const variance = calculateVariance(region);
      const edgeCount = countEdges(region, regionSize);

      // Very smooth regions suggest deepfake
      if (variance < 0.01 && edgeCount < regionSize / 2) {
        textureScore += 0.1;
      }

      regions.push(variance);
    }
  }

  // Check for unnatural consistency across regions
  const regionVariance = calculateVariance(regions);
  if (regionVariance < 0.02) {
    textureScore += 0.2; // Too consistent = likely fake
  }

  textureScore = Math.min(1, textureScore);

  return textureScore;
}

/**
 * Detect color space anomalies
 * Deepfakes often show unusual color channel behavior
 */
function detectColorAnomalies(pixels: Uint8ClampedArray): number {
  let colorScore = 0;

  // Analyze color channel correlation
  const samples = Math.min(pixels.length / 4, 1000);
  const rValues: number[] = [];
  const gValues: number[] = [];
  const bValues: number[] = [];

  for (let i = 0; i < samples; i++) {
    const idx = i * 4;
    rValues.push(pixels[idx] / 255);
    gValues.push(pixels[idx + 1] / 255);
    bValues.push(pixels[idx + 2] / 255);
  }

  // Perfect correlation (very artificial) vs normal variation
  const rgCorr = calculateCorrelation(rValues, gValues);
  const rbCorr = calculateCorrelation(rValues, bValues);
  const gbCorr = calculateCorrelation(gValues, bValues);

  // Natural images have moderate correlation, deepfakes often have too high/low
  if (rgCorr > 0.95 || rbCorr > 0.95 || gbCorr > 0.95) {
    colorScore += 0.3; // Too correlated = likely fake
  }

  if (rgCorr < 0.3 || rbCorr < 0.3 || gbCorr < 0.3) {
    colorScore += 0.2; // Too independent = likely fake
  }

  return Math.min(1, colorScore);
}

/**
 * Helper: Calculate variance of array
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return variance;
}

/**
 * Helper: Calculate Pearson correlation coefficient
 */
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const meanX = x.reduce((a, b) => a + b) / x.length;
  const meanY = y.reduce((a, b) => a + b) / y.length;

  let numerator = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < x.length; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    sumX2 += dx * dx;
    sumY2 += dy * dy;
  }

  const denominator = Math.sqrt(sumX2 * sumY2);
  return denominator === 0 ? 0 : Math.abs(numerator / denominator);
}

/**
 * Helper: Check for periodicity in array
 */
function checkPeriodicity(values: number[]): number {
  if (values.length < 4) return 0;

  let periodicityScore = 0;
  const threshold = 0.05;

  for (let period = 1; period <= values.length / 2; period++) {
    let matches = 0;
    for (let i = period; i < values.length; i++) {
      if (Math.abs(values[i] - values[i - period]) < threshold) {
        matches++;
      }
    }

    if (matches / (values.length - period) > 0.8) {
      periodicityScore = Math.max(periodicityScore, 0.9);
    }
  }

  return periodicityScore;
}

/**
 * Helper: Count edges in a region
 */
function countEdges(region: number[], regionSize: number): number {
  let edgeCount = 0;
  const threshold = 0.1;

  for (let i = 1; i < region.length - 1; i++) {
    const row = Math.floor(i / regionSize);
    const col = i % regionSize;

    if (col > 0 && col < regionSize - 1) {
      const diff = Math.abs(region[i] - region[i - 1]);
      if (diff > threshold) {
        edgeCount++;
      }
    }
  }

  return edgeCount;
}
