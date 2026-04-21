
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const GORQ_API_KEY = Deno.env.get('GORQ_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId, userId } = await req.json();
    
    if (!GORQ_API_KEY) {
      throw new Error('GORQ_API_KEY is not set');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials are not set');
    }

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Received request:', { conversationId, userId });
    
    // Call gorq API (assumed OpenAI-compatible endpoint)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GORQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are VERITAS AI, a digital safety assistant specializing in helping women recognize and avoid online scams, harassment, and threats. Provide practical, supportive advice focused on digital safety, privacy protection, and appropriate actions to take when faced with online dangers. Always be empathetic and never blame the victim. When appropriate, suggest resources or steps that can help in emergency situations.'
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    });

    // Log the raw response for debugging
    const raw = await response.text();
    console.log('Groq API raw response:', raw);
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      throw new Error('Failed to parse Groq API response as JSON: ' + raw);
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from Groq API: ' + raw);
    }
    const aiResponse = data.choices[0].message.content;
    
    // Save assistant response to database using service role
    if (conversationId) {
      const { error: saveError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: aiResponse
        });
        
      if (saveError) {
        console.error('Error saving assistant message:', saveError);
      }
    }
    
    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI chatbot function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
