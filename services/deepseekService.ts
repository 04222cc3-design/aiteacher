import type { AIAction } from '../types';

export interface ChatHistory {
  systemPrompt: string;
  messages: { role: string; content: string }[];
}

export function initializeChat(systemPrompt: string): ChatHistory {
  return {
    systemPrompt,
    messages: []
  };
}

// DeepSeek API 配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

function getApiKey(): string {
  const key = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
  if (!key) {
    console.warn('DeepSeek API Key 未设置，请在 .env 文件中配置 VITE_DEEPSEEK_API_KEY');
  }
  return key;
}

/**
 * 调用 DeepSeek API 进行对话
 */
async function callDeepSeekAPI(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  userInput: string,
  image?: string
): Promise<string> {
  const apiKey = getApiKey();

  // 构建消息列表
  const apiMessages: any[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  // 处理用户输入（支持图片）
  if (image) {
    apiMessages.push({
      role: 'user',
      content: [
        { type: 'text', text: userInput || '请分析这张图片' },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } }
      ]
    });
  } else {
    apiMessages.push({
      role: 'user',
      content: userInput
    });
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 2048,
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API 请求失败 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || '';

  if (!reply) {
    throw new Error('DeepSeek API 返回内容为空');
  }

  return reply;
}

/**
 * 尝试将 AI 回复解析为 JSON 格式的 AIAction
 * 如果解析失败，则作为普通 speech 类型返回
 */
function parseResponseToAIAction(reply: string): AIAction {
  // 尝试提取 JSON（可能被包裹在 markdown 代码块中）
  let jsonStr = reply.trim();

  // 尝试从 ```json ... ``` 代码块中提取
  const jsonBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    jsonStr = jsonBlockMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object' && parsed.type) {
      return parsed as AIAction;
    }
  } catch {
    // 不是 JSON 格式，当作普通文本
  }

  // 默认作为 speech 类型返回
  return {
    type: 'speech',
    payload: { text: reply }
  };
}

export async function sendMessageToAI(chatHistory: ChatHistory, userInput: string, image?: string): Promise<{ newHistory: ChatHistory; response: AIAction }> {
  try {
    const reply = await callDeepSeekAPI(
      chatHistory.systemPrompt,
      chatHistory.messages,
      userInput,
      image
    );

    const aiAction = parseResponseToAIAction(reply);

    const newHistory: ChatHistory = {
      ...chatHistory,
      messages: [
        ...chatHistory.messages,
        { role: 'user', content: image ? JSON.stringify({ text: userInput, image: '[图片]' }) : userInput },
        { role: 'assistant', content: reply }
      ]
    };

    return {
      newHistory,
      response: aiAction
    };
  } catch (error) {
    console.error('DeepSeek API 调用失败:', error);

    // 出错时返回友好的错误提示
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    const fallbackResponse = `抱歉，AI 服务暂时遇到问题。${errorMessage}。请稍后再试。`;

    const newHistory: ChatHistory = {
      ...chatHistory,
      messages: [
        ...chatHistory.messages,
        { role: 'user', content: userInput },
        { role: 'assistant', content: fallbackResponse }
      ]
    };

    return {
      newHistory,
      response: {
        type: 'speech',
        payload: { text: fallbackResponse }
      }
    };
  }
}

// 兼容旧版本的简单文本问答接口
export async function sendTextMessageToAI(prompt: string): Promise<string> {
  try {
    const reply = await callDeepSeekAPI(
      '你是一位专业、友好的AI助手，请用中文回答用户的问题。',
      [],
      prompt
    );
    return reply;
  } catch (error) {
    console.error('DeepSeek API 调用失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return `抱歉，AI 服务暂时不可用。${errorMessage}。请稍后再试。`;
  }
}
