import OpenAI from 'openai';

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: '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',
});

// 测试函数
async function testOpenAI() {
  try {
    console.log('开始测试OpenAI API...');
    console.log('API密钥:', 'sk-proj-...' + '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'.slice(-8));
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: '你是一个通信工程专业的智能导师' },
        { role: 'user', content: '二极管和三极管的区别' }
      ],
      temperature: 0.7,
    });
    
    console.log('测试成功！');
    console.log('响应状态:', response);
    console.log('回答:', response.choices[0].message.content);
  } catch (error) {
    console.error('测试失败:', error);
    console.error('错误名称:', error.name);
    console.error('错误消息:', error.message);
    console.error('错误详情:', JSON.stringify(error, null, 2));
  } finally {
    console.log('测试完成');
  }
}

// 运行测试
testOpenAI();