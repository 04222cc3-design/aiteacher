import type { AIAction } from '../types';

export const lessonSummary = `
这堂课的主题是社会实践，帮助大学生了解如何参与社会实践活动并从中获益。
核心观点包括：
1. 社会实践的类型：志愿服务、社会调研、企业实习、暑期支教、乡村振兴实践等。
2. 如何找到好的实践机会：学校平台、社会组织、企业项目、自主策划。
3. 实践中的技能培养：沟通能力、组织协调、问题解决、适应能力。
4. 实践成果的总结与转化：实践报告撰写、成果展示、简历优化。
5. 社会实践的深层意义：社会责任感、自我认知、职业探索。
`;

export const lessonScript: AIAction[] = [
  // Step 0: Show PDF
  {
    type: "command",
    payload: {
      name: "show_pdf",
      args: {
        url: "https://soxpkytjeqygryertwoe.supabase.co/storage/v1/object/public/lesson_materials/public/1778326133312-shehuishijian.pdf",
        page: 1
      }
    }
  },
  // Step 1: Introduction

  {
    type: "speech",
    payload: {
      text: "同学们好！欢迎来到《社会实践》课堂。\n\n大学是一个小社会，而社会实践就是你走出校园、接触真实世界的最好机会。无论是志愿服务、社会调研还是企业实习，社会实践都能让你学到课堂上学不到的东西。\n\n更重要的是，社会实践经历在保研、求职中越来越重要。一份有深度的实践经历，往往比高分更能打动面试官。\n\n今天我们就来聊聊如何做好社会实践。这堂课会从实践类型、找机会的方法、技能培养、成果转化和深层意义五个方面展开。准备好了吗？"
    }
  },
  // Step 2: Ready check
  {
    type: "command",
    payload: {
      name: "present_choices",
      args: {
        options: ["准备好了", "还没准备好"]
      }
    }
  },
  // Step 3: Types of social practice
  {
    type: "speech",
    payload: {
      text: "好，我们先来看第一个板块——社会实践的类型。\n\n社会实践的形式非常多样，我给大家介绍几种最常见的。每种类型都有不同的特点和适合的人群。"
    }
  },
  // Step 4: Volunteer service
  {
    type: "speech",
    payload: {
      text: "第一种：志愿服务。\n\n包括社区服务、大型活动志愿者、支教、环保活动等。志愿服务的特点是：门槛低、灵活度高、能直接感受到帮助他人的成就感。\n\n推荐渠道：学校青年志愿者协会、中国青年志愿者网、当地公益组织。\n\n志愿服务不仅能积累社会经验，还能培养同理心和社会责任感。很多同学通过志愿服务找到了自己的人生方向。\n\n比如有的同学去山区支教后，决定将来从事教育事业；有的同学参与环保活动后，选择了环境科学作为研究方向。"
    }
  },
  // Step 5: Social research
  {
    type: "speech",
    payload: {
      text: "第二种：社会调研。\n\n社会调研是指针对某个社会问题或现象进行实地调查和研究。比如乡村振兴调研、城市流动人口调查、大学生就业意向调查等。\n\n社会调研的流程：确定选题→设计问卷→实地调研→数据分析→撰写报告。\n\n这类实践特别适合想锻炼研究能力的同学，也是很多竞赛的常见形式。\n\n做社会调研时要注意：问卷设计要科学，样本量要足够大，数据分析要客观。一份高质量的社会调研报告，甚至可以发表在学术期刊上。"
    }
  },
  // Step 6: Corporate internship
  {
    type: "speech",
    payload: {
      text: "第三种：企业实习。\n\n实习是了解职场、积累工作经验的最佳途径。实习分为短期实习（寒暑假）和长期实习（学期中兼职）。\n\n找实习的渠道：\n1. 学校就业指导中心——很多合作企业会通过学校发布实习信息\n2. 实习僧、牛客网等招聘平台——专门面向大学生的实习平台\n3. 学长学姐内推——内推的成功率远高于海投\n4. 企业官网招聘信息——关注心仪企业的招聘页面\n\n建议大二开始尝试实习，从中小公司开始积累经验。不要一上来就非大厂不去，小公司能让你接触更多方面的工作，成长更快。"
    }
  },
  // Step 7: Summer programs
  {
    type: "speech",
    payload: {
      text: "第四种：暑期专项实践。\n\n很多学校在暑期会组织专项实践活动，比如：\n\n1. 暑期支教——去偏远地区学校支教，一般持续2-4周。\n\n2. 乡村振兴实践——深入乡村调研和帮扶，了解中国农村的真实面貌。\n\n3. 红色研学——参观革命老区，学习红色文化，传承革命精神。\n\n4. 企业走访——参观知名企业，了解行业前沿，和企业HR面对面交流。\n\n这些活动通常由学校组织，有指导老师带队，是很好的实践入门选择。而且很多暑期实践项目是免费的，学校还会提供一定的经费支持。"
    }
  },
  // Step 8: Question about practice types
  {
    type: "speech",
    payload: {
      text: "考考大家。以下哪项不属于社会实践的范畴？"
    }
  },
  // Step 9: Choices
  {
    type: "command",
    payload: {
      name: "present_choices",
      args: {
        options: [
          "暑期支教",
          "企业实习",
          "在宿舍打游戏",
          "社会调研"
        ],
        correctAnswer: "在宿舍打游戏"
      }
    }
  },
  // Step 10a: Correct
  {
    type: "speech",
    payload: { text: "哈哈，没错！在宿舍打游戏可不算社会实践。社会实践是要走出校园、接触社会的。" }
  },
  // Step 10b: Incorrect
  {
    type: "speech",
    payload: { text: "这个答案不太对哦。暑期支教、企业实习、社会调研都是典型的社会实践形式。在宿舍打游戏可不算哦。" }
  },
  // Step 11: Finding opportunities
  {
    type: "speech",
    payload: {
      text: "接下来聊聊第二个板块——如何找到好的实践机会。\n\n很多同学说：我想参加社会实践，但不知道从哪里找。其实机会比你想象的要多，关键是要主动。"
    }
  },
  // Step 12: School platforms
  {
    type: "speech",
    payload: {
      text: "渠道一：学校平台。\n\n学校是最重要的实践资源来源：\n\n1. 关注学校团委和学生会公众号——大部分实践活动都会通过公众号发布。\n\n2. 留意学院发布的通知——学院的通知栏、班级群都是信息源。\n\n3. 参加校园招聘会和宣讲会——不仅能了解企业，还能直接投递简历。\n\n4. 咨询辅导员和专业课老师——老师手上往往有很多实践资源。\n\n很多优质实践机会只在校园内发布，所以一定要主动关注。不要等着机会来找你，要主动去找机会。"
    }
  },
  // Step 13: Social organizations
  {
    type: "speech",
    payload: {
      text: "渠道二：社会组织和企业。\n\n1. 公益组织——壹基金、中国扶贫基金会等都有志愿者项目，可以在官网上报名。\n\n2. 企业社会责任项目——很多大公司有面向大学生的实践项目，比如腾讯的「犀牛鸟」计划。\n\n3. 政府项目——比如团中央的「三下乡」社会实践，每年暑期都有。\n\n4. 线上平台——志愿中国、到梦空间等平台汇集了大量实践项目。\n\n这些渠道的信息需要你主动搜索和筛选。建议每周花半小时浏览一下这些平台，看到合适的就果断报名。"
    }
  },
  // Step 14: Self-initiated projects
  {
    type: "speech",
    payload: {
      text: "渠道三：自主策划。\n\n如果你找不到满意的实践项目，完全可以自己策划！\n\n比如：\n1. 发现社区问题，组织同学一起解决——比如社区垃圾分类宣传。\n\n2. 针对某个社会现象，自主开展调研——比如大学生消费习惯调查。\n\n3. 联系校友企业，自主联系实习——主动发邮件给校友企业，成功率很高。\n\n4. 组建团队参加公益创业大赛——把社会实践和创业结合起来。\n\n自主策划的实践经历，往往更能体现你的主动性和创造力。在面试时，面试官会对你自主策划的项目特别感兴趣。"
    }
  },
  // Step 15: Skills development
  {
    type: "speech",
    payload: {
      text: "第三个板块——实践中的技能培养。\n\n参加社会实践不只是为了拿证书，更重要的是培养能力。这些能力在课堂上学不到，但在实践中能快速提升。"
    }
  },
  // Step 16: Communication skills
  {
    type: "speech",
    payload: {
      text: "能力一：沟通能力。\n\n在社会实践中，你需要和不同的人打交道——受访者、同事、领导、服务对象。这能极大地锻炼你的沟通能力。\n\n提升沟通技巧的小建议：\n\n1. 学会倾听——先理解对方，再表达自己。很多人只顾着说，忘了听。\n\n2. 注意表达方式——根据对象调整语言。和教授说话是一种方式，和村民说话是另一种方式。\n\n3. 保持礼貌和尊重——这是沟通的基础。无论对方是什么身份，都要尊重。\n\n4. 学会提问——好的问题能打开话匣子。不要问「是或否」的问题，要问「为什么」和「怎么样」的问题。"
    }
  },
  // Step 17: Organization skills
  {
    type: "speech",
    payload: {
      text: "能力二：组织协调能力。\n\n社会实践往往需要团队合作。你需要学会：\n\n1. 任务分解——把大目标拆成小任务。比如一次调研活动，可以拆成问卷设计、实地走访、数据录入、报告撰写等。\n\n2. 分工协作——根据每个人的特长分配工作。有人擅长沟通，就负责访谈；有人擅长数据分析，就负责处理数据。\n\n3. 进度管理——按时完成各阶段任务。可以用甘特图或项目管理工具来跟踪进度。\n\n4. 应急处理——遇到突发情况能灵活应对。比如受访者临时取消，要有备选方案。\n\n这些能力在未来的工作中非常重要。"
    }
  },
  // Step 18: Problem-solving
  {
    type: "speech",
    payload: {
      text: "能力三：问题解决能力。\n\n实践中一定会遇到各种预料之外的问题——问卷回收率低、受访者不配合、经费不足……\n\n面对问题时，记住四步法：\n\n1. 明确问题——到底是什么问题。很多时候我们焦虑是因为问题不清晰。\n\n2. 分析原因——为什么会出现这个问题。找到根本原因，而不是表面原因。\n\n3. 提出方案——有哪些解决办法。至少想出三个方案，然后评估优劣。\n\n4. 执行调整——选择最佳方案并执行。执行过程中根据反馈不断调整。\n\n解决问题的能力，是面试官最看重的素质之一。"
    }
  },
  // Step 19: Draw practice skills
  {
    type: "command",
    payload: {
      name: "draw",
      args: {
        operations: [
          { type: 'background', color: 'black' },
          { type: 'text', text: '社会实践核心能力', x: 20, y: 5, fontSize: 28, color: '#FFD700' },
          { type: 'text', text: '沟通能力', x: 10, y: 28, fontSize: 22, color: '#44FF44' },
          { type: 'text', text: '倾听 表达 提问', x: 10, y: 42, fontSize: 16, color: '#88FF88' },
          { type: 'text', text: '组织协调', x: 55, y: 28, fontSize: 22, color: '#44AAFF' },
          { type: 'text', text: '分工 进度 应急', x: 55, y: 42, fontSize: 16, color: '#88CCFF' },
          { type: 'text', text: '问题解决', x: 10, y: 60, fontSize: 22, color: '#FFAA44' },
          { type: 'text', text: '分析 方案 执行', x: 10, y: 74, fontSize: 16, color: '#FFCC88' },
          { type: 'text', text: '适应能力', x: 55, y: 60, fontSize: 22, color: '#FF44FF' },
          { type: 'text', text: '灵活 抗压 学习', x: 55, y: 74, fontSize: 16, color: '#FF88FF' },
        ]
      }
    }
  },
  // Step 20: Explain drawing
  {
    type: "speech",
    payload: { text: "看，社会实践能培养四大核心能力：沟通能力、组织协调能力、问题解决能力和适应能力。这些能力在课堂上学不到，但在实践中能快速提升。" }
  },
  // Step 21: Clear blackboard
  {
    type: "command",
    payload: {
      name: "draw",
      args: {
        operations: [
          { type: 'clear' },
          { type: 'background', color: 'transparent' }
        ]
      }
    }
  },
  // Step 22: Question about skills
  {
    type: "speech",
    payload: {
      text: "考考大家。在社会实践中，遇到突发问题应该怎么做？"
    }
  },
  // Step 23: Choices
  {
    type: "command",
    payload: {
      name: "present_choices",
      args: {
        options: [
          "直接放弃",
          "等别人来解决",
          "分析问题并寻找解决方案",
          "假装没看见"
        ],
        correctAnswer: "分析问题并寻找解决方案"
      }
    }
  },
  // Step 24a: Correct
  {
    type: "speech",
    payload: { text: "没错！遇到问题要主动分析并寻找解决方案，这是实践中最能锻炼人的地方。" }
  },
  // Step 24b: Incorrect
  {
    type: "speech",
    payload: { text: "这个做法不太对哦。遇到问题应该主动分析并寻找解决方案，这才是实践的意义所在。" }
  },
  // Step 25: Results transformation
  {
    type: "speech",
    payload: {
      text: "第四个板块——实践成果的总结与转化。\n\n辛辛苦苦做了实践，如何让这段经历发挥最大价值？很多同学做完实践就完了，没有好好总结，非常可惜。"
    }
  },
  // Step 26: Practice report
  {
    type: "speech",
    payload: {
      text: "实践报告撰写。\n\n实践结束后，一定要写一份高质量的实践报告。报告应该包括：\n\n1. 实践背景和目的——为什么要做这个实践。\n\n2. 实践过程——做了什么、怎么做的。要写得具体，有细节。\n\n3. 实践成果——取得了什么数据和发现。用数据说话。\n\n4. 反思与感悟——你学到了什么。这是报告中最有价值的部分。\n\n5. 建议与展望——对未来的思考。如果能提出建设性的建议，报告的质量会更高。\n\n好的实践报告不仅是作业，更是你简历上的亮点素材。"
    }
  },
  // Step 27: Results display
  {
    type: "speech",
    payload: {
      text: "成果展示。\n\n实践成果可以通过多种形式展示：\n\n1. 实践报告——提交给学校或用于评优。\n\n2. 答辩展示——参加社会实践评比，用PPT展示你的实践成果。\n\n3. 媒体报道——联系校内外媒体宣传。好的实践项目会被媒体报道，这对你个人也是很好的背书。\n\n4. 短视频/Vlog——用新媒体记录实践过程。现在短视频平台很火，好的实践Vlog能获得大量关注。\n\n5. 学术论文——如果实践有深度，可以写成论文发表。\n\n展示的过程也是二次学习的过程。"
    }
  },
  // Step 28: Resume optimization
  {
    type: "speech",
    payload: {
      text: "简历优化。\n\n如何把实践经历写进简历？记住STAR法则：\n\nS（Situation）——在什么背景下\nT（Task）——你的任务是什么\nA（Action）——你采取了什么行动\nR（Result）——取得了什么结果\n\n例如：\n「在乡村振兴调研中（S），我负责问卷设计和数据分析（T），通过线上线下结合的方式收集了500份有效问卷（A），最终报告被当地政府采纳（R）」\n\n这样的描述比「参加了社会实践」有力得多。建议把每段实践经历都用STAR法则写一遍。"
    }
  },
  // Step 29: Deep meaning
  {
    type: "speech",
    payload: {
      text: "最后一个板块——社会实践的深层意义。\n\n社会实践的意义远不止于简历上的一行字。\n\n第一，培养社会责任感。当你真正走进社区、走进乡村、走进弱势群体，你会对社会有更深刻的理解，会更有责任感。\n\n第二，促进自我认知。在实践中，你会发现自己的优势和不足，会更清楚自己适合什么、喜欢什么。\n\n第三，探索职业方向。通过实习和调研，你可以提前了解不同行业的工作内容，帮助你做出更明智的职业选择。\n\n第四，建立人脉资源。在实践中认识的人——导师、同事、服务对象，都可能成为你未来的人脉资源。"
    }
  },
  // Step 30: Final question
  {
    type: "speech",
    payload: {
      text: "最后一个问题。写简历时，描述实践经历应该用什么方法？"
    }
  },
  // Step 31: Choices
  {
    type: "command",
    payload: {
      name: "present_choices",
      args: {
        options: [
          "随便写几句",
          "STAR法则",
          "越详细越好",
          "只写结果"
        ],
        correctAnswer: "STAR法则"
      }
    }
  },
  // Step 32a: Correct
  {
    type: "speech",
    payload: { text: "没错！STAR法则是描述实践经历最有效的方法，能让面试官快速了解你的贡献和能力。" }
  },
  // Step 32b: Incorrect
  {
    type: "speech",
    payload: { text: "这个做法不太对哦。描述实践经历最有效的方法是STAR法则——背景、任务、行动、结果，这样写最有说服力。" }
  },
  // Step 33: Summary
  {
    type: "speech",
    payload: {
      text: "好了，我们来总结一下今天的内容：\n\n社会实践的四种类型：志愿服务、社会调研、企业实习、暑期专项实践。\n\n找实践机会的三个渠道：学校平台、社会组织、自主策划。\n\n实践中培养的四大能力：沟通能力、组织协调、问题解决、适应能力。\n\n成果转化的三个步骤：写报告、做展示、优化简历。\n\n深层意义：培养社会责任感、促进自我认知、探索职业方向、建立人脉资源。\n\n最后送大家一句话：走出舒适区，去接触真实的世界。社会实践不仅让你成长，更让你发现自己的价值和方向。"
    }
  },
  // Step 34: Complete Lesson
  {
    type: "command",
    payload: { name: "complete_lesson", args: {} }
  },
  // Step 35: Start Q&A
  {
    type: "command",
    payload: { name: "start_qa", args: {} }
  }
];
