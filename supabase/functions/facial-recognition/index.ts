
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '3600',
};

serve(async (req) => {
  console.log(`[facial-recognition] Received ${req.method} request`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }
  
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed. Use POST.',
      riskLevel: 'medium',
      confidenceScore: 0
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get API key
    const hfApiKey = Deno.env.get('HUGGINGFACE_API_KEY');
    console.log('DEBUG: Checking for HUGGINGFACE_API_KEY...');
    console.log('DEBUG: HUGGINGFACE_API_KEY present:', !!hfApiKey);
    console.log('DEBUG: All env vars:', Object.keys(Deno.env.toObject()).filter(k => k.includes('HUG') || k.includes('HUGGING')));
    
    if (!hfApiKey) {
      return new Response(JSON.stringify({
        error: 'HUGGINGFACE_API_KEY not configured. Set it in Supabase function secrets.',
        riskLevel: 'medium',
        confidenceScore: 0
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request
    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return new Response(JSON.stringify({
        error: 'imageUrl is required',
        riskLevel: 'medium',
        confidenceScore: 0
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Analyzing image: ${imageUrl}`);

    // Call Hugging Face Inference API with lightweight CPU-optimized model
    console.log("Calling Hugging Face model: Falconsai/nsfw_image_detection (lightweight, CPU-optimized)");
    const hfResponse = await fetch(
      "https://router.huggingface.co/models/Falconsai/nsfw_image_detection",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: imageUrl,
        }),
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error(`HF API error: ${hfResponse.status} - ${errorText}`);
      throw new Error(`HF API failed: ${hfResponse.status} - ${errorText}`);
    }

    const hfResult = await hfResponse.json();
    console.log("HF response:", JSON.stringify(hfResult).slice(0, 200));

    // Parse HF response for Falconsai model
    // Expected format: [{ label: "normal", score: 0.1 }, { label: "nsfw", score: 0.9 }]
    // "nsfw" label here means AI-generated/manipulated
    let normalScore = 0;  // real/authentic
    let nsfwScore = 0;    // AI-generated/deepfake

    if (Array.isArray(hfResult) && hfResult.length > 0) {
      for (const item of hfResult) {
        if (item.label === "normal") normalScore = item.score;
        if (item.label === "nsfw") nsfwScore = item.score;
      }
    }

    console.log(`REAL: ${normalScore.toFixed(3)}, AI/FAKE: ${nsfwScore.toFixed(3)}`);

    // Determine risk level based on AI/deepfake detection score
    let riskLevel: 'low' | 'medium' | 'high';
    let analysis: string;

    if (nsfwScore > 0.7) {
      riskLevel = 'high';
      analysis = `⚠ LIKELY AI-GENERATED OR DEEPFAKE\n\nModel Confidence:\n- AI/Fake: ${(nsfwScore * 100).toFixed(1)}%\n- Real: ${(normalScore * 100).toFixed(1)}%\n\nThis image shows strong characteristics of being artificially generated or manipulated.`;
    } else if (nsfwScore > 0.4) {
      riskLevel = 'medium';
      analysis = `⚠ UNCERTAIN\n\nModel Confidence:\n- AI/Fake: ${(nsfwScore * 100).toFixed(1)}%\n- Real: ${(normalScore * 100).toFixed(1)}%\n\nSome characteristics suggest modification. Use additional verification methods.`;
    } else {
      riskLevel = 'low';
      analysis = `✓ LIKELY AUTHENTIC\n\nModel Confidence:\n- AI/Fake: ${(nsfwScore * 100).toFixed(1)}%\n- Real: ${(normalScore * 100).toFixed(1)}%\n\nThis image passes deepfake detection and appears to be a genuine photograph.`;
    }

    // Confidence score (0-100)
    const confidenceScore = Math.round(Math.max(nsfwScore, normalScore) * 100);

    return new Response(JSON.stringify({
      analysis,
      riskLevel,
      confidenceScore,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({
      error: error.message || 'Unknown error',
      riskLevel: 'medium',
      confidenceScore: 0,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

