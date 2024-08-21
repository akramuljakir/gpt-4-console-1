import { NextResponse } from 'next/server';
import axios from 'axios';

const AIML_API_KEY = process.env.AIML_API_KEY;

export async function POST(request: Request) {
    if (!AIML_API_KEY) {
        console.error("AIML_API_KEY is not set");
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { prompt, messages } = body;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Log the message context received from the client
        console.log('Message context received from client:', messages);

        const response = await axios.post(
            'https://api.aimlapi.com/v1/chat/completions',
            {
                model: "mistralai/Mistral-7B-Instruct-v0.2",
                messages: messages, // Message context being sent to AIML API
                max_tokens: 100,    // Example token limit
                temperature: 0.7,   // Example temperature setting
                top_p: 0.9,  // Nucleus sampling
                top_k: 50,  // Top-K sampling
                repetition_penalty: 1.1,  // Avoid repetition
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${AIML_API_KEY}`,
                },
            }
        );

        // Log the response from the external AIML API
        console.log('Response from AIML API:', response.data);

        return NextResponse.json({ data: response.data.choices[0].message.content });


    } catch (error) {
        console.error('Error in API:', error);
        return NextResponse.json({ error: 'Error with AIMLAPI' }, { status: 500 });
    }
}
