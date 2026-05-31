import type { AIAction } from '../types';

export const lessonSummary = `
这堂课的主题是提升学习效率和培养工程实践能力。
核心观点包括：
1. 学习效率：强调了“优先级管理”的重要性，应该先做最重要、最紧急的任务。介绍了两种具体方法：“番茄工作法”（专注25分钟，休息5分钟）和“主动学习”（先尝试后总结，而非被动听讲）。
2. 工程实践：通过一个机器人竞赛的案例，说明了实践的重要性。这位同学虽然考试成绩好，但缺乏动手能力。通过加入团队项目，在不断尝试和失败中，他最终掌握了实际技能并获得了奖项。结论是，培养工程实践能力最关键的是“多参加项目和团队合作”。
`;

export const lessonScript: AIAction[] = [
  // Step 1: Show PDF
  {
    type: "command",
    payload: {
      name: "show_pdf",
      args: {
        url: "https://soxpkytjeqygryertwoe.supabase.co/storage/v1/object/public/lesson_materials/public/1778325397374-gongchengshijian.pdf",

        page: 1
      }
    }
  },
  // Step 2: Introduction Speech
  {
    type: "speech",
    payload: {
      // FIX: Corrected a syntax error. The property key 'text' was incorrectly formatted.
      text: "大家好！欢迎来到我们的课堂。今天，我们将探讨一个对你们未来学习和成长都非常重要的话题——如何提升学习效率，以及如何培养工程实践能力。\n\n你们有没有发现，有些同学似乎总能很快掌握知识，还能把理论应用到实际项目中，而有些同学虽然努力，却总感觉效率不高，实践能力不足？\n\n今天，我们不仅会分享一些高效学习的方法，还会结合工程实践的案例，帮助大家真正做到学以致用。\n\n大家准备好开始了吗？"
    }
  },
  // Step 3: Present Ready Choices
  {
    type: "command",
    payload: {
      name: "present_choices",
      args: {
        options: ["准备好了", "还没"]
      }
    }
  },
  // Step 4: Learning Efficiency Question Speech
  {
    type: "speech",
    payload: {
      // FIX: Corrected a syntax error. The property key 'text' was incorrectly formatted.
      text: "假设明天你有三门课的作业要完成：数学题 20 道、写一篇 1000 字的小论文，还要准备一次小组展示。你会怎么安排？"
    }
  },
  // Step 5: Go to Page 2
  {
    type: "command",
    payload: {
      name: "goto_page",
      args: { "page": 2 }
    }
  },
  // Step 6: Present Scheduling Choices
  {
    type: "command",
    payload: {
      name: "present_choices",
      args: {
        options: ["先做自己喜欢的任务", "从最容易的开始", "先做最重要、最紧急的", "随机挑一个做"],
        correctAnswer: "先做最重要、最紧急的"
      }
    }
  },
  // Step 7a: Correct Choice Feedback
  {
    type: "speech",
    payload: { "text": "非常好！这就是高效学习中非常核心的 优先级管理 原则。既然优先级这么重要，那我们就来看一看常见的学习效率方法。" }
  },
  // Step 7b: Incorrect Choice Feedback
  {
    type: "speech",
    payload: { "text": "别担心，很多同学会犯类似的错误。其实核心在于分清楚任务的 轻重缓急，先解决影响最大的任务，效率就会大幅提升。既然优先级这么重要，那我们就来看一看常见的学习效率方法。" }
  },
  // Step 8: Go to Page 3
  {
    type: "command",
    payload: {
      name: "goto_page",
      args: { "page": 3 }
    }
  },
  // Step 9: Speech about Methods
  {
    type: "speech",
    payload: {
      // FIX: Corrected a syntax error. The property key 'text' was incorrectly formatted.
      text: "一种常见的方法是‘番茄工作法’，25 分钟专注学习，5 分钟休息，这样能让大脑保持清醒。另一种是‘主动学习’，比如先尝试解题或写一小段程序，再回头查资料修正，比单纯看书记笔记更有效。\n\n你更习惯哪种学习方式？"
    }
  },
  // Step 10: Present Method Choices
  {
    type: "command",
    payload: {
      name: "present_choices",
      args: {
        options: ["先听懂再练习", "先尝试再总结", "一边练习一边总结"],
        correctAnswer: "先尝试再总结" // or "一边练习一边总结" - we'll handle this in the app
      }
    }
  },
  // Step 11a: Better Choice Feedback
  {
    type: "speech",
    payload: { "text": "很好！这是更高效的方式。通过实践驱动理解，你会记得更牢。" }
  },
  // Step 11b: Common Choice Feedback
  {
    type: "speech",
    payload: { "text": "这是很多同学常用的方法，但可能效率不高。试着先动手尝试，再去查资料，你会发现收获更大。" }
  },
  // Step 12: Introduce drawing
  {
    type: "speech",
    payload: { text: "很好！主动学习能加深理解。我们来举个例子，比如在统计学中，我们学习正态分布。与其只看定义，不如我们亲手把它画出来。" }
  },
  // Step 13: Draw on blackboard
  {
    type: "command",
    payload: {
      name: "draw",
      args: {
        operations: [
          { type: 'background', color: 'black' },
          { type: 'text', text: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}(\\frac{x-\\mu}{\\sigma})^2}', x: 50, y: 30, fontSize: 28, color: '#FF0000' },
          { type: 'line', x1: 20, y1: 45, x2: 80, y2: 45, color: '#FFFF00', lineWidth: 2 },
          { type: 'rect', x: 10, y: 10, width: 80, height: 80, color: 'rgba(0, 150, 255, 0.5)', lineWidth: 3 },
          { type: 'circle', cx: 85, cy: 75, radius: 10, fill: 'rgba(255, 0, 0, 0.7)' }
        ]
      }
    }
  },
  // Step 14: Explain drawing
  {
    type: "speech",
    payload: { text: "看，通过把抽象的公式视觉化，我们就能更好地理解各个参数（比如均值μ和标准差σ）的作用。这就是主动学习的力量。" }
  },
  // Step 15: Clear blackboard
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
  // Step 16: Engineering Story
  {
    type: "speech",
    payload: {
      // FIX: Corrected a syntax error. The property key 'text' was incorrectly formatted.
      text: "有一位同学，课程考试总是拿高分，但在机器人竞赛中却发现自己不会调试电路，也不会写控制程序。后来，他加入了一个团队项目，开始在实践中不断尝试和失败。经过几个月的锻炼，他不仅学会了调试， 还能独立设计控制方案，最终团队获得了全国比赛奖项。让我们看看他的作品吧！"
    }
  },
  // Step 17: Show Video
  {
    type: "command",
    payload: {
      name: "show_video",
      args: {
        // FIX: Corrected a syntax error. The property key 'url' was incorrectly formatted.
        url: "https://stdukafgtrhklodlywmz.supabase.co/storage/v1/object/public/lesson_materials/public/1759121176906-2025-09-29%2012-44-03.mp4"
      }
    }
  },
  // Step 18: Speech the end of video
  {
    type: "speech",
    payload: { "text": "很精彩是吧，机器人可以是人类的好帮手啊，各种场合都有用处" }
  },
  // Step 19: Speech for Question
  {
    type: "speech",
    payload: { "text": "从这个案例中，你觉得培养工程实践能力最关键的是什么？" }
  },
  // Step 20: Present Choices for Story Question
  {
    type: "command",
    payload: {
      name: "present_choices",
      args: {
        options: ["死记硬背课本知识", "反复做实验", "多参加项目和团队合作", "只看别人的经验"],
        correctAnswer: "多参加项目和团队合作"
      }
    }
  },
  // Step 21a: Correct Feedback
  {
    type: "speech",
    payload: { "text": "完全正确！团队合作和项目经验是把知识转化为能力的关键。" }
  },
   // Step 21b: Incorrect Feedback
  {
    type: "speech",
    payload: { "text": "这是一个常见的误区。虽然其他选项也有一定作用，但真正能锻炼工程能力的，是把知识应用在真实的项目和团队合作中。" }
  },
  // Step 22: Summary
  {
    type: "speech",
    payload: { "text": "总结一下，今天我们学习了两个核心点：第一，通过优先级管理和主动学习来提升效率；第二，通过项目实践和团队合作来锻炼工程能力。希望这些对大家有帮助。" }
  },
  // Step 23: Complete Lesson
  {
    type: "command",
    payload: { name: "complete_lesson", args: {} }
  },
  // Step 24: Start Q&A
  {
    type: "command",
    payload: { name: "start_qa", args: {} }
  }
];
