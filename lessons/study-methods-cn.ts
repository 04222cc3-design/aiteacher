import type { AIAction } from '../types';

export const lessonSummary = `
这堂课的主题是大学学习方法，重点涵盖网课学习技巧和时间管理。
核心观点包括：
1. 网课学习技巧：营造专属学习空间、主动参与互动、做结构化笔记、利用回放功能巩固知识。
2. 时间管理：四象限法则（重要紧急矩阵）、番茄工作法、制定周计划与日计划、避免拖延的方法。
`;

export const lessonScript: AIAction[] = [
  // Step 0: Show PDF
  {
    type: "command",
    payload: {
      name: "show_pdf",
      args: {
        url: "https://soxpkytjeqygryertwoe.supabase.co/storage/v1/object/public/lesson_materials/public/1778325866156-xuexifangfa.pdf",
        page: 1
      }
    }
  },
  // Step 1: Introduction

  {
    type: "speech",
    payload: {
      text: "同学们好！欢迎来到《大学学习方法》课堂。\n\n进入大学后，你们会发现学习方式和高中完全不同——特别是网课越来越多，自由支配的时间也更多了。如何高效学习、合理管理时间，是每个大学生都必须掌握的技能。\n\n今天我们就来聊聊这两个话题：网课学习技巧和时间管理方法。准备好了吗？"
    }
  },
  // Step 2: Present Ready Choices
  {
    type: "command",
    payload: {
      name: "present_choices",
      args: {
        options: ["准备好了", "还没准备好"]
      }
    }
  },
  // Step 3: Start Online Learning Section
  {
    type: "speech",
    payload: {
      text: "好，那我们首先进入第一个主题——网课学习技巧。\n\n很多同学觉得网课效果不如线下课，其实是因为没有掌握正确的学习方法。网课和线下课不同，它需要更强的自律性和主动性。"
    }
  },
  // Step 4: Tip 1 - Learning Space
  {
    type: "speech",
    payload: {
      text: "第一个技巧：营造专属的学习空间。\n\n不要在床上、沙发上上网课。找一个固定的、安静的位置，准备好电脑、笔记本和水。让你的大脑知道——坐在这里就是要学习了。\n\n这叫做「环境暗示法」，能帮你快速进入学习状态。"
    }
  },
  // Step 5: Tip 2 - Active Participation
  {
    type: "speech",
    payload: {
      text: "第二个技巧：主动参与互动。\n\n网课上不要只是被动地听。打开摄像头、在聊天区回答问题、记笔记、跟着老师的思路走。研究表明，主动参与的学生比被动听课的学生记忆 retention 率高 60% 以上。"
    }
  },
  // Step 6: Tip 3 - Structured Notes
  {
    type: "speech",
    payload: {
      text: "第三个技巧：做结构化笔记。\n\n推荐使用「康奈尔笔记法」——把笔记分为三个区域：主笔记区记录核心内容，左侧写关键词和问题，底部写总结。\n\n网课有回放功能，所以不用急着把每句话都记下来，重点记录框架、关键词和自己的思考。"
    }
  },
  // Step 7: Tip 4 - Use Playback
  {
    type: "speech",
    payload: {
      text: "第四个技巧：善用回放功能。\n\n网课最大的优势就是可以回放。遇到听不懂的地方，随时暂停、回看。课后花 10-15 分钟快速过一遍回放，把笔记补充完整，效果会好很多。"
    }
  },
  // Step 8: Question about Online Learning
  {
    type: "speech",
    payload: {
      text: "好，我来考考大家。以下哪个是网课学习中最有效的做法？"
    }
  },
  // Step 9: Present Choices for Online Learning
  {
    type: "command",
    payload: {
      name: "present_choices",
      args: {
        options: [
          "躺在床上听课，比较放松",
          "边听课边刷手机， multitasking",
          "在固定位置听课，主动做笔记",
          "等考试前再看回放"
        ],
        correctAnswer: "在固定位置听课，主动做笔记"
      }
    }
  },
  // Step 10a: Correct Feedback
  {
    type: "speech",
    payload: { text: "完全正确！固定位置+主动笔记，是网课学习最有效的方式。" }
  },
  // Step 10b: Incorrect Feedback
  {
    type: "speech",
    payload: { text: "这个答案不太对哦。网课学习需要主动参与，躺在床上或 multitasking 都会降低效率。最有效的是在固定位置听课并主动做笔记。" }
  },
  // Step 11: Transition to Time Management
  {
    type: "speech",
    payload: {
      text: "说完了网课技巧，我们来聊聊第二个主题——时间管理。\n\n很多大学生最大的困扰就是：感觉每天很忙，但回头一看，好像什么都没完成。这是为什么？"
    }
  },
  // Step 12: Four Quadrants
  {
    type: "speech",
    payload: {
      text: "这里要介绍一个非常经典的工具——四象限法则，也叫「重要紧急矩阵」。\n\n它把事情分为四类：\n第一象限：重要且紧急（比如明天要交的作业）——立即做\n第二象限：重要但不紧急（比如复习备考、锻炼身体）——计划做\n第三象限：不重要但紧急（比如一些临时会议）——委托或快速处理\n第四象限：不重要也不紧急（比如刷短视频）——尽量不做\n\n高效能人士的秘密就是：把大部分时间花在第二象限——重要但不紧急的事情上。"
    }
  },
  // Step 13: Draw the Four Quadrants on Blackboard
  {
    type: "command",
    payload: {
      name: "draw",
      args: {
        operations: [
          { type: 'background', color: 'black' },
          { type: 'text', text: '重要', x: 5, y: 5, fontSize: 24, color: '#FFD700' },
          { type: 'text', text: '紧急', x: 50, y: 5, fontSize: 24, color: '#FFD700' },
          { type: 'line', x1: 50, y1: 10, x2: 50, y2: 90, color: '#FFFFFF', lineWidth: 2 },
          { type: 'line', x1: 5, y1: 50, x2: 95, y2: 50, color: '#FFFFFF', lineWidth: 2 },
          { type: 'text', text: '重要紧急', x: 12, y: 25, fontSize: 20, color: '#FF4444' },
          { type: 'text', text: '立即做', x: 15, y: 40, fontSize: 16, color: '#FF8888' },
          { type: 'text', text: '重要不紧急', x: 55, y: 25, fontSize: 20, color: '#44FF44' },
          { type: 'text', text: '计划做', x: 58, y: 40, fontSize: 16, color: '#88FF88' },
          { type: 'text', text: '不重要紧急', x: 12, y: 60, fontSize: 20, color: '#FFAA44' },
          { type: 'text', text: '委托/快速', x: 15, y: 75, fontSize: 16, color: '#FFCC88' },
          { type: 'text', text: '不重要不紧急', x: 55, y: 60, fontSize: 20, color: '#888888' },
          { type: 'text', text: '尽量不做', x: 58, y: 75, fontSize: 16, color: '#AAAAAA' },
        ]
      }
    }
  },
  // Step 14: Explain the drawing
  {
    type: "speech",
    payload: { text: "看，这就是四象限法则的矩阵图。左上角是重要且紧急的事，要立即处理；右上角是重要但不紧急的事，要提前计划——这才是拉开差距的关键；左下角是不重要但紧急的事，可以委托别人或快速处理；右下角是不重要也不紧急的事，尽量少做。" }
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
  // Step 16: Pomodoro Technique
  {
    type: "speech",
    payload: {
      text: "除了四象限法则，还有一个非常实用的方法——番茄工作法。\n\n它的原理很简单：\n1. 选择一个任务\n2. 设置 25 分钟计时器，专注工作\n3. 时间到，休息 5 分钟\n4. 每完成 4 个番茄钟，休息 15-30 分钟\n\n关键是：在一个番茄钟内，不允许做任何与任务无关的事。"
    }
  },
  // Step 17: Planning
  {
    type: "speech",
    payload: {
      text: "最后，给大家一个实用的建议：每周日晚花 15 分钟做周计划，每天睡前花 5 分钟做日计划。\n\n把要做的任务写下来，用四象限法则分类，然后分配到每一天。这样你每天醒来就知道今天要做什么，而不是被各种事情推着走。"
    }
  },
  // Step 18: Question about Time Management
  {
    type: "speech",
    payload: {
      text: "来，考考大家。根据四象限法则，复习备考应该属于哪一类？"
    }
  },
  // Step 19: Present Choices for Time Management
  {
    type: "command",
    payload: {
      name: "present_choices",
      args: {
        options: [
          "重要且紧急",
          "重要但不紧急",
          "不重要但紧急",
          "不重要也不紧急"
        ],
        correctAnswer: "重要但不紧急"
      }
    }
  },
  // Step 20a: Correct Feedback
  {
    type: "speech",
    payload: { text: "没错！复习备考是重要但不紧急的事。如果等到考试前一周才复习，它就变成了重要且紧急的事，效果会大打折扣。提前规划、提前准备，才是高效学习的关键。" }
  },
  // Step 20b: Incorrect Feedback
  {
    type: "speech",
    payload: { text: "再想想哦。复习备考很重要，但通常不是明天就要考试对吧？所以它属于重要但不紧急的事。这类事情最容易被忽视，但恰恰是最应该花时间做的。" }
  },
  // Step 21: Summary
  {
    type: "speech",
    payload: {
      text: "好了，我们来总结一下今天的内容：\n\n关于网课学习，记住四个技巧：\n1. 营造专属学习空间\n2. 主动参与互动\n3. 做结构化笔记\n4. 善用回放功能\n\n关于时间管理，记住两个工具：\n1. 四象限法则——分清轻重缓急\n2. 番茄工作法——保持专注\n\n最后送大家一句话：大学四年，拉开差距的不是智商，而是学习方法和时间管理能力。希望大家都能成为高效学习者！"
    }
  },
  // Step 22: Complete Lesson
  {
    type: "command",
    payload: { name: "complete_lesson", args: {} }
  },
  // Step 23: Start Q&A
  {
    type: "command",
    payload: { name: "start_qa", args: {} }
  }
];
