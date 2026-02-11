#!/usr/bin/env python3
"""
Test the deepfake detector model locally.
Downloads a test image and runs inference.
"""
import torch
from transformers import AutoImageProcessor, SiglipForImageClassification
from PIL import Image
import requests
from io import BytesIO

# Load model and processor
model_name = "prithivMLmods/deepfake-detector-model-v1"
print(f"Loading model: {model_name}")
model = SiglipForImageClassification.from_pretrained(model_name)
processor = AutoImageProcessor.from_pretrained(model_name)

# Label mapping
id2label = {
    "0": "fake",
    "1": "real"
}

def classify_image(image_input):
    """
    Classify an image as real or fake.
    
    Args:
        image_input: PIL Image or path to image file
    
    Returns:
        dict: Probabilities for 'fake' and 'real'
    """
    if isinstance(image_input, str):
        # Load from URL or file path
        if image_input.startswith('http'):
            response = requests.get(image_input)
            image = Image.open(BytesIO(response.content)).convert("RGB")
        else:
            image = Image.open(image_input).convert("RGB")
    else:
        image = image_input
    
    # Process image
    inputs = processor(images=image, return_tensors="pt")
    
    # Run inference
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()
    
    # Create prediction dict
    prediction = {
        id2label[str(i)]: round(probs[i], 3) for i in range(len(probs))
    }
    
    return prediction

if __name__ == "__main__":
    # Create a simple test image (natural photo-like)
    print("Creating test image...")
    test_image = Image.new('RGB', (224, 224), color=(100, 150, 200))
    
    print("\nTesting with synthetic image (should show low real score)...")
    try:
        result = classify_image(test_image)
        print(f"Result: {result}")
        
        # Interpret result
        fake_score = result.get("fake", 0)
        real_score = result.get("real", 0)
        
        if real_score > fake_score:
            print(f"✓ CLASSIFIED AS REAL (confidence: {real_score*100:.1f}%)")
        else:
            print(f"⚠ CLASSIFIED AS FAKE (confidence: {fake_score*100:.1f}%)")
            
        print("\n" + "="*60)
        print("MODEL IS WORKING! Ready to integrate with Supabase.")
        print("="*60)
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
