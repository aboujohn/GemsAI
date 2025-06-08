import { NextRequest, NextResponse } from 'next/server';
import { getAllPersonaTemplates, getPersonaTemplate } from '@/lib/services/persona-templates';
import { conversationStateManager } from '@/lib/services/conversation-state';
import { personaAssistant } from '@/lib/services/persona-assistant';
import { PersonaId } from '@/lib/types/assistant';

// GET - Get all available personas or specific persona info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const personaId = searchParams.get('personaId') as PersonaId;
    const sessionId = searchParams.get('sessionId');

    if (personaId) {
      // Get specific persona information
      const persona = getPersonaTemplate(personaId);
      return NextResponse.json({
        success: true,
        data: persona
      });
    }

    if (sessionId) {
      // Get suggested persona for this session
      const suggestedPersona = await personaAssistant.suggestPersonaSwitch(sessionId);
      const allPersonas = getAllPersonaTemplates();
      
      return NextResponse.json({
        success: true,
        data: {
          personas: allPersonas,
          suggested: suggestedPersona
        }
      });
    }

    // Get all personas
    const personas = getAllPersonaTemplates();
    return NextResponse.json({
      success: true,
      data: personas
    });

  } catch (error) {
    console.error('Error getting personas:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Switch persona for a session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, personaId, reason } = body;

    // Validate required fields
    if (!sessionId || !personaId) {
      return NextResponse.json(
        { error: 'SessionId and personaId are required' },
        { status: 400 }
      );
    }

    // Validate personaId
    const validPersonas: PersonaId[] = ['romantic-giver', 'self-expressive-buyer', 'gift-explorer'];
    if (!validPersonas.includes(personaId)) {
      return NextResponse.json(
        { error: 'Invalid persona ID' },
        { status: 400 }
      );
    }

    // Switch persona
    const success = conversationStateManager.switchPersona(sessionId, personaId, reason || 'user_request');

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to switch persona or session not found' },
        { status: 404 }
      );
    }

    // Get updated context
    const context = conversationStateManager.getContext(sessionId);
    const persona = getPersonaTemplate(personaId);

    return NextResponse.json({
      success: true,
      data: {
        newPersona: persona,
        context: {
          activePersona: context?.activePersona,
          state: context?.state,
          switchCount: context?.metadata.switchCount
        }
      }
    });

  } catch (error) {
    console.error('Error switching persona:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 