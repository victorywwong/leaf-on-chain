import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { config } from '../config';
import { getLeafData, verifyPayment } from '../blockchain';

const router = Router();
const openai = new OpenAI({ apiKey: config.openaiApiKey });

/**
 * POST /api/chat
 * Chat with a leaf after payment verification
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { leafId, message, conversationHistory, txHash, userAddress } = req.body;

    // Validation
    if (!leafId || !message || !txHash || !userAddress) {
      return res.status(400).json({
        error: 'Missing required fields: leafId, message, txHash, userAddress',
      });
    }

    // Verify payment transaction
    console.log(`Verifying payment for leaf ${leafId}...`);
    const isPaymentValid = await verifyPayment(txHash, Number(leafId), userAddress);

    if (!isPaymentValid) {
      return res.status(403).json({
        error: 'Payment verification failed. Please pay for the message first.',
      });
    }

    // Get leaf data from blockchain
    const leaf = await getLeafData(Number(leafId));

    if (!leaf) {
      return res.status(404).json({
        error: 'Leaf not found',
      });
    }

    if (!leaf.isActive) {
      return res.status(403).json({
        error: 'This leaf is currently hibernating (inactive)',
      });
    }

    console.log(`Generating response for leaf "${leaf.name}"...`);

    // Build conversation history string
    let conversationContext = '';
    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      conversationContext = '\n\nPrevious conversation:\n';
      conversationHistory.forEach((msg: any) => {
        const role = msg.role === 'user' ? 'User' : 'You';
        conversationContext += `${role}: ${msg.content}\n`;
      });
    }

    // Create input with personality context and conversation history for GPT-5.1
    const input = `You are an AI digital replica (a "Leaf") with this personality:

${leaf.personalityNote}

Respond to the user's question authentically from this person's perspective. Provide complete, thoughtful responses that reflect the personality above.${conversationContext}

User asks: ${message}`;

    // Generate AI response using GPT-5.1 Responses API with web search
    const response = await openai.responses.create({
      model: 'gpt-5.1',
      input: input,
      tools: [{ type: 'web_search' }], // Enable real-time web search
      reasoning: { effort: 'low' }, // Use reasoning for better responses
      text: { verbosity: 'medium' }, // Balanced response length
    });

    const aiResponse = response.output_text || 'Sorry, I could not generate a response.';

    // Return response
    return res.json({
      success: true,
      data: {
        leafId: leafId,
        leafName: leaf.name,
        message: aiResponse,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error in chat endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/chat/leaf/:leafId
 * Get leaf information
 */
router.get('/leaf/:leafId', async (req: Request, res: Response) => {
  try {
    const { leafId } = req.params;

    if (!leafId) {
      return res.status(400).json({
        error: 'Missing leafId parameter',
      });
    }

    // Get leaf data from blockchain
    const leaf = await getLeafData(Number(leafId));

    if (!leaf) {
      return res.status(404).json({
        error: 'Leaf not found',
      });
    }

    // Format and return leaf data
    return res.json({
      success: true,
      data: {
        leafId: leafId,
        name: leaf.name,
        personalityNote: leaf.personalityNote,
        pricePerMessage: leaf.pricePerMessage.toString(),
        isActive: leaf.isActive,
        totalMessages: leaf.totalMessages.toString(),
        createdAt: new Date(Number(leaf.createdAt) * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching leaf info:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

export default router;
