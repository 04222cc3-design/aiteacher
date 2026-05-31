import type { KnowledgeBaseItem, KnowledgeCategory, KnowledgeTag, RawSource, KnowledgeRelation, KnowledgeVersion, KnowledgeLintResult, KnowledgeQueryResult } from '../types';

// DeepSeek API配置
// 请访问 https://platform.deepseek.com/ 获取API密钥并替换以下值
const DEEPSEEK_API_KEY = 'sk-d74a27fcc8c347bcb9fc55481da9968c'; // 请替换为您的DeepSeek API密钥
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 存储对话历史
const conversationHistory = new Map<string, { role: 'user' | 'assistant', content: string }[]>();

// 资料处理函数
/**
 * 处理上传的资料文件
 */
export async function processUploadedFile(file: File): Promise<{ content: string; type: 'text' | 'pdf' | 'video' | 'audio' | 'image' }> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    return {
      content: await file.text(),
      type: 'text'
    };
  } else if (fileName.endsWith('.pdf')) {
    // 这里可以集成PDF处理库，如pdfjs-dist
    // 目前返回文件路径，实际项目中需要提取文本内容
    return {
      content: URL.createObjectURL(file),
      type: 'pdf'
    };
  } else if (fileName.endsWith('.mp4') || fileName.endsWith('.avi') || fileName.endsWith('.mov')) {
    return {
      content: URL.createObjectURL(file),
      type: 'video'
    };
  } else if (fileName.endsWith('.mp3') || fileName.endsWith('.wav') || fileName.endsWith('.m4a')) {
    return {
      content: URL.createObjectURL(file),
      type: 'audio'
    };
  } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif')) {
    return {
      content: URL.createObjectURL(file),
      type: 'image'
    };
  } else {
    throw new Error('不支持的文件格式');
  }
}

/**
 * 自动提取资料中的关键信息
 */
export async function extractKeyInformation(content: string, type: 'text' | 'pdf' | 'video' | 'audio' | 'image'): Promise<{ title: string; keyPoints: string[]; summary: string }> {
  try {
    // 使用DeepSeek API提取关键信息
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个信息提取助手，能够从各种资料中提取关键信息。请从以下内容中提取标题、关键点和摘要。'
          },
          {
            role: 'user',
            content: `资料类型: ${type}\n资料内容: ${content}\n\n请提取：\n1. 合适的标题\n2. 3-5个关键点\n3. 简短摘要（不超过100字）\n\n格式：\n标题：\n关键点：\n1. \n2. \n3. \n摘要：`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      throw new Error('API调用失败');
    }
    
    const responseData = await response.json();
    const result = responseData.choices?.[0]?.message?.content || '';
    
    // 解析结果
    const lines = result.split('\n');
    let title = '未命名资料';
    const keyPoints: string[] = [];
    let summary = '';
    
    let state = 'none';
    for (const line of lines) {
      if (line.includes('标题：')) {
        title = line.replace('标题：', '').trim();
        state = 'none';
      } else if (line.includes('关键点：')) {
        state = 'keyPoints';
      } else if (line.includes('摘要：')) {
        state = 'summary';
      } else if (state === 'keyPoints' && line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.') || line.trim().startsWith('4.') || line.trim().startsWith('5.')) {
        keyPoints.push(line.trim().replace(/^\d+\.\s*/, ''));
      } else if (state === 'summary' && line.trim()) {
        summary = line.trim();
      }
    }
    
    return { title, keyPoints, summary };
  } catch (error) {
    console.error('提取关键信息失败:', error);
    //  fallback
    return {
      title: '未命名资料',
      keyPoints: [],
      summary: '无法提取摘要'
    };
  }
}

/**
 * 基于资料创建知识条目
 */
export function createKnowledgeFromSource(source: RawSource, keyInformation: { title: string; keyPoints: string[]; summary: string }): KnowledgeBaseItem {
  const newKnowledge: KnowledgeBaseItem = {
    id: `kb${knowledgeBase.length + 1}`,
    title: keyInformation.title,
    content: keyInformation.summary + '\n\n' + keyInformation.keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\n'),
    category: '未分类',
    tags: keyInformation.keyPoints.map(point => point.split(' ')[0]),
    source_ids: [source.id],
    related_ids: [],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    verification_status: 'unverified'
  };
  
  knowledgeBase.push(newKnowledge);
  return newKnowledge;
}

// 模拟原始资料数据
const rawSources: RawSource[] = [
  {
    id: 'source1',
    title: '模拟电子技术课程PPT',
    type: 'pdf',
    content: 'https://example.com/analog_electronics.pdf',
    source_url: 'https://course.example.com/analog_electronics',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    knowledge_ids: ['14']
  },
  {
    id: 'source2',
    title: '数字电路实验指导书',
    type: 'text',
    content: '数字电路实验包括逻辑门电路、触发器、计数器等实验内容...',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    knowledge_ids: ['15']
  }
];

// 模拟知识关联数据
const knowledgeRelations: KnowledgeRelation[] = [
  {
    id: 'rel1',
    source_id: '13',
    target_id: '14',
    type: 'prerequisite',
    strength: 0.9,
    created_at: new Date().toISOString()
  },
  {
    id: 'rel2',
    source_id: '14',
    target_id: '15',
    type: 'related',
    strength: 0.8,
    created_at: new Date().toISOString()
  }
];

// 模拟知识版本数据
const knowledgeVersions: KnowledgeVersion[] = [
  {
    id: 'ver1',
    knowledge_id: '14',
    version: 1,
    content: '模拟电子技术是通信工程专业的核心课程...',
    changes: '初始版本',
    created_at: new Date().toISOString(),
    created_by: 'system'
  }
];

// 模拟知识库数据 - 实际项目中应该从数据库获取
const knowledgeBase: KnowledgeBaseItem[] = [
  {
    id: '1',
    title: '大学学习方法',
    content: '大学学习方法包括：\n1. 主动学习：积极参与课堂讨论，主动提问\n2. 时间管理：制定合理的学习计划，避免拖延\n3. 笔记技巧：使用康奈尔笔记法，定期复习\n4. 小组学习：与同学合作学习，互相监督\n5. 资源利用：充分利用图书馆、在线资源等\n6. 批判性思维：学会分析和评价信息\n7. 跨学科学习：拓宽知识视野，培养综合能力',
    category: '学习方法',
    tags: ['学习方法', '时间管理', '笔记技巧'],
    source_ids: [],
    related_ids: ['2', '3'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '2',
    title: '网课学习技巧',
    content: '网课学习技巧：\n1. 创造良好的学习环境，减少干扰\n2. 提前预习课程内容\n3. 积极参与线上讨论和互动\n4. 定期复习和总结\n5. 使用笔记工具记录重点内容\n6. 合理安排学习时间，避免连续长时间学习\n7. 利用回放功能复习难点内容\n8. 与同学建立学习小组，互相督促',
    category: '学习方法',
    tags: ['网课', '在线学习', '学习技巧'],
    source_ids: [],
    related_ids: ['1', '3'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '3',
    title: '时间管理技巧',
    content: '时间管理技巧：\n1. 使用四象限法则区分任务优先级\n2. 制定每日、每周、每月学习计划\n3. 采用番茄工作法提高学习效率\n4. 避免 multitasking，专注于单一任务\n5. 合理安排休息时间，避免 burnout\n6. 利用碎片时间学习\n7. 定期回顾和调整时间管理策略',
    category: '学习方法',
    tags: ['时间管理', '效率', '计划'],
    source_ids: [],
    related_ids: ['1', '2'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '4',
    title: '考试技巧',
    content: '考试技巧：\n1. 提前复习，制定合理的复习计划\n2. 模拟考试，熟悉题型和时间管理\n3. 考试前保持充足的睡眠\n4. 考试中先易后难，合理分配时间\n5. 仔细审题，避免粗心错误\n6. 答题时保持卷面整洁\n7. 合理利用草稿纸\n8. 考试后及时总结经验教训',
    category: '考试技巧',
    tags: ['考试', '复习', '时间管理'],
    source_ids: [],
    related_ids: ['5'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '5',
    title: '期末考试准备',
    content: '期末考试准备：\n1. 提前4-6周开始复习\n2. 整理课堂笔记和重点内容\n3. 制作思维导图梳理知识点\n4. 做历年真题熟悉考试题型\n5. 参加复习辅导班或小组\n6. 合理安排作息时间\n7. 考试前一天避免熬夜\n8. 准备好考试所需用品',
    category: '考试技巧',
    tags: ['期末考试', '复习', '准备'],
    source_ids: [],
    related_ids: ['4'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '6',
    title: '科研竞赛',
    content: '科研竞赛参与指南：\n1. 选择感兴趣的研究方向\n2. 寻找导师和团队合作\n3. 制定详细的研究计划\n4. 认真准备竞赛材料和答辩\n5. 从失败中学习，不断改进\n6. 关注学术前沿动态\n7. 学习科研方法和论文写作\n8. 培养创新思维和问题解决能力',
    category: '科研竞赛',
    tags: ['科研', '竞赛', '团队合作'],
    source_ids: [],
    related_ids: ['7', '8'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '7',
    title: '社会实践',
    content: '社会实践建议：\n1. 选择与专业相关的实践项目\n2. 积极参与志愿者活动\n3. 关注社会热点问题\n4. 培养沟通和团队协作能力\n5. 记录实践经验，形成个人成长档案\n6. 撰写实践报告，总结收获\n7. 建立社会实践网络\n8. 将实践经验与专业学习相结合',
    category: '社会实践',
    tags: ['社会实践', '志愿者', '沟通能力'],
    source_ids: [],
    related_ids: ['6', '8'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '8',
    title: '专业能力实践',
    content: '专业能力实践方法：\n1. 参加专业相关的实习\n2. 参与项目实践，积累经验\n3. 考取相关专业证书\n4. 加入专业社团和组织\n5. 关注行业动态，了解最新技术\n6. 参加专业技能培训\n7. 建立专业作品集\n8. 与行业专业人士建立联系',
    category: '专业能力',
    tags: ['专业能力', '实习', '证书'],
    source_ids: [],
    related_ids: ['6', '7', '9', '10'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '9',
    title: '考研指导',
    content: '考研准备指南：\n1. 确定目标院校和专业\n2. 制定详细的复习计划\n3. 选择适合的复习资料\n4. 参加考研辅导班或自习小组\n5. 保持良好的心态，坚持到底\n6. 合理安排作息时间\n7. 关注考研政策和院校信息\n8. 做好复试准备',
    category: '考研就业',
    tags: ['考研', '复习', '目标设定'],
    source_ids: [],
    related_ids: ['8', '10'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '10',
    title: '就业指导',
    content: '就业准备建议：\n1. 提前了解就业市场和行业需求\n2. 制作专业的简历和求职信\n3. 准备面试技巧和常见问题\n4. 建立职业网络，寻找实习机会\n5. 不断提升自身技能和知识水平\n6. 参加校园招聘会和宣讲会\n7. 利用就业指导中心资源\n8. 制定职业发展规划',
    category: '考研就业',
    tags: ['就业', '简历', '面试'],
    source_ids: [],
    related_ids: ['8', '9', '11', '12'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '11',
    title: '简历制作技巧',
    content: '简历制作技巧：\n1. 保持简洁明了，控制在1-2页\n2. 突出专业技能和实践经验\n3. 使用量化的成果展示能力\n4. 针对不同岗位定制简历\n5. 注意格式规范和排版美观\n6. 避免拼写和语法错误\n7. 包含相关证书和获奖情况\n8. 提供专业的联系方式',
    category: '考研就业',
    tags: ['简历', '就业', '求职'],
    source_ids: [],
    related_ids: ['10', '12'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '12',
    title: '面试技巧',
    content: '面试技巧：\n1. 提前了解面试公司和岗位\n2. 准备自我介绍和常见问题答案\n3. 穿着得体，保持良好形象\n4. 保持自信，注意肢体语言\n5. 倾听问题，思考后再回答\n6. 提问关于公司和岗位的问题\n7. 面试后发送感谢信\n8. 总结面试经验，不断改进',
    category: '考研就业',
    tags: ['面试', '就业', '求职'],
    source_ids: [],
    related_ids: ['10', '11'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '13',
    title: '电路原理',
    content: '电路原理是通信工程专业的基础课程，主要内容包括：\n1. 电路的基本概念和定律（欧姆定律、基尔霍夫定律等）\n2. 电路分析方法（节点分析法、网孔分析法、戴维南定理等）\n3. 正弦稳态电路分析（相量法、功率计算）\n4. 三相电路\n5. 暂态分析（一阶、二阶电路）\n6. 频率响应和滤波器\n7. 耦合电路和理想变压器\n8. 二端口网络\n\n学习建议：\n- 掌握基本定律和分析方法\n- 多做习题，加强电路分析能力\n- 理解电路的物理意义\n- 结合实验加深理解',
    category: '通信工程专业课程',
    tags: ['电路原理', '基础课程', '电路分析'],
    source_ids: [],
    related_ids: ['14', '16', '18'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '14',
    title: '模拟电子技术',
    content: '模拟电子技术是通信工程专业的核心课程，主要内容包括：\n1. 半导体器件（二极管、三极管、场效应管）\n2. 基本放大电路（共射、共集、共基放大电路）\n3. 多级放大电路\n4. 集成运算放大器\n5. 反馈放大电路\n6. 信号运算与处理电路\n7. 信号产生电路（正弦波、方波等）\n8. 功率放大电路\n9. 直流稳压电源\n\n学习建议：\n- 理解半导体器件的工作原理\n- 掌握基本放大电路的分析方法\n- 多做实验，培养实际操作能力\n- 关注电路的频率响应和稳定性',
    category: '通信工程专业课程',
    tags: ['模拟电子技术', '半导体', '放大电路'],
    source_ids: ['source1'],
    related_ids: ['13', '15'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '15',
    title: '数字电路',
    content: '数字电路是通信工程专业的重要课程，主要内容包括：\n1. 数字逻辑基础（布尔代数、逻辑门电路）\n2. 组合逻辑电路（编码器、解码器、 multiplexer等）\n3. 时序逻辑电路（触发器、计数器、寄存器）\n4. 半导体存储器\n5. 可编程逻辑器件（PLD、FPGA）\n6. 数字系统设计\n7. 模数和数模转换\n\n学习建议：\n- 掌握数字逻辑的基本概念\n- 多做逻辑设计练习\n- 熟悉数字电路的设计工具\n- 理解数字系统的工作原理',
    category: '通信工程专业课程',
    tags: ['数字电路', '逻辑设计', '时序电路'],
    source_ids: ['source2'],
    related_ids: ['14', '16', '19'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '16',
    title: '信号与系统',
    content: '信号与系统是通信工程专业的基础课程，主要内容包括：\n1. 信号的分类和表示\n2. 系统的基本概念和性质\n3. 连续时间系统的时域分析\n4. 连续时间系统的频域分析（傅里叶变换）\n5. 离散时间系统的时域分析\n6. 离散时间系统的频域分析（离散傅里叶变换）\n7. 拉普拉斯变换和Z变换\n8. 系统的状态空间分析\n\n学习建议：\n- 理解信号和系统的基本概念\n- 掌握各种变换的应用\n- 多做习题，加强分析能力\n- 结合实际通信系统理解理论知识',
    category: '通信工程专业课程',
    tags: ['信号与系统', '傅里叶变换', '系统分析'],
    source_ids: [],
    related_ids: ['13', '15', '17', '19'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '17',
    title: '通信原理',
    content: '通信原理是通信工程专业的核心课程，主要内容包括：\n1. 通信系统的基本概念和模型\n2. 随机过程基础\n3. 模拟调制系统（AM、FM、PM）\n4. 数字基带传输\n5. 数字调制系统（ASK、FSK、PSK、QAM）\n6. 信道编码\n7. 多路复用和多址技术\n8. 扩频通信\n9. 数字通信系统的性能分析\n\n学习建议：\n- 理解通信系统的基本模型\n- 掌握各种调制解调技术\n- 熟悉通信系统的性能指标\n- 关注现代通信技术的发展',
    category: '通信工程专业课程',
    tags: ['通信原理', '调制解调', '数字通信'],
    source_ids: [],
    related_ids: ['16', '18', '19'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '18',
    title: '电磁场与电磁波',
    content: '电磁场与电磁波是通信工程专业的基础课程，主要内容包括：\n1. 矢量分析和场论基础\n2. 静电场和恒定电场\n3. 恒定磁场\n4. 时变电磁场和麦克斯韦方程组\n5. 平面电磁波\n6. 电磁波的反射和折射\n7. 传输线理论\n8. 波导和谐振腔\n\n学习建议：\n- 掌握矢量分析的基本方法\n- 理解麦克斯韦方程组的物理意义\n- 多做习题，加强场的分析能力\n- 结合实际通信系统理解电磁波的应用',
    category: '通信工程专业课程',
    tags: ['电磁场', '电磁波', '传输线'],
    source_ids: [],
    related_ids: ['13', '17'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  },
  {
    id: '19',
    title: '数字信号处理',
    content: '数字信号处理是通信工程专业的重要课程，主要内容包括：\n1. 离散时间信号和系统\n2. 离散傅里叶变换（DFT）\n3. 快速傅里叶变换（FFT）\n4. 数字滤波器设计（FIR和IIR）\n5. 信号的采样和重构\n6. 多速率信号处理\n7. 自适应信号处理\n8. 数字信号处理的应用\n\n学习建议：\n- 掌握离散时间信号和系统的基本概念\n- 熟悉DFT和FFT的应用\n- 学会数字滤波器的设计方法\n- 结合MATLAB等工具进行实践',
    category: '通信工程专业课程',
    tags: ['数字信号处理', 'DFT', '滤波器设计'],
    source_ids: [],
    related_ids: ['15', '16', '17'],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    verification_status: 'verified'
  }
];

const categories: KnowledgeCategory[] = [
  { id: '1', name: '学习方法', description: '大学学习相关的方法和技巧', parent_id: undefined, depth: 0 },
  { id: '2', name: '考试技巧', description: '各类考试的备考和应试技巧', parent_id: undefined, depth: 0 },
  { id: '3', name: '科研竞赛', description: '科研项目和竞赛的参与指南', parent_id: undefined, depth: 0 },
  { id: '4', name: '社会实践', description: '社会实践活动的参与和收获', parent_id: undefined, depth: 0 },
  { id: '5', name: '专业能力', description: '专业技能的培养和实践', parent_id: undefined, depth: 0 },
  { id: '6', name: '考研就业', description: '考研准备和就业指导', parent_id: undefined, depth: 0 },
  { id: '7', name: '通信工程专业课程', description: '通信工程专业相关的核心课程', parent_id: undefined, depth: 0 }
];

/**
 * 获取所有知识库分类
 */
export function getKnowledgeCategories(): KnowledgeCategory[] {
  return categories;
}

/**
 * 根据分类获取知识库内容
 */
export function getKnowledgeByCategory(category: string): KnowledgeBaseItem[] {
  return knowledgeBase.filter(item => item.category === category);
}

/**
 * 搜索知识库内容
 */
export function searchKnowledge(query: string): KnowledgeBaseItem[] {
  const lowerQuery = query.toLowerCase();
  return knowledgeBase.filter(item => 
    item.title.toLowerCase().includes(lowerQuery) ||
    item.content.toLowerCase().includes(lowerQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * 根据ID获取知识库内容
 */
export function getKnowledgeById(id: string): KnowledgeBaseItem | undefined {
  return knowledgeBase.find(item => item.id === id);
}

/**
 * 获取所有知识库内容
 */
export function getAllKnowledge(): KnowledgeBaseItem[] {
  return knowledgeBase;
}

/**
 * 获取所有原始资料
 */
export function getAllRawSources(): RawSource[] {
  return rawSources;
}

/**
 * 根据ID获取原始资料
 */
export function getRawSourceById(id: string): RawSource | undefined {
  return rawSources.find(source => source.id === id);
}

/**
 * 添加原始资料
 */
export function addRawSource(source: Omit<RawSource, 'id' | 'created_at' | 'updated_at'>): RawSource {
  const newSource: RawSource = {
    ...source,
    id: `source${rawSources.length + 1}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  rawSources.push(newSource);
  return newSource;
}

/**
 * 获取知识关联
 */
export function getKnowledgeRelations(): KnowledgeRelation[] {
  return knowledgeRelations;
}

/**
 * 根据知识ID获取关联
 */
export function getRelationsByKnowledgeId(knowledgeId: string): KnowledgeRelation[] {
  return knowledgeRelations.filter(rel => rel.source_id === knowledgeId || rel.target_id === knowledgeId);
}

/**
 * 添加知识关联
 */
export function addKnowledgeRelation(relation: Omit<KnowledgeRelation, 'id' | 'created_at'>): KnowledgeRelation {
  const newRelation: KnowledgeRelation = {
    ...relation,
    id: `rel${knowledgeRelations.length + 1}`,
    created_at: new Date().toISOString()
  };
  knowledgeRelations.push(newRelation);
  return newRelation;
}

/**
 * 获取知识版本
 */
export function getKnowledgeVersions(): KnowledgeVersion[] {
  return knowledgeVersions;
}

/**
 * 根据知识ID获取版本
 */
export function getVersionsByKnowledgeId(knowledgeId: string): KnowledgeVersion[] {
  return knowledgeVersions.filter(version => version.knowledge_id === knowledgeId);
}

/**
 * 添加知识版本
 */
export function addKnowledgeVersion(version: Omit<KnowledgeVersion, 'id' | 'created_at'>): KnowledgeVersion {
  const newVersion: KnowledgeVersion = {
    ...version,
    id: `ver${knowledgeVersions.length + 1}`,
    created_at: new Date().toISOString()
  };
  knowledgeVersions.push(newVersion);
  
  // 更新知识项目的版本号
  const knowledge = knowledgeBase.find(item => item.id === version.knowledge_id);
  if (knowledge) {
    knowledge.version = version.version;
    knowledge.updated_at = new Date().toISOString();
  }
  
  return newVersion;
}

/**
 * 执行知识体检
 */
export function lintKnowledgeBase(): KnowledgeLintResult[] {
  const results: KnowledgeLintResult[] = [];
  const now = new Date();
  
  // 检查孤立页面
  knowledgeBase.forEach(knowledge => {
    if (knowledge.related_ids.length === 0) {
      results.push({
        id: `lint${results.length + 1}`,
        knowledge_id: knowledge.id,
        type: 'isolated',
        severity: 'low',
        message: '此知识页面没有关联的其他知识',
        suggested_fix: '添加与相关知识点的关联',
        created_at: now.toISOString()
      });
    }
  });
  
  // 检查验证状态
  knowledgeBase.forEach(knowledge => {
    if (knowledge.verification_status === 'unverified') {
      results.push({
        id: `lint${results.length + 1}`,
        knowledge_id: knowledge.id,
        type: 'incomplete',
        severity: 'medium',
        message: '此知识页面未验证',
        suggested_fix: '验证知识内容的准确性',
        created_at: now.toISOString()
      });
    }
  });
  
  // 检查过时内容
  knowledgeBase.forEach(knowledge => {
    const updatedDate = new Date(knowledge.updated_at);
    const daysSinceUpdate = (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 90) {
      results.push({
        id: `lint${results.length + 1}`,
        knowledge_id: knowledge.id,
        type: 'outdated',
        severity: 'medium',
        message: '此知识页面已超过90天未更新',
        suggested_fix: '检查并更新知识内容以保持时效性',
        created_at: now.toISOString()
      });
    }
  });
  
  // 检查内容一致性（简单实现）
  for (let i = 0; i < knowledgeBase.length; i++) {
    for (let j = i + 1; j < knowledgeBase.length; j++) {
      const kb1 = knowledgeBase[i];
      const kb2 = knowledgeBase[j];
      
      // 检查标题相似但内容不同的情况
      if (kb1.title.toLowerCase() === kb2.title.toLowerCase() && kb1.content !== kb2.content) {
        results.push({
          id: `lint${results.length + 1}`,
          knowledge_id: kb1.id,
          type: 'conflict',
          severity: 'high',
          message: `此知识页面与页面 ${kb2.id} 标题相同但内容不同`,
          suggested_fix: '合并或重命名其中一个知识页面',
          created_at: now.toISOString()
        });
      }
    }
  }
  
  // 检查内容长度
  knowledgeBase.forEach(knowledge => {
    if (knowledge.content.length < 50) {
      results.push({
        id: `lint${results.length + 1}`,
        knowledge_id: knowledge.id,
        type: 'incomplete',
        severity: 'low',
        message: '此知识页面内容过短',
        suggested_fix: '补充更多详细信息',
        created_at: now.toISOString()
      });
    }
  });
  
  return results;
}

/**
 * 获取知识体检统计信息
 */
export function getLintStatistics(): {
  total: number;
  bySeverity: { low: number; medium: number; high: number };
  byType: { isolated: number; incomplete: number; outdated: number; conflict: number };
} {
  const lintResults = lintKnowledgeBase();
  
  return {
    total: lintResults.length,
    bySeverity: {
      low: lintResults.filter(r => r.severity === 'low').length,
      medium: lintResults.filter(r => r.severity === 'medium').length,
      high: lintResults.filter(r => r.severity === 'high').length
    },
    byType: {
      isolated: lintResults.filter(r => r.type === 'isolated').length,
      incomplete: lintResults.filter(r => r.type === 'incomplete').length,
      outdated: lintResults.filter(r => r.type === 'outdated').length,
      conflict: lintResults.filter(r => r.type === 'conflict').length
    }
  };
}

/**
 * 生成知识图谱数据
 */
export function generateKnowledgeGraphData() {
  const nodes = knowledgeBase.map(knowledge => ({
    id: knowledge.id,
    title: knowledge.title,
    category: knowledge.category,
    size: Math.min(15 + knowledge.content.length / 500, 30) // 根据内容长度调整节点大小
  }));
  
  const links = [];
  let linkId = 1;
  
  // 添加知识之间的关联
  knowledgeBase.forEach(knowledge => {
    knowledge.related_ids.forEach(relatedId => {
      // 避免重复链接
      if (nodes.some(node => node.id === relatedId) && !links.some(link => 
        (link.source === knowledge.id && link.target === relatedId) || 
        (link.source === relatedId && link.target === knowledge.id)
      )) {
        links.push({
          id: `link${linkId++}`,
          source: knowledge.id,
          target: relatedId,
          strength: 1
        });
      }
    });
  });
  
  // 添加知识与原始资料的关联
  rawSources.forEach(source => {
    source.knowledge_ids.forEach(knowledgeId => {
      if (nodes.some(node => node.id === knowledgeId)) {
        links.push({
          id: `link${linkId++}`,
          source: source.id,
          target: knowledgeId,
          strength: 0.5,
          type: 'source'
        });
      }
    });
  });
  
  // 添加原始资料节点
  const sourceNodes = rawSources.map(source => ({
    id: source.id,
    title: source.title,
    type: source.type,
    size: 10
  }));
  
  return {
    nodes: [...nodes, ...sourceNodes],
    links
  };
}

/**
 * 基于RAG技术的知识查询（优化性能）
 */
export function queryKnowledgeWithRAG(query: string): KnowledgeQueryResult[] {
  // 改进的相关性计算
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 1);
  
  // 优化：提前过滤掉明显不相关的知识，减少计算量
  const filteredKnowledge = knowledgeBase.filter(knowledge => {
    const lowerTitle = knowledge.title.toLowerCase();
    const lowerContent = knowledge.content.toLowerCase();
    
    // 快速检查：标题或内容是否包含查询词
    return lowerTitle.includes(lowerQuery) || 
           lowerContent.includes(lowerQuery) ||
           queryWords.some(word => lowerTitle.includes(word) || lowerContent.includes(word));
  });
  
  const results: KnowledgeQueryResult[] = filteredKnowledge
    .map(knowledge => {
      let relevance = 0;
      
      // 标题匹配（权重最高）
      const lowerTitle = knowledge.title.toLowerCase();
      if (lowerTitle.includes(lowerQuery)) {
        relevance += 0.6;
      } else if (queryWords.some(word => lowerTitle.includes(word))) {
        relevance += 0.4;
      }
      
      // 内容匹配
      const lowerContent = knowledge.content.toLowerCase();
      if (lowerContent.includes(lowerQuery)) {
        relevance += 0.3;
      } else if (queryWords.some(word => lowerContent.includes(word))) {
        relevance += 0.2;
      }
      
      // 标签匹配
      if (knowledge.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
        relevance += 0.15;
      } else if (knowledge.tags.some(tag => queryWords.some(word => tag.toLowerCase().includes(word)))) {
        relevance += 0.1;
      }
      
      // 验证状态加分
      if (knowledge.verification_status === 'verified') {
        relevance += 0.05;
      }
      
      return {
        knowledge,
        relevance,
        sources: rawSources.filter(source => source.knowledge_ids.includes(knowledge.id)),
        relations: knowledgeRelations.filter(rel => rel.source_id === knowledge.id || rel.target_id === knowledge.id)
      };
    })
    .filter(result => result.relevance > 0.1) // 提高阈值，只返回相关性较高的结果
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5); // 限制返回数量，避免上下文过长
  
  return results;
}

/**
 * 从知识库中获取问题答案（使用DeepSeek API和RAG技术）
 */
export async function getAnswerFromKnowledgeBase(question: string, userId: string = 'default'): Promise<{ answer: string; error?: string; errorDetails?: string; sources?: string[] }> {
  // 获取用户的对话历史
  let history = conversationHistory.get(userId) || [];
  
  // 添加新问题到历史
  history.push({ role: 'user', content: question });
  
  try {
    console.log('开始调用DeepSeek API');
    console.log('问题:', question);
    console.log('历史记录:', history);
    
    // 使用RAG技术获取相关知识
    const relevantKnowledge = queryKnowledgeWithRAG(question);
    console.log('相关知识:', relevantKnowledge);
    
    // 构建知识上下文
    let knowledgeContext = '';
    const sources: string[] = [];
    
    if (relevantKnowledge.length > 0) {
      knowledgeContext = '根据知识库内容，相关信息如下：\n\n';
      relevantKnowledge.forEach((item, index) => {
        knowledgeContext += `${index + 1}. ${item.knowledge.title}\n`;
        // 只取内容的前500字符，避免上下文过长
        const contentPreview = item.knowledge.content.length > 500 
          ? item.knowledge.content.substring(0, 500) + '...' 
          : item.knowledge.content;
        knowledgeContext += contentPreview + '\n\n';
        
        // 添加相关的原始资料
        if (item.sources.length > 0) {
          knowledgeContext += '相关资料：\n';
          item.sources.forEach(source => {
            knowledgeContext += `- ${source.title} (${source.type})\n`;
            sources.push(`${source.title} (${source.type})`);
          });
          knowledgeContext += '\n';
        }
      });
      knowledgeContext += '\n请基于以上信息回答用户问题，确保回答准确、专业、易懂。如果信息不足，请明确说明。';
    }
    
    // 构建DeepSeek API请求消息
    const messages = [
      {
        role: 'system',
        content: '你是一个通信工程专业的智能导师，精通电路原理、模拟电子技术、数字电路、信号与系统、通信原理、电磁场与电磁波、数字信号处理等课程，以及大学学习方法、考试技巧、科研竞赛、社会实践、考研就业等方面的知识。请以专业、清晰、易懂的方式回答问题，确保信息准确。'
      },
      ...(knowledgeContext ? [{ role: 'system', content: knowledgeContext }] : []),
      // 只使用最近的3轮对话历史，避免上下文过长
      ...history.slice(-6)
    ];
    
    // 调用DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.3, // 降低温度，提高回答的准确性
        max_tokens: 1500, // 增加最大token数，确保能生成完整回答
        top_p: 0.9, // 控制生成的多样性
        frequency_penalty: 0.1, // 减少重复内容
        presence_penalty: 0.1 // 鼓励新内容
      })
    });
    
    console.log('API响应状态:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API调用失败: ${response.status} ${response.statusText}\n${JSON.stringify(errorData)}`);
    }
    
    const responseData = await response.json();
    console.log('API响应数据:', responseData);
    
    let answer = responseData.choices?.[0]?.message?.content || '抱歉，我无法回答这个问题。';
    
    // 添加来源信息到回答
    if (sources.length > 0) {
      answer += '\n\n**参考资料：**\n';
      sources.forEach((source, index) => {
        answer += `${index + 1}. ${source}\n`;
      });
    }
    
    // 添加AI回答到历史
    history.push({ role: 'assistant', content: answer });
    
    // 限制历史长度，只保留最近的5轮对话
    if (history.length > 10) {
      history = history.slice(-10);
    }
    
    // 保存更新后的历史
    conversationHistory.set(userId, history);
    
    return { answer, sources };
  } catch (error: any) {
    console.error('AI回答错误:', error);
    console.error('错误详情:', JSON.stringify(error, null, 2));
    
    // 详细的错误处理
    let errorMessage = '抱歉，我遇到了一个错误。请稍后再试。';
    let errorDetails = error.message || JSON.stringify(error, null, 2);
    
    if (error.message.includes('API key') || error.message.includes('Authorization')) {
      errorMessage = 'API密钥错误或无效，请检查API密钥配置。';
    } else if (error.message.includes('rate limit') || error.message.includes('429')) {
      errorMessage = 'API调用频率过高或配额用尽，请稍后再试。';
    } else if (error.message.includes('network') || error.message.includes('Connection error') || error.message.includes('Failed to fetch')) {
      errorMessage = '网络连接错误，请检查网络连接后重试。';
    } else if (error.message.includes('model')) {
      errorMessage = '模型错误，请检查模型配置。';
    } else if (error.message.includes('401')) {
      errorMessage = 'API密钥无效，请检查API密钥。';
    }
    
    // 尝试使用知识库作为后备
    try {
      const relevantItems = searchKnowledge(question);
      if (relevantItems.length > 0) {
        let answer = `根据知识库内容，我为您整理了以下信息：\n\n`;
        relevantItems.slice(0, 3).forEach((item, index) => {
          answer += `${index + 1}. ${item.title}\n`;
          answer += item.content + '\n\n';
        });
        answer += `\n（注：由于API调用失败，此回答基于本地知识库内容。）`;
        return { answer, error: 'API调用失败', errorDetails };
      }
    } catch (kbError) {
      console.error('知识库查询错误:', kbError);
    }
    
    return { answer: errorMessage, error: 'API调用失败', errorDetails };
  }
}
