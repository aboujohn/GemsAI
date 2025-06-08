import {
  ConversationState,
  PersonaId,
  ConversationStateTransition,
  ConversationBranch,
  LanguageCode,
} from '@/lib/types/assistant';

// Conversation flow architecture and state management

export interface FlowNode {
  id: string;
  state: ConversationState;
  persona: PersonaId;
  triggers: string[];
  conditions: string[];
  actions: FlowAction[];
  branches: ConversationBranch[];
  fallbackNode?: string;
}

export interface FlowAction {
  type: 'collect_info' | 'update_preferences' | 'suggest_persona' | 'generate_recommendation';
  parameters: Record<string, any>;
}

export interface ConversationFlow {
  id: string;
  name: string;
  description: string;
  entryPoint: string;
  nodes: Record<string, FlowNode>;
  exitPoints: string[];
}

// Predefined conversation flows for different scenarios
export const JEWELRY_CONSULTATION_FLOW: ConversationFlow = {
  id: 'jewelry-consultation',
  name: 'Jewelry Consultation Flow',
  description: 'Main flow for jewelry consultation and recommendation',
  entryPoint: 'greeting',
  nodes: {
    greeting: {
      id: 'greeting',
      state: 'greeting',
      persona: 'gift-explorer',
      triggers: ['session_start', 'conversation_restart'],
      conditions: [],
      actions: [
        {
          type: 'collect_info',
          parameters: { fields: ['name', 'occasion', 'initial_preferences'] },
        },
      ],
      branches: [
        {
          condition: 'user_mentions_romance',
          targetState: 'exploring',
          targetPersona: 'romantic-giver',
          probability: 0.8,
        },
        {
          condition: 'user_mentions_personal_style',
          targetState: 'exploring',
          targetPersona: 'self-expressive-buyer',
          probability: 0.8,
        },
        {
          condition: 'user_mentions_gift',
          targetState: 'exploring',
          targetPersona: 'gift-explorer',
          probability: 0.9,
        },
        {
          condition: 'unclear_intent',
          targetState: 'clarifying',
          probability: 0.6,
        },
      ],
      fallbackNode: 'clarifying',
    },

    exploring: {
      id: 'exploring',
      state: 'exploring',
      persona: 'gift-explorer', // Default, can be overridden by branches
      triggers: ['from_greeting', 'from_clarifying', 'deep_dive_request'],
      conditions: ['user_engaged', 'sufficient_context'],
      actions: [
        {
          type: 'collect_info',
          parameters: {
            fields: ['recipient', 'relationship', 'budget', 'style_preferences', 'materials'],
          },
        },
      ],
      branches: [
        {
          condition: 'sufficient_information_collected',
          targetState: 'recommending',
          probability: 0.9,
        },
        {
          condition: 'user_confused_or_uncertain',
          targetState: 'clarifying',
          probability: 0.7,
        },
        {
          condition: 'persona_switch_detected',
          targetState: 'exploring',
          probability: 0.8,
        },
      ],
      fallbackNode: 'clarifying',
    },

    clarifying: {
      id: 'clarifying',
      state: 'clarifying',
      persona: 'gift-explorer',
      triggers: ['from_exploring', 'from_greeting', 'confusion_detected'],
      conditions: ['needs_clarification'],
      actions: [
        {
          type: 'collect_info',
          parameters: { fields: ['clarification_questions', 'preferences_refinement'] },
        },
      ],
      branches: [
        {
          condition: 'clarity_achieved',
          targetState: 'exploring',
          probability: 0.8,
        },
        {
          condition: 'ready_for_recommendations',
          targetState: 'recommending',
          probability: 0.9,
        },
        {
          condition: 'still_unclear',
          targetState: 'clarifying',
          probability: 0.5,
        },
      ],
      fallbackNode: 'exploring',
    },

    recommending: {
      id: 'recommending',
      state: 'recommending',
      persona: 'gift-explorer',
      triggers: ['from_exploring', 'from_clarifying', 'sufficient_info_collected'],
      conditions: ['has_sufficient_user_data'],
      actions: [
        {
          type: 'generate_recommendation',
          parameters: { include_alternatives: true, explain_reasoning: true },
        },
      ],
      branches: [
        {
          condition: 'user_satisfied',
          targetState: 'closing',
          probability: 0.9,
        },
        {
          condition: 'user_wants_alternatives',
          targetState: 'recommending',
          probability: 0.8,
        },
        {
          condition: 'user_needs_more_info',
          targetState: 'clarifying',
          probability: 0.7,
        },
        {
          condition: 'user_wants_to_explore_more',
          targetState: 'exploring',
          probability: 0.6,
        },
      ],
      fallbackNode: 'clarifying',
    },

    closing: {
      id: 'closing',
      state: 'closing',
      persona: 'gift-explorer',
      triggers: ['from_recommending', 'user_satisfied', 'session_timeout'],
      conditions: ['conversation_complete'],
      actions: [
        {
          type: 'collect_info',
          parameters: { fields: ['satisfaction_rating', 'feedback'] },
        },
      ],
      branches: [
        {
          condition: 'user_wants_new_consultation',
          targetState: 'greeting',
          probability: 0.7,
        },
      ],
      fallbackNode: 'greeting',
    },
  },
  exitPoints: ['closing', 'user_abandonment'],
};

export class ConversationFlowManager {
  private flows: Map<string, ConversationFlow> = new Map();
  private activeFlows: Map<string, { flowId: string; currentNode: string }> = new Map();

  constructor() {
    // Register default flows
    this.registerFlow(JEWELRY_CONSULTATION_FLOW);
  }

  /**
   * Register a new conversation flow
   */
  registerFlow(flow: ConversationFlow): void {
    this.flows.set(flow.id, flow);
  }

  /**
   * Start a new flow for a session
   */
  startFlow(sessionId: string, flowId: string): boolean {
    const flow = this.flows.get(flowId);
    if (!flow) {
      return false;
    }

    this.activeFlows.set(sessionId, {
      flowId,
      currentNode: flow.entryPoint,
    });

    return true;
  }

  /**
   * Get the current node for a session
   */
  getCurrentNode(sessionId: string): FlowNode | null {
    const activeFlow = this.activeFlows.get(sessionId);
    if (!activeFlow) {
      return null;
    }

    const flow = this.flows.get(activeFlow.flowId);
    if (!flow) {
      return null;
    }

    return flow.nodes[activeFlow.currentNode] || null;
  }

  /**
   * Evaluate flow transitions based on current context
   */
  evaluateTransition(
    sessionId: string,
    userInput: string,
    context: Record<string, any>
  ): ConversationStateTransition | null {
    const currentNode = this.getCurrentNode(sessionId);
    if (!currentNode) {
      return null;
    }

    // Evaluate branches based on conditions
    const bestBranch = this.findBestBranch(currentNode.branches, userInput, context);

    if (bestBranch) {
      const activeFlow = this.activeFlows.get(sessionId);
      if (activeFlow) {
        // Update current node
        const targetNodeId = this.findNodeByState(
          activeFlow.flowId,
          bestBranch.targetState,
          bestBranch.targetPersona
        );

        if (targetNodeId) {
          activeFlow.currentNode = targetNodeId;

          return {
            from: currentNode.state,
            to: bestBranch.targetState,
            trigger: bestBranch.condition,
            conditions: currentNode.conditions,
            persona: bestBranch.targetPersona || currentNode.persona,
          };
        }
      }
    }

    return null;
  }

  /**
   * Get suggested actions for current node
   */
  getSuggestedActions(sessionId: string): FlowAction[] {
    const currentNode = this.getCurrentNode(sessionId);
    return currentNode?.actions || [];
  }

  /**
   * Get available conversation branches
   */
  getAvailableBranches(sessionId: string): ConversationBranch[] {
    const currentNode = this.getCurrentNode(sessionId);
    return currentNode?.branches || [];
  }

  /**
   * Handle flow completion or errors
   */
  handleFlowError(sessionId: string): boolean {
    const currentNode = this.getCurrentNode(sessionId);
    if (!currentNode || !currentNode.fallbackNode) {
      return false;
    }

    const activeFlow = this.activeFlows.get(sessionId);
    if (activeFlow) {
      activeFlow.currentNode = currentNode.fallbackNode;
      return true;
    }

    return false;
  }

  /**
   * End flow for a session
   */
  endFlow(sessionId: string): void {
    this.activeFlows.delete(sessionId);
  }

  // Private helper methods

  private findBestBranch(
    branches: ConversationBranch[],
    userInput: string,
    context: Record<string, any>
  ): ConversationBranch | null {
    // Simple condition matching - in real implementation, this would use NLP
    const lowerInput = userInput.toLowerCase();

    for (const branch of branches) {
      if (this.evaluateCondition(branch.condition, lowerInput, context)) {
        return branch;
      }
    }

    return null;
  }

  private evaluateCondition(
    condition: string,
    userInput: string,
    context: Record<string, any>
  ): boolean {
    // Simple keyword-based condition evaluation
    // In production, this would use more sophisticated NLP
    switch (condition) {
      case 'user_mentions_romance':
        return /love|romantic|anniversary|valentine|engagement|wedding/i.test(userInput);

      case 'user_mentions_personal_style':
        return /style|personal|unique|express|myself|personality/i.test(userInput);

      case 'user_mentions_gift':
        return /gift|present|surprise|someone|friend|family/i.test(userInput);

      case 'sufficient_information_collected':
        return Object.keys(context.collectedInformation || {}).length >= 3;

      case 'user_satisfied':
        return /perfect|great|love|yes|good|thanks/i.test(userInput);

      case 'user_wants_alternatives':
        return /other|different|alternative|more options/i.test(userInput);

      case 'unclear_intent':
        return userInput.length < 10 || /help|don't know|not sure/i.test(userInput);

      default:
        return false;
    }
  }

  private findNodeByState(
    flowId: string,
    state: ConversationState,
    persona?: PersonaId
  ): string | null {
    const flow = this.flows.get(flowId);
    if (!flow) {
      return null;
    }

    // Find node matching state and optionally persona
    for (const [nodeId, node] of Object.entries(flow.nodes)) {
      if (node.state === state && (!persona || node.persona === persona)) {
        return nodeId;
      }
    }

    // Fallback: find any node with matching state
    for (const [nodeId, node] of Object.entries(flow.nodes)) {
      if (node.state === state) {
        return nodeId;
      }
    }

    return null;
  }
}

// Export singleton instance
export const conversationFlowManager = new ConversationFlowManager();
