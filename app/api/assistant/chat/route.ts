import { NextRequest, NextResponse } from 'next/server';
import { personaAssistant } from '@/lib/services/persona-assistant';
import { PersonaId } from '@/lib/types/assistant';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, personaId, language } = body;

    // Validate required fields
    if (!message || !sessionId) {
      return NextResponse.json({ error: 'Message and sessionId are required' }, { status: 400 });
    }

    // Validate personaId if provided
    const validPersonas: PersonaId[] = ['romantic-giver', 'self-expressive-buyer', 'gift-explorer'];
    if (personaId && !validPersonas.includes(personaId)) {
      return NextResponse.json({ error: 'Invalid persona ID' }, { status: 400 });
    }

    // Generate response using the persona assistant
    const response = await personaAssistant.generateResponse(sessionId, message, personaId);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error in assistant chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'SessionId is required' }, { status: 400 });
    }

    // Get conversation insights
    const insights = await personaAssistant.getConversationInsights(sessionId);

    return NextResponse.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error('Error getting conversation insights:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
