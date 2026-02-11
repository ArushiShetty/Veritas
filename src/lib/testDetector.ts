/**
 * Test script for client-side deepfake detector
 * Tests the detector with synthetic images
 */

async function createTestImage(type: 'real' | 'ai'): Promise<HTMLImageElement> {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  if (type === 'real') {
    // Create a natural-looking image with realistic variation
    const imageData = ctx.createImageData(256, 256);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Natural variation with noise
      const base = Math.random() * 255;
      const noise = (Math.random() - 0.5) * 30;
      const value = Math.max(0, Math.min(255, base + noise));

      data[i] = value; // R
      data[i + 1] = value * 0.95 + Math.random() * 10; // G
      data[i + 2] = value * 0.9 + Math.random() * 15; // B
      data[i + 3] = 255; // A
    }

    ctx.putImageData(imageData, 0, 0);
  } else {
    // Create an AI-like image with unnatural smoothness and periodicity
    const imageData = ctx.createImageData(256, 256);
    const data = imageData.data;

    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const idx = (y * 256 + x) * 4;

        // Create smooth, unnatural patterns
        const smoothValue = Math.sin(x / 30) * 50 + Math.sin(y / 30) * 50 + 128;

        data[idx] = smoothValue; // R
        data[idx + 1] = smoothValue * 0.98; // G (very correlated)
        data[idx + 2] = smoothValue * 0.96; // B (very correlated)
        data[idx + 3] = 255; // A
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  const img = new Image();
  img.src = canvas.toDataURL();

  return new Promise((resolve) => {
    img.onload = () => resolve(img);
  });
}

async function testDetector() {
  // Import the detector (this assumes it's globally available after module load)
  const { analyzeImageForDeepfake } = await import(
    '/src/lib/deepfakeDetector.ts'
  );

  console.log('🧪 Testing client-side deepfake detector...\n');

  // Test with real image
  console.log('📸 Testing with synthetic REAL image...');
  const realImg = await createTestImage('real');
  const realResult = await analyzeImageForDeepfake(realImg);
  console.log('Result:', realResult);
  console.log(
    `✓ Real image: ${realResult.riskLevel.toUpperCase()} (${realResult.confidence}% confidence)\n`
  );

  // Test with AI image
  console.log('🤖 Testing with synthetic AI image...');
  const aiImg = await createTestImage('ai');
  const aiResult = await analyzeImageForDeepfake(aiImg);
  console.log('Result:', aiResult);
  console.log(
    `✓ AI image: ${aiResult.riskLevel.toUpperCase()} (${aiResult.confidence}% confidence)\n`
  );

  // Validation
  console.log('📊 Validation:');
  const realCorrect = realResult.riskLevel === 'low';
  const aiCorrect = aiResult.riskLevel === 'high';

  console.log(`✓ Real image classified correctly: ${realCorrect}`);
  console.log(`✓ AI image classified correctly: ${aiCorrect}`);

  if (realCorrect && aiCorrect) {
    console.log(
      '\n✅ All tests passed! Detector is working correctly.\n'
    );
  } else {
    console.log(
      '\n⚠️ Some tests failed. Detector accuracy may need adjustment.\n'
    );
  }
}

// Run tests if script is loaded
if (typeof window !== 'undefined') {
  (window as any).testDetector = testDetector;
  console.log(
    'Detector test available. Run testDetector() in console to test.'
  );
}

export { testDetector, createTestImage };
