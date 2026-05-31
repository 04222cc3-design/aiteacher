import type { AIAction } from '../types';

export const lessonSummary = `
这堂课的主题是专业能力，帮助大学生提升专业素养和职场竞争力。
核心观点包括：
1. 专业能力的内涵：硬技能与软技能、专业素养的构成要素。
2. 硬技能提升：专业知识学习、实践技能训练、证书考取、项目经验积累。
3. 软技能培养：沟通表达、团队协作、时间管理、领导力、批判性思维。
4. 学习资源与方法：在线课程、书籍推荐、学习社区、刻意练习。
5. 能力展示：如何在学习、竞赛、实习中展示专业能力，打造个人品牌。
`;

export const lessonScript: AIAction[] = [
  // Step 0: Show PDF
  {
    type: "command",
    payload: {
      name: "show_pdf",
      args: {
        url: "https://soxpkytjeqygryertwoe.supabase.co/storage/v1/object/public/lesson_materials/public/1778326149094-zhuanyenengli.pdf",
        page: 1
      }
    }
  },
  // Step 1: Introduction

  {
    type: "speech",
    payload: {
      text: "同学们好！欢迎来到《专业能力》课堂。\n\n在大学里，什么最重要？有人说是成绩，有人说是人脉，有人说是经历。但归根结底，最重要的是你的专业能力。\n\n专业能力是你安身立命的根本，是你未来职业发展的基石。无论你将来是考研、就业还是创业，专业能力都是你最核心的竞争力。\n\n今天这堂课，我会从专业能力的内涵、硬技能提升、软技能培养、学习资源与方法、能力展示五个方面，帮你全面提升专业素养。准备好了吗？"
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
  // Step 3: What is professional ability
  {
    type: "speech",
    payload: {
      text: "好，我们先来聊聊第一个板块——专业能力的内涵。\n\n专业能力不只是你会什么知识，而是你能解决什么问题。它由两部分组成：硬技能和软技能。"
    }
  },
  // Step 4: Hard skills vs soft skills
  {
    type: "speech",
    payload: {
      text: "硬技能 vs 软技能。\n\n硬技能是你可以写在简历上的具体技能——编程、外语、数据分析、会计、设计……这些技能可以通过学习和训练获得，也容易衡量。\n\n软技能是你看不见但能感受到的能力——沟通能力、团队协作、时间管理、领导力、批判性思维……这些能力决定了你能在职业道路上走多远。\n\n打个比方：硬技能是你的武器，软技能是你使用武器的能力。只有武器没有技巧，你发挥不出武器的威力；只有技巧没有武器，你空有一身本事却无处施展。\n\n所以，两者缺一不可。"
    }
  },
  // Step 5: Hard skills improvement
  {
    type: "speech",
    payload: {
      text: "接下来聊聊第二个板块——硬技能提升。\n\n硬技能是专业能力的基础。没有扎实的硬技能，其他都是空谈。"
    }
  },
  // Step 6: Professional knowledge
  {
    type: "speech",
    payload: {
      text: "专业知识学习。\n\n课堂学习是获取专业知识的主要途径。但仅仅听课是不够的，你需要做到：\n\n1. 课前预习——带着问题去听课。预习10分钟，听课效率提升50%。\n\n2. 课后复习——当天内容当天消化。不要等到考试前才复习。\n\n3. 拓展阅读——不局限于教材，阅读相关书籍和论文。教材只是入门，真正的专业知识在教材之外。\n\n4. 建立知识体系——用思维导图把知识点串联起来。零散的知识点容易遗忘，体系化的知识才真正属于你。\n\n5. 学以致用——把学到的知识应用到实际中。比如学了编程就写个小程序，学了统计就分析一组数据。"
    }
  },
  // Step 7: Practical skills
  {
    type: "speech",
    payload: {
      text: "实践技能训练。\n\n纸上得来终觉浅，绝知此事要躬行。实践是提升硬技能最有效的方式。\n\n1. 课程项目——认真对待每门课的课程设计和大作业。这些项目就是你作品集的基础。\n\n2. 实验室/工作室——加入老师的实验室或工作室，参与实际项目。\n\n3. 开源项目——参与GitHub上的开源项目，学习优秀代码。\n\n4. 个人项目——自己发起一个小项目，从0到1完成。比如做一个个人网站、开发一个小程序。\n\n5. 实习——在企业真实环境中锻炼。实习是提升实践能力最快的方式。\n\n记住：做十个课程作业，不如做一个完整的项目。"
    }
  },
  // Step 8: Certificates
  {
    type: "speech",
    payload: {
      text: "证书考取。\n\n证书是硬技能的证明。但不是所有证书都有价值，要考就考含金量高的。\n\n推荐考取的证书：\n\n1. 英语类——大学英语四六级（CET-4/6）、托福/雅思（出国必备）。\n\n2. 计算机类——计算机等级考试、思科认证（网络方向）、华为认证。\n\n3. 专业类——注册会计师（CPA）、法律职业资格证、建造师、教师资格证。\n\n4. 技能类——数据分析师、项目管理（PMP）、产品经理认证。\n\n考证书的原则：先了解行业需求，再决定考什么。不要盲目考证，考一堆没用的证书只会浪费时间和金钱。"
    }
  },
  // Step 9: Project experience
  {
    type: "speech",
    payload: {
      text: "项目经验积累。\n\n项目经验是硬技能的最好证明。如何积累高质量的项目经验？\n\n1. 从课程项目开始——把课程设计做成完整的项目。\n\n2. 参加竞赛——竞赛项目往往有明确的目标和时间限制，能快速提升能力。\n\n3. 找实习——企业项目是最真实、最有价值的项目经验。\n\n4. 做开源贡献——参与开源项目，你的代码会被很多人review，进步很快。\n\n5. 接外包——在确保不影响学业的前提下，接一些小项目练手。\n\n每个项目结束后，都要做复盘：学到了什么？遇到了什么问题？下次怎么改进？"
    }
  },
  // Step 10: Question about hard skills
  {
    type: "speech",
    payload: {
      text: "考考大家。以下哪种方式最能提升硬技能？"
    }
  },
  // Step 11: Choices
  {
    type: "command",
    payload: {
      name: "present_choices",
      args: {
        options: [
          "只看书不实践",
          "边学边做项目",
          "只听课不复习",
          "考前突击"
        ],
        correctAnswer: "边学边做项目"
      }
    }
  },
  // Step 12a: Correct
  {
    type: "speech",
    payload: { text: "没错！边学边做项目是提升硬技能最有效的方式。理论和实践结合，才能把知识转化为能力。" }
  },
  // Step 12b: Incorrect
  {
    type: "speech",
    payload: { text: "这个做法效率不高哦。边学边做项目才是提升硬技能最有效的方式。理论和实践结合，才能把知识转化为能力。" }
  },
  // Step 13: Soft skills
  {
    type: "speech",
    payload: {
      text: "第三个板块——软技能培养。\n\n如果说硬技能决定你能不能进入一个行业，那软技能就决定你能在这个行业走多远。"
    }
  },
  // Step 14: Communication
  {
    type: "speech",
    payload: {
      text: "沟通表达能力。\n\n沟通能力是职场中最基本的软技能。如何提升？\n\n1. 多发言——在课堂讨论、小组汇报中主动发言。不要怕说错，说错了才能进步。\n\n2. 结构化表达——用「结论先行」的方式说话。先说结论，再说理由，最后总结。\n\n3. 学会写文档——技术文档、项目报告、邮件。写作能力在职场中非常重要。\n\n4. 练习演讲——参加演讲比赛或辩论赛。演讲能力是沟通能力的最高形式。\n\n5. 学会倾听——好的沟通者首先是好的倾听者。不要急着表达自己，先理解别人。"
    }
  },
  // Step 15: Teamwork
  {
    type: "speech",
    payload: {
      text: "团队协作能力。\n\n现代社会几乎没有一个人能完成的工作。团队协作能力至关重要。\n\n提升团队协作能力的方法：\n\n1. 多参加团队项目——课程小组、竞赛团队、社团活动。\n\n2. 学会承担责任——在团队中主动承担任务，不要推诿。\n\n3. 学会妥协——不是所有事情都要按你的想法来。团队合作需要互相理解。\n\n4. 学会反馈——给队友建设性的反馈，也虚心接受别人的反馈。\n\n5. 使用协作工具——Git、Trello、飞书、钉钉。熟练使用这些工具能提高团队效率。\n\n记住：团队中最重要的不是谁最聪明，而是谁能让大家一起把事情做成。"
    }
  },
  // Step 16: Time management
  {
    type: "speech",
    payload: {
      text: "时间管理能力。\n\n大学生活自由度高，时间管理能力直接影响你的学习效率和生活质量。\n\n推荐使用「四象限法则」：\n\n第一象限：重要且紧急——马上做。比如明天要交的作业。\n\n第二象限：重要不紧急——计划做。比如复习、锻炼、学习新技能。这是最应该花时间的象限。\n\n第三象限：紧急不重要——委托做。比如取快递、回消息。\n\n第四象限：不重要不紧急——少做或不做。比如刷短视频、打游戏。\n\n很多同学把大量时间花在第一象限和第四象限，忽略了第二象限。但真正决定你未来的，是第二象限的事情。"
    }
  },
  // Step 17: Draw time management
  {
    type: "command",
    payload: {
      name: "draw",
      args: {
        operations: [
          { type: 'background', color: 'black' },
          { type: 'text', text: '四象限时间管理法', x: 20, y: 5, fontSize: 28, color: '#FFD700' },
          { type: 'rect', x: 5, y: 20, width: 42, height: 35, color: '#FF4444' },
          { type: 'text', text: '重要且紧急', x: 8, y: 25, fontSize: 18, color: '#FFFFFF' },
          { type: 'text', text: '马上做', x: 12, y: 40, fontSize: 16, color: '#FF8888' },
          { type: 'rect', x: 52, y: 20, width: 42, height: 35, color: '#44AA44' },
          { type: 'text', text: '重要不紧急', x: 55, y: 25, fontSize: 18, color: '#FFFFFF' },
          { type: 'text', text: '计划做', x: 60, y: 40, fontSize: 16, color: '#88FF88' },
          { type: 'rect', x: 5, y: 58, width: 42, height: 35, color: '#AAAA44' },
          { type: 'text', text: '紧急不重要', x: 8, y: 63, fontSize: 18, color: '#FFFFFF' },
          { type: 'text', text: '委托做', x: 12, y: 78, fontSize: 16, color: '#FFFF88' },
          { type: 'rect', x: 52, y: 58, width: 42, height: 35, color: '#666666' },
          { type: 'text', text: '不紧急不重要', x: 55, y: 63, fontSize: 18, color: '#FFFFFF' },
          { type: 'text', text: '少做或不做', x: 56, y: 78, fontSize: 16, color: '#AAAAAA' },
        ]
      }
    }
  },
  // Step 18: Explain drawing
  {
    type: "speech",
    payload: { text: "看，这就是四象限时间管理法。红色区域是重要且紧急的事，要马上做。绿色区域是重要不紧急的事，要计划做——这是最值得投入时间的区域。黄色区域是紧急不重要的事，可以委托别人做。灰色区域是不重要不紧急的事，要少做或不做。" }
  },
  // Step 19: Clear blackboard
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
  // Step 20: Critical thinking
  {
    type: "speech",
    payload: {
      text: "批判性思维能力。\n\n批判性思维是最高层次的软技能之一。它让你能够独立思考，不盲从、不轻信。\n\n培养批判性思维的方法：\n\n1. 多问「为什么」——不要接受表面答案，追问背后的逻辑。\n\n2. 多角度思考——从不同立场看问题。比如一个政策，从政府、企业、个人三个角度看，结论可能完全不同。\n\n3. 区分事实和观点——事实是可以验证的，观点是主观的。不要混淆两者。\n\n4. 识别逻辑谬误——比如「大家都这么做」不是理由，「你不懂」也不是理由。\n\n5. 写反思日记——每天花10分钟反思自己的决策和思考过程。\n\n批判性思维不是天生的，而是训练出来的。"
    }
  },
  // Step 21: Learning resources
  {
    type: "speech",
    payload: {
      text: "第四个板块——学习资源与方法。\n\n在信息时代，学习资源非常丰富。关键是你会不会用。"
    }
  },
  // Step 22: Online courses
  {
    type: "speech",
    payload: {
      text: "在线课程推荐。\n\n1. 中国大学MOOC——国内最全的大学课程平台，免费且质量高。\n\n2. Coursera——国际名校课程，有中文字幕。\n\n3. edX——MIT、哈佛等名校课程，含金量高。\n\n4. B站——你没看错，B站上有大量优质的学习资源。很多UP主做的教程比付费课程还好。\n\n5. 得到/知乎——碎片化学习，适合通勤时间。\n\n选课建议：先看课程大纲和评价，再决定是否学习。不要收藏一堆课程却不看。"
    }
  },
  // Step 23: Books
  {
    type: "speech",
    payload: {
      text: "书籍推荐。\n\n除了专业教材，以下几类书籍对提升专业能力很有帮助：\n\n1. 思维类——《思考，快与慢》《原则》《穷查理宝典》。这些书教你如何思考。\n\n2. 学习方法类——《如何阅读一本书》《学习之道》《刻意练习》。这些书教你如何学习。\n\n3. 行业经典——每个行业都有必读经典，比如计算机的《代码大全》、设计的《设计心理学》。\n\n4. 传记类——《史蒂夫·乔布斯传》《 Elon Musk 》。从成功人士的经历中学习。\n\n建议每月至少读一本书，并写读书笔记。"
    }
  },
  // Step 24: Deliberate practice
  {
    type: "speech",
    payload: {
      text: "刻意练习。\n\n刻意练习是提升技能最有效的方法。它的核心要素：\n\n1. 明确目标——每次练习都有具体目标。比如「今天要掌握二分查找算法」。\n\n2. 专注——全神贯注地练习，不要分心。\n\n3. 反馈——及时获得反馈，知道哪里做错了。可以找老师、同学或使用自动评测工具。\n\n4. 走出舒适区——做那些你不太会但努力一下能完成的事。\n\n5. 重复——大量重复，直到形成肌肉记忆。\n\n一万小时定律不是简单的重复，而是刻意练习。"
    }
  },
  // Step 25: Question about learning
  {
    type: "speech",
    payload: {
      text: "考考大家。刻意练习的核心要素不包括以下哪项？"
    }
  },
  // Step 26: Choices
  {
    type: "command",
    payload: {
      name: "present_choices",
      args: {
        options: [
          "明确目标",
          "专注和反馈",
          "走出舒适区",
          "轻松随意"
        ],
        correctAnswer: "轻松随意"
      }
    }
  },
  // Step 27a: Correct
  {
    type: "speech",
    payload: { text: "没错！刻意练习需要明确目标、专注、反馈和走出舒适区，轻松随意可不行。" }
  },
  // Step 27b: Incorrect
  {
    type: "speech",
    payload: { text: "这个答案不太对哦。刻意练习需要明确目标、专注、反馈和走出舒适区，轻松随意是练不出真本事的。" }
  },
  // Step 28: Ability display
  {
    type: "speech",
    payload: {
      text: "最后一个板块——能力展示。\n\n有能力还要会展示。在竞争激烈的环境中，展示能力的能力本身就是一种能力。"
    }
  },
  // Step 29: Personal brand
  {
    type: "speech",
    payload: {
      text: "打造个人品牌。\n\n个人品牌就是别人提到你时，第一时间想到的关键词。\n\n如何打造个人品牌？\n\n1. 找到你的标签——你最擅长什么？比如「数据分析达人」「Python高手」「设计大神」。\n\n2. 持续输出——写博客、做视频、分享知识。输出是最好的输入。\n\n3. 建立作品集——把做过的项目整理成作品集。GitHub、个人网站、Behance都是很好的平台。\n\n4. 参加行业活动——技术沙龙、行业会议、线上分享。\n\n5. 维护专业形象——社交媒体上的言论要专业。面试官会看你的社交媒体。\n\n一个好的个人品牌，能让机会主动来找你。"
    }
  },
  // Step 30: Portfolio
  {
    type: "speech",
    payload: {
      text: "作品集建设。\n\n作品集是展示能力最直接的方式。\n\n1. 选择代表性项目——质量大于数量。选3-5个最能体现你能力的项目。\n\n2. 展示过程——不只是展示结果，还要展示你的思考过程、遇到的问题和解决方案。\n\n3. 量化成果——用数据说话。比如「优化后页面加载速度提升了40%」。\n\n4. 持续更新——定期添加新项目，淘汰旧项目。\n\n5. 多平台展示——GitHub（代码）、个人网站（综合）、LinkedIn（职业）。\n\n一个优秀的作品集，胜过十份华丽的简历。"
    }
  },
  // Step 31: Final question
  {
    type: "speech",
    payload: {
      text: "最后一个问题。以下哪个是打造个人品牌最有效的方式？"
    }
  },
  // Step 32: Choices
  {
    type: "command",
    payload: {
      name: "present_choices",
      args: {
        options: [
          "什么都不做",
          "持续输出有价值的内容",
          "只做不说",
          "抄袭别人的作品"
        ],
        correctAnswer: "持续输出有价值的内容"
      }
    }
  },
  // Step 33a: Correct
  {
    type: "speech",
    payload: { text: "没错！持续输出有价值的内容是打造个人品牌最有效的方式。写博客、做项目、分享知识，让别人看到你的能力。" }
  },
  // Step 33b: Incorrect
  {
    type: "speech",
    payload: { text: "这个想法不太对哦。持续输出有价值的内容才是打造个人品牌最有效的方式。让别人看到你的能力，机会才会来找你。" }
  },
  // Step 34: Summary
  {
    type: "speech",
    payload: {
      text: "好了，我们来总结一下今天的内容：\n\n专业能力 = 硬技能 + 软技能。硬技能是武器，软技能是使用武器的能力。\n\n硬技能提升四途径：学知识、练实践、考证书、做项目。\n\n软技能培养四方面：沟通表达、团队协作、时间管理、批判性思维。\n\n学习资源：在线课程、经典书籍、刻意练习。\n\n能力展示：打造个人品牌、建设作品集、持续输出。\n\n最后送大家一句话：专业能力不是天生的，而是日积月累的结果。从今天开始，每天进步一点点，四年后你会感谢现在努力的自己！"
    }
  },
  // Step 35: Complete Lesson
  {
    type: "command",
    payload: { name: "complete_lesson", args: {} }
  },
  // Step 36: Start Q&A
  {
    type: "command",
    payload: { name: "start_qa", args: {} }
  }
];
