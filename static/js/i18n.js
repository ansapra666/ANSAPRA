// i18n.js - 完整国际化支持
const i18n = {
    currentLang: localStorage.getItem('language') || 'zh',
    
    translations: {
        zh: {
            // 通用
            'app.name': 'ANSAPRA',
            'app.subtitle': '高中生自然科学论文自适应阅读程序',
            
            // 导航栏
            'nav.intro': '网站介绍',
            'nav.instructions': '使用说明',
            'nav.interpretation': '论文解读',
            'nav.settings': '用户设置',
            
            // 用户信息
            'user.welcome': '欢迎',
            'user.logout': '退出登录',
            
            // 登录/注册
            'auth.login': '登录',
            'auth.register': '注册',
            'auth.guest': '游客体验',
            'auth.login.title': '登录到 ANSAPRA',
            'auth.register.title': '注册 ANSAPRA 账户',
            'auth.guest.title': '游客体验',
            'auth.email': '邮箱',
            'auth.username': '用户名',
            'auth.password': '密码',
            'auth.confirm.password': '确认密码',
            'auth.guest.description': '以游客身份体验基本功能，部分功能可能受限。',
            'auth.guest.start': '开始体验',
            
            // 网站介绍页面
            'intro.title': '网站介绍',
            'intro.concept.title': '本网站开发理念',
            'intro.concept.content': '科学学术论文，又称原始科学文献（PSLs），承载着科学学术界最前沿的信息，是最直接、最原创的科学媒介。它们在专业研究领域广泛传播，却很少直接进入公众科普与教育领域。因此，高中生阅读科学学术论文的习惯普及率低下，成为本项目希望解决的社会痛点。通过前期调研，我们发现这一社会痛点的成因主要包括论文可读性下降、视觉呈现效果差等，而其中最具有影响力的是专门针对高中生、支持用户个性化设置的论文阅读程序的缺乏。为解决上述问题，我们决定开发 ANSAPRA，其名称源自"Adaptive Natural Science Academic Paper Reading Agent"的缩写。本项目从自然科学学术论文入手，关联Nature、SCI顶级期刊，对用户整体自然科学素养提升具有重要意义。',
            'intro.science.title': '自然科学基本内容',
            'intro.science.content': '自然科学是一个学习并研究自然界物质、能量及其相互作用规律的学科体系，涵盖物理学、天文学、化学、生物学与地球科学五大分支，同时也包含了许多跨学科科目。现代自然科学的发展是在宏观研究与微观研究的相互促进中实现的，高度的分化与高度的综合是现代科学发展的一个重要的特点。',
            'intro.journals.title': 'Nature & Science论文',
            'intro.journals.content': 'Nature（www.nature.com）与Science（www.science.org）为国际自然科学领域两大权威期刊门户：Nature 1869年创刊，现由Springer Nature出版，涵盖多学科前沿研究并发布即时评述；Science 1880年创刊，由美国科学促进会（AAAS）出版，同样以同行评审的原创论文与跨学科综述引领科研方向，两者均被Web of Science列为顶刊，影响因子常年逾50，是全球科学家获取与发布最新科学发现的核心平台。',
            
            // 使用说明页面
            'instructions.title': '使用说明',
            'instructions.technical.title': '技术说明',
            'instructions.technical.1': '后端框架：基于Flask、Python、Web框架构建',
            'instructions.technical.2': '前端技术：HTML5 + CSS3 + JavaScript响应式设计',
            'instructions.technical.3': '文件处理：集成pdfplumber、python-docx等专业解析库',
            'instructions.technical.4': 'API接口：调用DeepSeek-V1 API，支持前后端分离',
            'instructions.steps.title': '使用步骤',
            'instructions.steps.1.title': '阅读产品介绍与使用说明',
            'instructions.steps.1.1': '了解功能：详细阅读首页功能介绍，了解我们的核心开发理念',
            'instructions.steps.1.2': '观看使用说明：详细阅读本页使用说明部分，了解网页基本使用方法',
            'instructions.steps.2.title': '进入 "用户设置"页面，进行参数配置',
            'instructions.steps.2.1': '视觉设置：选择不同颜色的背景主题，调节字体形式与大小',
            'instructions.steps.2.2': '阅读习惯设置：对您个人的论文解读的偏好和特质进行个性化设置',
            'instructions.steps.2.3': '语言设置：切换网页语言为中文/英文',
            'instructions.steps.2.4': '账户设置：退出登录',
            'instructions.steps.3.title': '进行论文解读',
            'instructions.steps.3.1': '上传论文：支持拖拽上传或文件选择，最大支持16MB文件；pdf、docx文件均可接受',
            'instructions.steps.3.2': '文本输入：直接粘贴论文摘要或关键段落（最长支持5000字符）',
            'instructions.steps.3.3': '生成解读：点击"开始解读"按钮，等待AI生成详细分析',
            'instructions.features.title': '功能介绍',
            'instructions.features.core': '解读核心功能',
            'instructions.features.core.1': '智能解读：将复杂学术语言转换为通俗易懂的解释',
            'instructions.features.core.2': '术语解释：对专业术语提供详细定义和背景说明',
            'instructions.features.core.3': '图表理解：分析论文中的图表数据，生成用户喜欢的图表，提供直观解读',
            'instructions.features.core.4': '个性化设置：注重用户知识框架、阅读偏好差异性，提供设置功能',
            'instructions.features.core.5': '自适应算法：通过用户的阅读记录，自动更新、调整解读内容，推送相关论文',
            'instructions.features.visual': '视觉设置功能',
            'instructions.features.visual.1': '背景切换：支持不同颜色主题调节以及自定义主题设置',
            'instructions.features.visual.2': '字体调节：可调整解读内容的字体大小和行间距',
            'instructions.features.visual.3': '高亮显示：重要内容支持批注，支持自定义颜色标记',
            'instructions.features.contact': '反馈与联系功能',
            'instructions.features.contact.content': '您可以在页面底部的"联系我们"中找到开发团队的联系方式',
            'instructions.features.other': '其他实用功能',
            'instructions.features.other.1': '多语言支持：支持中英双语解读界面',
            'instructions.features.other.2': '进度保存功能：同一用户登录时自动打开上次退出时的阅读界面',
            'instructions.tip.title': '温馨提示',
            'instructions.tip.content': '本服务旨在辅助学术理解，不替代专业学术评审。重要研究决策请结合专家意见。我们持续优化AI模型，欢迎您在使用过程中提供宝贵反馈，共同打造更好的学术辅助工具！',
            
            // 论文解读页面
            'interpretation.title': '论文解读',
            'interpretation.upload.title': '上传论文文件',
            'interpretation.upload.description': '支持PDF、DOCX、TXT格式，最大16MB',
            'interpretation.upload.button': '选择文件',
            'interpretation.text.title': '或输入论文文本',
            'interpretation.text.placeholder': '粘贴论文摘要或关键段落...',
            'interpretation.text.count': '字符',
            'interpretation.start.button': '开始解读',
            'interpretation.clear.button': '清空',
            'interpretation.result.title': '解读结果',
            'interpretation.download': '下载',
            'interpretation.save': '保存',
            'interpretation.original': '原文内容',
            'interpretation.ai': 'AI解读',
            'interpretation.recommendations': '相关论文推荐',
            'interpretation.mindmap': '论文结构思维导图',
            'interpretation.loading': '正在生成解读，请稍候...',
            'interpretation.no.recommendations': '暂无相关论文推荐',
            
            // 用户设置页面
            'settings.title': '用户设置',
            'settings.reading': '阅读习惯',
            'settings.visual': '视觉设置',
            'settings.language': '语言设置',
            'settings.account': '账户设置',
            'settings.save': '保存设置',
            'settings.reset': '恢复默认',
            'settings.delete.account': '删除账户',
            'settings.delete.warning': '注意：删除账户将永久清除所有数据，包括解读历史和个性化设置。',
            'settings.language.zh': '中文',
            'settings.language.en': 'English',
            'settings.language.label': '界面语言',
            
            // 阅读习惯设置
            'reading.preparation': '阅读一篇专业自然科学论文之前，您会在论文所在领域知识方面做什么程度的准备？',
            'reading.preparation.A': 'A. 几乎不做准备',
            'reading.preparation.B': 'B. 做一些准备（默认设置）',
            'reading.preparation.C': 'C. 做较为深入的准备',
            'reading.purpose': '您阅读自然科学论文的原因是？',
            'reading.purpose.A': 'A. 目标驱动者: 为完成特定任务（如作业、比赛）而阅读，追求高效和直接',
            'reading.purpose.B': 'B. 知识探索者: 受学科兴趣驱动，希望拓宽知识面，不急于求成，不追求深入理解（默认设置）',
            'reading.purpose.C': 'C. 深度学习者: 为了深入理解并研究某一领域知识，论文知识之外，同时重视研究方法和应用；希望通过本论文',
            'reading.purpose.D': 'D. 科学了解者：希望通过论文解读提升个人科学素养和整体科学感知能力',
            'reading.time': '您愿意在多长时间内解读一篇自然科学论文？',
            'reading.time.A': 'A. 10分钟内',
            'reading.time.B': 'B. 10-30分钟内（默认设置）',
            'reading.time.C': 'C. 30分钟及以上',
            'reading.style': '您喜好的自然科学论文解读风格与方式是？',
            'reading.style.A': 'A. 生动形象，语言偏口语化，能联系生活中最简单的例子和类比解读论文',
            'reading.style.B': 'B. 量化解读，尽量通过数据和公式解读论文',
            'reading.style.C': 'C. 专业解读，通过较为正式的语言和专业严谨的表达解读论文，对论文内容稍作调整（默认设置）',
            'reading.style.D': 'D. 原汁原味，保留原文的表达风格和表述方式，接受长难句、专业术语解读方式',
            'reading.style.E': 'E. 逐步推导，通过问题引入的方式，类似于课堂教学的方式逐步介绍知识，强调互动性',
            'reading.depth': '您喜好的自然科学论文解读深度是？',
            'reading.depth.A': 'A. 简洁概括',
            'reading.depth.B': 'B. 平衡详细（默认设置）',
            'reading.depth.C': 'C. 详细深入',
            'reading.test': '您希望读后自测部分包含哪些内容？',
            'reading.test.A': 'A. 相关定义填空题',
            'reading.test.B': 'B. 易错易混选择题（默认设置）',
            'reading.test.C': 'C. 公式逻辑默写题',
            'reading.charts': '您偏好的图表形式是？（可多选）',
            'reading.charts.A': 'A. 思维导图（树状）（默认设置）',
            'reading.charts.B': 'B. 流程图与逻辑图',
            'reading.charts.C': 'C. 表格',
            'reading.charts.D': 'D. 统计图（折线图、柱状图等）',
            
            // 视觉设置
            'visual.theme': '背景主题',
            'visual.theme.A': '粉色',
            'visual.theme.B': '浅蓝色',
            'visual.theme.C': '浅绿色',
            'visual.theme.D': '浅紫色',
            'visual.theme.E': '自定义（白色）',
            'visual.font.size': '字体大小',
            'visual.font.size.small': '小',
            'visual.font.size.normal': '标准',
            'visual.font.size.large': '大',
            'visual.font.family': '字体家族',
            'visual.font.reset': '重置',
            'visual.chinese.font': '中文字体',
            'visual.english.font': '英文字体',
            'visual.chinese.font.1': '微软雅黑',
            'visual.chinese.font.2': '霞鹜文楷',
            'visual.chinese.font.3': '华文楷体',
            'visual.chinese.font.4': '思源宋体',
            'visual.english.font.1': 'Eczar (衬线体)',
            'visual.english.font.2': 'Cabin (无衬线体)',
            'visual.english.font.3': 'Arial (系统默认)',
            'visual.line.height': '行高设置',
            'visual.letter.spacing': '字间距设置',
            'visual.preview': '实时预览',
            'visual.preview.text': '这是一段预览文字，展示当前字体设置的效果。This is preview text showing the current font settings.',
            'visual.background': '自定义背景图片',
            'visual.background.upload': '选择图片',
            'visual.background.remove': '移除背景',
            'visual.background.help': '支持JPG、PNG格式，建议尺寸1920x1080，文件大小不超过5MB',
            'visual.reset.all': '重置所有视觉设置',
            'visual.reset.warning': '注意：这将重置所有视觉设置，包括字体、背景和主题',
            
            // 页脚
            'footer.contact': '联系我们',
            'footer.copyright': '版权说明',
            'footer.terms': '服务条款',
            'footer.privacy': '隐私政策',
            'footer.cookie': 'Cookie政策',
            'footer.rights': '© 2025 ANSAPRA开发团队 | 高中生自然科学论文自适应阅读程序',
            
            // 模态框按钮
            'modal.close': '关闭',
            'modal.print': '打印',
            'modal.read': '我已阅读并理解',
            
            // 通知
            'notification.settings.saved': '视觉设置已保存',
            'notification.settings.reset': '视觉设置已重置为默认值',
            'notification.background.applied': '背景图片已应用',
            'notification.background.removed': '背景图片已移除',
            'notification.font.reset': '字体大小已重置为默认值',
            'notification.login.success': '登录成功！',
            'notification.logout.success': '已成功登出',
            'notification.register.success': '注册成功！问卷数据已保存。',
            'notification.interpretation.success': '解读生成成功！',
            'notification.interpretation.saved': '已保存到阅读历史',
            'notification.error.network': '网络错误，请稍后重试',
            'notification.error.login': '邮箱或密码错误',
            'notification.error.register': '注册失败',
            'notification.error.file.size': '文件大小不能超过16MB',
            'notification.error.file.format': '不支持的文件格式',
            'notification.error.text.length': '文本内容不能超过5000字符',
            'notification.error.required': '请填写所有必填项',
            'notification.error.email': '请输入有效的邮箱地址',
            'notification.error.password.length': '密码长度至少6位',
            'notification.error.password.match': '两次输入的密码不一致',
            'notification.error.questionnaire': '请完成问卷中的必填问题',
            
            // 隐私政策
            'privacy.title': '隐私政策',
            'privacy.last.updated': '最后更新日期：2026年1月1日',
            'privacy.intro': 'ANSAPRA（以下简称"我们"或"本平台"）尊重并保护所有用户的隐私。本政策旨在说明我们如何收集、使用、存储和保护您的个人信息，特别是考虑到我们的主要用户群体为高中生。',
            'privacy.collect.title': '我们收集的信息',
            'privacy.collect.1': '您主动提供的信息：当您注册账户、提交反馈或通过"联系我们"发送邮件时，我们可能会收集您的邮箱地址、用户名以及您自愿提供的其他信息。',
            'privacy.collect.2': '自动收集的信息：为优化阅读体验，我们可能通过Cookie等技术匿名收集您的设备信息、浏览器类型、访问时间、页面停留时间及阅读偏好（如论文分类偏好）。这些信息不用于身份识别，仅用于改善服务。',
            'privacy.collect.3': '问卷调查数据：在网站设计阶段，我们通过匿名问卷收集了关于高中生自然科学论文阅读偏好的汇总数据，用于功能设计。该数据已进行脱敏处理，不包含任何个人身份信息。',
            'privacy.use.title': '我们如何使用信息',
            'privacy.use.1': '为您提供和优化自适应的论文阅读体验。',
            'privacy.use.2': '通过邮箱回复您的问题或反馈。',
            'privacy.use.3': '进行匿名的、聚合性的数据分析，以持续改进网站功能。',
            'privacy.share.title': '信息共享与披露',
            'privacy.share.content': '我们不会出售、交易或出租您的个人信息给任何第三方。除非法律要求，否则我们不会披露您的个人身份信息。',
            'privacy.security.title': '数据安全',
            'privacy.security.content': '我们采取合理的技术措施保护数据安全。但由于互联网传输并非绝对安全，我们无法保证信息的绝对安全。',
            'privacy.rights.title': '您的权利',
            'privacy.rights.content': '您可以随时在账户设置中查看或更新您提供的个人信息。如需删除账户，请通过页面上的删除账户按钮操作。',
            'privacy.minors.title': '关于未成年人',
            'privacy.minors.content': '我们的服务主要面向高中生。我们鼓励未成年用户在父母或监护人的指导下使用本平台。',
            'privacy.changes.title': '政策变更',
            'privacy.changes.content': '我们可能适时更新本政策，更新内容将公布于此页面。',
            
            // 服务条款
            'terms.title': '服务条款',
            'terms.effective': '生效日期：2026年1月1日',
            'terms.intro': '欢迎使用 ANSAPRA。本平台是一个由高中生团队开发的、旨在帮助同龄人阅读自然科学论文的工具。这是一个由在读高中生发起并主导的CTB（China Thinks Big）竞赛项目。',
            'terms.description': '本平台是一个基于自适应学习技术的工具，通过调用DeepSeek人工智能大语言模型官方API，旨在根据高中生的认知框架，个性化推荐和辅助阅读自然科学论文。',
            'terms.rules.title': '使用规则',
            'terms.rules.1': '您必须遵守所有适用的法律和法规。',
            'terms.rules.2': '您不得利用本平台进行任何干扰服务正常运行或损害他人权益的行为。',
            'terms.rules.3': '您应对通过您的账户进行的所有活动负责。',
            'terms.disclaimer.title': '免责声明',
            'terms.disclaimer.1': '本平台提供的论文摘要、解读和推荐内容为AI生成内容，仅作为学习辅助和参考，不构成专业的学术建议。请您务必批判性思考，并以原文为准。',
            'terms.disclaimer.2': '我们尽力确保服务稳定，但不对服务的持续性、无中断性或绝对安全性作任何担保。',
            'terms.disclaimer.3': '关于AI生成代码的说明：本网站的核心功能代码由人工智能辅助生成，并经过我们的测试与调整。我们团队对其功能与安全性负责，并持续进行优化与维护。',
            'terms.ip.title': '知识产权',
            'terms.ip.content': '网站的设计、Logo、原创内容归ANSAPRA开发团队所有。平台内引用的论文摘要、元数据等，其版权归属于原论文作者或出版商，我们按合理使用原则提供以支持教育目的。',
            'terms.termination.title': '终止服务',
            'terms.termination.content': '我们保留因用户违反本条款或自行决定而暂停或终止服务的权利。',
            
            // Cookie政策
            'cookie.title': 'Cookie政策',
            'cookie.intro': '我们使用Cookie（小型文本文件）来提升您的浏览体验。',
            'cookie.purpose.title': 'Cookie的用途',
            'cookie.purpose.1': '必要Cookie：用于维持网站的基本功能，如保持登录状态、记住语言偏好等。',
            'cookie.purpose.2': '分析Cookie：用于匿名分析网站流量和页面使用情况，以帮助我们了解如何改进网站设计。',
            'cookie.purpose.3': '偏好Cookie：记住您的个性化设置，如字体大小、主题颜色等。',
            'cookie.control.title': 'Cookie控制',
            'cookie.control.content': '您可以通过浏览器设置拒绝或管理Cookie。但请注意，禁用某些Cookie可能影响部分网站功能的正常使用：',
            'cookie.control.1': '禁用必要Cookie将导致您无法保持登录状态，每次访问都需要重新登录',
            'cookie.control.2': '禁用偏好Cookie将无法保存您的个性化设置',
            'cookie.control.3': '禁用分析Cookie不会影响网站功能，但我们会失去了解用户行为的途径',
            'cookie.thirdparty.title': '第三方Cookie',
            'cookie.thirdparty.content': '我们目前未使用任何用于跟踪或广告的第三方Cookie。所有Cookie仅用于本网站的功能改善和用户体验优化。',
            'cookie.storage.title': 'Cookie存储时间',
            'cookie.storage.1': '会话Cookie：在您关闭浏览器时自动删除',
            'cookie.storage.2': '持久Cookie：根据设置保留数天至数月',
            'cookie.storage.3': '登录状态Cookie：通常保留7-30天',
            'cookie.choices.title': '您的选择',
            'cookie.choices.1': '接受所有Cookie：获得完整的网站体验',
            'cookie.choices.2': '仅接受必要Cookie：保持基本功能，但个性化设置不会被保存',
            'cookie.choices.3': '拒绝所有非必要Cookie：通过浏览器设置实现',
            
            // 版权说明
            'copyright.title': '版权说明',
            'copyright.intro': 'ANSAPRA是一个教育性质的非营利项目。',
            'copyright.website.title': '本网站的版权',
            'copyright.website.1': '本网站的整体设计、用户界面、特定功能代码及原创文本内容受版权保护，版权归 ANSAPRA开发团队 所有，© 2026。',
            'copyright.website.2': '未经书面许可，任何组织或个人不得复制、修改、分发或商业性使用本网站的设计和内容。',
            'copyright.content.title': '引用内容的版权',
            'copyright.content.1': '网站内为辅助阅读而引用的论文标题、摘要、作者、期刊信息等元数据，其版权归原著作权人所有。',
            'copyright.content.2': '我们严格遵守学术规范进行引用，旨在为高中生提供研究学习便利，符合合理使用原则。',
            'copyright.content.3': '所有引用内容均明确标注来源，仅供教育目的使用。',
            'copyright.user.title': '用户生成内容',
            'copyright.user.1': '用户在本平台上传的论文文件、笔记和批注，其版权仍归用户所有。',
            'copyright.user.2': '用户授予本平台存储和展示这些内容的权利，以便提供解读服务。',
            'copyright.user.3': '用户可以随时删除自己上传的内容。',
            'copyright.license.title': '使用许可',
            'copyright.license.1': '任何个人或教育机构可出于非商业性学习目的自由分享网站链接。',
            'copyright.license.2': '如需对本网站的设计或内容进行复制、修改或用于其他公开用途，请事先通过 "联系我们"中的邮箱地址 联系我们，并取得我们的书面许可。',
            'copyright.license.3': '学校和教育机构可在获得许可后，将本网站用于课堂教学目的。',
            'copyright.report.title': '侵权举报',
            'copyright.report.content': '如果您认为本网站的内容侵犯了您的版权，请通过以下方式联系我们：',
            'copyright.report.1': '电子邮件：1182332400@qq.com 或 biokoala@outlook.com',
            'copyright.report.2': '请提供详细的侵权证明和您的联系方式',
            'copyright.report.3': '我们会在收到举报后10个工作日内进行处理',
            
            // 联系我们
            'contact.title': '联系我们',
            'contact.intro': '我们是一个由高中生组成的开发团队。本网站从诞生到优化，都离不开用户的支持。因此，我们非常重视您的反馈。',
            'contact.team.title': '团队介绍',
            'contact.team.content': '我们是参加CTB（China Thinks Big）全球青年研究创新论坛的高中生团队。我们的目标是帮助同龄人更好地阅读和理解自然科学学术论文。',
            'contact.project.title': '项目背景',
            'contact.project.content': '通过前期调研，我们发现高中生阅读科学学术论文的普及率较低，主要原因包括论文可读性差、缺乏个性化辅助工具等。为此，我们开发了ANSAPRA（Adaptive Natural Science Academic Paper Reading Agent）。',
            'contact.topics.title': '您可以联系我们的事项',
            'contact.topics.1': '网站功能建议或错误报告：如果您发现网站存在bug或有改进建议',
            'contact.topics.2': '隐私政策的疑问：对个人信息处理有任何疑问',
            'contact.topics.3': '合作意向：学校、教育机构或媒体希望合作',
            'contact.topics.4': '版权相关问题：涉及内容版权的疑问或举报',
            'contact.topics.5': '学术支持：希望获得更多学术资源或指导',
            'contact.topics.6': '其他任何问题：任何与本网站相关的问题',
            'contact.methods.title': '联系方式',
            'contact.methods.1': '主要邮箱',
            'contact.methods.2': '备用邮箱',
            'contact.response.title': '响应时间',
            'contact.response.content': '我们会在10个工作日内尽力回复您的邮件。由于我们是学生团队，回复可能会在课后时间，敬请谅解。',
            'contact.suggestions.title': '反馈建议',
            'contact.suggestions.1': '明确邮件主题，如"[功能建议]"、"[错误报告]"等',
            'contact.suggestions.2': '提供详细的问题描述和复现步骤',
            'contact.suggestions.3': '如果是功能建议，请说明您的使用场景和期望效果',
            'contact.suggestions.4': '留下您的联系方式以便我们进一步沟通'
        },
        
        en: {
            // 通用
            'app.name': 'ANSAPRA',
            'app.subtitle': 'Adaptive Natural Science Academic Paper Reading Program for High School Students',
            
            // 导航栏
            'nav.intro': 'Introduction',
            'nav.instructions': 'Instructions',
            'nav.interpretation': 'Paper Interpretation',
            'nav.settings': 'User Settings',
            
            // 用户信息
            'user.welcome': 'Welcome',
            'user.logout': 'Logout',
            
            // 登录/注册
            'auth.login': 'Login',
            'auth.register': 'Register',
            'auth.guest': 'Guest Experience',
            'auth.login.title': 'Login to ANSAPRA',
            'auth.register.title': 'Register ANSAPRA Account',
            'auth.guest.title': 'Guest Experience',
            'auth.email': 'Email',
            'auth.username': 'Username',
            'auth.password': 'Password',
            'auth.confirm.password': 'Confirm Password',
            'auth.guest.description': 'Experience basic features as a guest, some functions may be limited.',
            'auth.guest.start': 'Start Experience',
            
            // 网站介绍页面
            'intro.title': 'Introduction',
            'intro.concept.title': 'Our Development Philosophy',
            'intro.concept.content': 'Scientific academic papers, also known as primary scientific literature (PSLs), carry the most cutting-edge information in the scientific academic community and are the most direct and original scientific media. They are widely disseminated in professional research fields but rarely enter the public science popularization and education field directly. Therefore, the low popularity of high school students\' habit of reading scientific academic papers has become a social pain point that this project hopes to address. Through preliminary research, we found that the causes of this social pain point mainly include reduced readability of papers and poor visual presentation effects, among which the most influential is the lack of a dedicated paper reading program for high school students that supports personalized settings. To solve the above problems, we decided to develop ANSAPRA, whose name comes from the abbreviation of "Adaptive Natural Science Academic Paper Reading Agent". This project starts with natural science academic papers and links with top journals like Nature and Science, which is of great significance for improving users\' overall scientific literacy.',
            'intro.science.title': 'Introduction to Natural Science',
            'intro.science.content': 'Natural science is a discipline system that studies and investigates the material, energy, and their interaction laws of the natural world, covering five major branches: physics, astronomy, chemistry, biology, and earth science, while also including many interdisciplinary subjects. The development of modern natural science is achieved through the mutual promotion of macro and micro research. High differentiation and high integration are important characteristics of modern scientific development.',
            'intro.journals.title': 'Nature & Science Papers',
            'intro.journals.content': 'Nature (www.nature.com) and Science (www.science.org) are the two leading portals for international natural science publishing: Nature was founded in 1869 and is now published by Springer Nature, covering cutting-edge multidisciplinary research and providing instant commentary; Science was launched in 1880 by the American Association for the Advancement of Science (AAAS) and similarly directs scientific inquiry through peer-reviewed original articles and interdisciplinary reviews. Both journals are ranked as top-tier by Web of Science and maintain impact factors exceeding 50, serving as the primary platforms where scientists worldwide obtain and announce the latest scientific discoveries.',
            
            // 使用说明页面
            'instructions.title': 'Instructions',
            'instructions.technical.title': 'Technical Specifications',
            'instructions.technical.1': 'Backend Framework: Built on Flask, Python, Web frameworks',
            'instructions.technical.2': 'Frontend Technology: HTML5 + CSS3 + JavaScript responsive design',
            'instructions.technical.3': 'File Processing: Integrated professional parsing libraries like pdfplumber, python-docx',
            'instructions.technical.4': 'API Interface: Calls DeepSeek-V1 API, supports frontend-backend separation',
            'instructions.steps.title': 'Usage Steps',
            'instructions.steps.1.title': 'Read Product Introduction and Usage Instructions',
            'instructions.steps.1.1': 'Understand Functions: Read the homepage function introduction in detail to understand our core development philosophy',
            'instructions.steps.1.2': 'Watch Instructions: Read the instructions section on this page in detail to understand basic website usage methods',
            'instructions.steps.2.title': 'Go to "User Settings" Page for Parameter Configuration',
            'instructions.steps.2.1': 'Visual Settings: Choose different color themes, adjust font style and size',
            'instructions.steps.2.2': 'Reading Habit Settings: Personalize your paper interpretation preferences and characteristics',
            'instructions.steps.2.3': 'Language Settings: Switch website language to Chinese/English',
            'instructions.steps.2.4': 'Account Settings: Logout',
            'instructions.steps.3.title': 'Start Paper Interpretation',
            'instructions.steps.3.1': 'Upload Paper: Support drag-and-drop upload or file selection, maximum 16MB files; PDF and DOCX files are accepted',
            'instructions.steps.3.2': 'Text Input: Directly paste paper abstracts or key paragraphs (maximum 5000 characters)',
            'instructions.steps.3.3': 'Generate Interpretation: Click the "Start Interpretation" button and wait for AI to generate detailed analysis',
            'instructions.features.title': 'Feature Introduction',
            'instructions.features.core': 'Core Interpretation Features',
            'instructions.features.core.1': 'Intelligent Interpretation: Converts complex academic language into easy-to-understand explanations',
            'instructions.features.core.2': 'Terminology Explanation: Provides detailed definitions and background explanations for professional terms',
            'instructions.features.core.3': 'Chart Understanding: Analyzes chart data in papers, generates user-preferred charts, and provides intuitive interpretations',
            'instructions.features.core.4': 'Personalized Settings: Focuses on differences in user knowledge frameworks and reading preferences, providing setting functions',
            'instructions.features.core.5': 'Adaptive Algorithm: Automatically updates and adjusts interpretation content through user reading records, pushes related papers',
            'instructions.features.visual': 'Visual Setting Functions',
            'instructions.features.visual.1': 'Background Switching: Supports different color theme adjustments and custom theme settings',
            'instructions.features.visual.2': 'Font Adjustment: Can adjust font size and line spacing of interpretation content',
            'instructions.features.visual.3': 'Highlight Display: Important content supports annotations and custom color marking',
            'instructions.features.contact': 'Feedback and Contact Function',
            'instructions.features.contact.content': 'You can find the development team\'s contact information at the bottom of the page under "Contact Us"',
            'instructions.features.other': 'Other Practical Functions',
            'instructions.features.other.1': 'Multilingual Support: Supports Chinese-English bilingual interpretation interface',
            'instructions.features.other.2': 'Progress Saving Function: Automatically opens the reading interface from last exit when the same user logs in',
            'instructions.tip.title': 'Important Tip',
            'instructions.tip.content': 'This service is designed to assist academic understanding and does not replace professional academic review. Important research decisions should be combined with expert opinions. We continuously optimize AI models and welcome your valuable feedback during use to jointly create better academic assistance tools!',
            
            // 论文解读页面
            'interpretation.title': 'Paper Interpretation',
            'interpretation.upload.title': 'Upload Paper File',
            'interpretation.upload.description': 'Supports PDF, DOCX, TXT formats, maximum 16MB',
            'interpretation.upload.button': 'Select File',
            'interpretation.text.title': 'Or Input Paper Text',
            'interpretation.text.placeholder': 'Paste paper abstract or key paragraphs...',
            'interpretation.text.count': 'characters',
            'interpretation.start.button': 'Start Interpretation',
            'interpretation.clear.button': 'Clear',
            'interpretation.result.title': 'Interpretation Results',
            'interpretation.download': 'Download',
            'interpretation.save': 'Save',
            'interpretation.original': 'Original Content',
            'interpretation.ai': 'AI Interpretation',
            'interpretation.recommendations': 'Related Paper Recommendations',
            'interpretation.mindmap': 'Paper Structure Mind Map',
            'interpretation.loading': 'Generating interpretation, please wait...',
            'interpretation.no.recommendations': 'No related paper recommendations available',
            
            // 用户设置页面
            'settings.title': 'User Settings',
            'settings.reading': 'Reading Habits',
            'settings.visual': 'Visual Settings',
            'settings.language': 'Language Settings',
            'settings.account': 'Account Settings',
            'settings.save': 'Save Settings',
            'settings.reset': 'Reset to Default',
            'settings.delete.account': 'Delete Account',
            'settings.delete.warning': 'Note: Deleting your account will permanently delete all data, including interpretation history and personalized settings.',
            'settings.language.zh': 'Chinese',
            'settings.language.en': 'English',
            'settings.language.label': 'Interface Language',
            
            // 阅读习惯设置
            'reading.preparation': 'Before reading a professional natural science paper, what level of preparation will you do in the field knowledge of the paper?',
            'reading.preparation.A': 'A. Almost no preparation',
            'reading.preparation.B': 'B. Do some preparation (default setting)',
            'reading.preparation.C': 'C. Do more in-depth preparation',
            'reading.purpose': 'What is your reason for reading natural science papers?',
            'reading.purpose.A': 'A. Goal-driven: Reading to complete specific tasks (such as assignments, competitions), pursuing efficiency and directness',
            'reading.purpose.B': 'B. Knowledge explorer: Driven by subject interest, hoping to broaden knowledge, not in a hurry, not pursuing deep understanding (default setting)',
            'reading.purpose.C': 'C. Deep learner: To deeply understand and study knowledge in a certain field, in addition to paper knowledge, also value research methods and applications; hope through this paper',
            'reading.purpose.D': 'D. Science understander: Hope to improve personal scientific literacy and overall scientific perception ability through paper interpretation',
            'reading.time': 'How long are you willing to interpret a natural science paper?',
            'reading.time.A': 'A. Within 10 minutes',
            'reading.time.B': 'B. 10-30 minutes (default setting)',
            'reading.time.C': 'C. 30 minutes or more',
            'reading.style': 'What is your preferred natural science paper interpretation style and method?',
            'reading.style.A': 'A. Vivid and figurative, language is colloquial, able to connect with the simplest examples and analogies in life to interpret papers',
            'reading.style.B': 'B. Quantitative interpretation, try to interpret papers through data and formulas',
            'reading.style.C': 'C. Professional interpretation, interpret papers through more formal language and professional rigorous expression, with slight adjustments to paper content (default setting)',
            'reading.style.D': 'D. Authentic, retain the original expression style and presentation method, accept long difficult sentences, professional terminology interpretation methods',
            'reading.style.E': 'E. Step-by-step derivation, introduce knowledge step by step through question introduction, similar to classroom teaching methods, emphasizing interactivity',
            'reading.depth': 'What is your preferred depth of natural science paper interpretation?',
            'reading.depth.A': 'A. Concise summary',
            'reading.depth.B': 'B. Balanced and detailed (default setting)',
            'reading.depth.C': 'C. Detailed and in-depth',
            'reading.test': 'What content do you want to include in the post-reading self-test section?',
            'reading.test.A': 'A. Related definition fill-in-the-blank questions',
            'reading.test.B': 'B. Easy-to-make-mistake and confusing multiple-choice questions (default setting)',
            'reading.test.C': 'C. Formula logic recitation questions',
            'reading.charts': 'What is your preferred chart form? (Multiple choices allowed)',
            'reading.charts.A': 'A. Mind map (tree-like) (default setting)',
            'reading.charts.B': 'B. Flow chart and logic diagram',
            'reading.charts.C': 'C. Table',
            'reading.charts.D': 'D. Statistical chart (line chart, bar chart, etc.)',
            
            // 视觉设置
            'visual.theme': 'Background Theme',
            'visual.theme.A': 'Pink',
            'visual.theme.B': 'Light Blue',
            'visual.theme.C': 'Light Green',
            'visual.theme.D': 'Light Purple',
            'visual.theme.E': 'Custom (White)',
            'visual.font.size': 'Font Size',
            'visual.font.size.small': 'Small',
            'visual.font.size.normal': 'Standard',
            'visual.font.size.large': 'Large',
            'visual.font.family': 'Font Family',
            'visual.font.reset': 'Reset',
            'visual.chinese.font': 'Chinese Font',
            'visual.english.font': 'English Font',
            'visual.chinese.font.1': 'Microsoft YaHei',
            'visual.chinese.font.2': 'LXGW WenKai TC',
            'visual.chinese.font.3': 'STKaiti',
            'visual.chinese.font.4': 'Noto Serif SC',
            'visual.english.font.1': 'Eczar (Serif)',
            'visual.english.font.2': 'Cabin (Sans-serif)',
            'visual.english.font.3': 'Arial (System Default)',
            'visual.line.height': 'Line Height Setting',
            'visual.letter.spacing': 'Letter Spacing Setting',
            'visual.preview': 'Real-time Preview',
            'visual.preview.text': 'This is a preview text showing the effect of current font settings. This is preview text showing the current font settings.',
            'visual.background': 'Custom Background Image',
            'visual.background.upload': 'Select Image',
            'visual.background.remove': 'Remove Background',
            'visual.background.help': 'Supports JPG, PNG formats, recommended size 1920x1080, file size not exceeding 5MB',
            'visual.reset.all': 'Reset All Visual Settings',
            'visual.reset.warning': 'Note: This will reset all visual settings, including fonts, background and theme',
            
            // 页脚
            'footer.contact': 'Contact Us',
            'footer.copyright': 'Copyright Notice',
            'footer.terms': 'Terms of Service',
            'footer.privacy': 'Privacy Policy',
            'footer.cookie': 'Cookie Policy',
            'footer.rights': '© 2025 ANSAPRA Development Team | Adaptive Natural Science Academic Paper Reading Program',
            
            // 模态框按钮
            'modal.close': 'Close',
            'modal.print': 'Print',
            'modal.read': 'I have read and understood',
            
            // 通知
            'notification.settings.saved': 'Visual settings saved',
            'notification.settings.reset': 'Visual settings reset to default',
            'notification.background.applied': 'Background image applied',
            'notification.background.removed': 'Background image removed',
            'notification.font.reset': 'Font size reset to default',
            'notification.login.success': 'Login successful!',
            'notification.logout.success': 'Successfully logged out',
            'notification.register.success': 'Registration successful! Questionnaire data saved.',
            'notification.interpretation.success': 'Interpretation generated successfully!',
            'notification.interpretation.saved': 'Saved to reading history',
            'notification.error.network': 'Network error, please try again later',
            'notification.error.login': 'Email or password incorrect',
            'notification.error.register': 'Registration failed',
            'notification.error.file.size': 'File size cannot exceed 16MB',
            'notification.error.file.format': 'Unsupported file format',
            'notification.error.text.length': 'Text content cannot exceed 5000 characters',
            'notification.error.required': 'Please fill in all required fields',
            'notification.error.email': 'Please enter a valid email address',
            'notification.error.password.length': 'Password must be at least 6 characters',
            'notification.error.password.match': 'Passwords do not match',
            'notification.error.questionnaire': 'Please complete required questionnaire questions',
            
            // 隐私政策
            'privacy.title': 'Privacy Policy',
            'privacy.last.updated': 'Last Updated: January 1, 2026',
            'privacy.intro': 'ANSAPRA (hereinafter referred to as "we" or "this platform") respects and protects the privacy of all users. This policy aims to explain how we collect, use, store, and protect your personal information, especially considering that our main user group is high school students.',
            'privacy.collect.title': 'Information We Collect',
            'privacy.collect.1': 'Information You Actively Provide: When you register an account, submit feedback, or send emails through "Contact Us", we may collect your email address, username, and other information you voluntarily provide.',
            'privacy.collect.2': 'Automatically Collected Information: To optimize the reading experience, we may anonymously collect your device information, browser type, access time, page stay time, and reading preferences (such as paper category preferences) through technologies like Cookies. This information is not used for identity identification and is only used to improve services.',
            'privacy.collect.3': 'Questionnaire Survey Data: During the website design phase, we collected aggregated data on high school students\' natural science paper reading preferences through anonymous questionnaires for functional design. This data has been desensitized and does not contain any personal identity information.',
            'privacy.use.title': 'How We Use Information',
            'privacy.use.1': 'To provide and optimize an adaptive paper reading experience for you.',
            'privacy.use.2': 'To reply to your questions or feedback via email.',
            'privacy.use.3': 'To conduct anonymous, aggregated data analysis to continuously improve website functionality.',
            'privacy.share.title': 'Information Sharing and Disclosure',
            'privacy.share.content': 'We do not sell, trade, or rent your personal information to any third party. Unless required by law, we will not disclose your personal identity information.',
            'privacy.security.title': 'Data Security',
            'privacy.security.content': 'We take reasonable technical measures to protect data security. However, since internet transmission is not absolutely secure, we cannot guarantee absolute security of information.',
            'privacy.rights.title': 'Your Rights',
            'privacy.rights.content': 'You can view or update your personal information provided in your account settings at any time. If you need to delete your account, please use the delete account button on the page.',
            'privacy.minors.title': 'About Minors',
            'privacy.minors.content': 'Our service is mainly aimed at high school students. We encourage minor users to use this platform under the guidance of parents or guardians.',
            'privacy.changes.title': 'Policy Changes',
            'privacy.changes.content': 'We may update this policy from time to time, and the updated content will be published on this page.',
            
            // 服务条款
            'terms.title': 'Terms of Service',
            'terms.effective': 'Effective Date: January 1, 2026',
            'terms.intro': 'Welcome to ANSAPRA. This platform is a tool developed by a high school student team aimed at helping peers read natural science papers. This is a CTB (China Thinks Big) competition project initiated and led by current high school students.',
            'terms.description': 'This platform is a tool based on adaptive learning technology, which aims to personalize recommendations and assist in reading natural science papers according to high school students\' cognitive frameworks by calling the official DeepSeek artificial intelligence large language model API.',
            'terms.rules.title': 'Usage Rules',
            'terms.rules.1': 'You must comply with all applicable laws and regulations.',
            'terms.rules.2': 'You may not use this platform to engage in any behavior that interferes with the normal operation of the service or damages the rights and interests of others.',
            'terms.rules.3': 'You are responsible for all activities conducted through your account.',
            'terms.disclaimer.title': 'Disclaimer',
            'terms.disclaimer.1': 'The paper summaries, interpretations, and recommendations provided by this platform are AI-generated content and are for learning assistance and reference only, not constituting professional academic advice. Please think critically and refer to the original text.',
            'terms.disclaimer.2': 'We strive to ensure service stability but do not make any guarantees regarding the continuity, uninterruptedness, or absolute security of the service.',
            'terms.disclaimer.3': 'Explanation about AI-generated code: The core functional code of this website is generated with the assistance of artificial intelligence and has been tested and adjusted by us. Our team is responsible for its functionality and security and continues to optimize and maintain it.',
            'terms.ip.title': 'Intellectual Property',
            'terms.ip.content': 'The website design, logo, and original content are owned by the ANSAPRA development team. The copyright of paper summaries, metadata, etc. cited in the platform belongs to the original paper authors or publishers, and we provide them under the principle of fair use to support educational purposes.',
            'terms.termination.title': 'Service Termination',
            'terms.termination.content': 'We reserve the right to suspend or terminate service due to user violation of these terms or at our own discretion.',
            
            // Cookie政策
            'cookie.title': 'Cookie Policy',
            'cookie.intro': 'We use Cookies (small text files) to enhance your browsing experience.',
            'cookie.purpose.title': 'Purpose of Cookies',
            'cookie.purpose.1': 'Essential Cookies: Used to maintain basic website functions, such as maintaining login status, remembering language preferences, etc.',
            'cookie.purpose.2': 'Analytical Cookies: Used for anonymous analysis of website traffic and page usage to help us understand how to improve website design.',
            'cookie.purpose.3': 'Preference Cookies: Remember your personalized settings, such as font size, theme color, etc.',
            'cookie.control.title': 'Cookie Control',
            'cookie.control.content': 'You can refuse or manage Cookies through browser settings. However, please note that disabling certain Cookies may affect the normal use of some website functions:',
            'cookie.control.1': 'Disabling essential Cookies will prevent you from maintaining login status, requiring re-login each visit',
            'cookie.control.2': 'Disabling preference Cookies will prevent your personalized settings from being saved',
            'cookie.control.3': 'Disabling analytical Cookies will not affect website functionality, but we will lose the means to understand user behavior',
            'cookie.thirdparty.title': 'Third-party Cookies',
            'cookie.thirdparty.content': 'We currently do not use any third-party Cookies for tracking or advertising. All Cookies are only used for the functional improvement and user experience optimization of this website.',
            'cookie.storage.title': 'Cookie Storage Time',
            'cookie.storage.1': 'Session Cookies: Automatically deleted when you close your browser',
            'cookie.storage.2': 'Persistent Cookies: Retained for several days to months according to settings',
            'cookie.storage.3': 'Login Status Cookies: Usually retained for 7-30 days',
            'cookie.choices.title': 'Your Choices',
            'cookie.choices.1': 'Accept All Cookies: Get the complete website experience',
            'cookie.choices.2': 'Accept Only Essential Cookies: Maintain basic functions, but personalized settings will not be saved',
            'cookie.choices.3': 'Reject All Non-essential Cookies: Implement through browser settings',
            
            // 版权说明
            'copyright.title': 'Copyright Notice',
            'copyright.intro': 'ANSAPRA is an educational non-profit project.',
            'copyright.website.title': 'Copyright of This Website',
            'copyright.website.1': 'The overall design, user interface, specific functional code, and original text content of this website are protected by copyright and are owned by the ANSAPRA development team, © 2026.',
            'copyright.website.2': 'Without written permission, any organization or individual may not copy, modify, distribute, or commercially use the design and content of this website.',
            'copyright.content.title': 'Copyright of Cited Content',
            'copyright.content.1': 'The copyright of metadata such as paper titles, abstracts, authors, journal information, etc. cited in the website to assist reading belongs to the original copyright owners.',
            'copyright.content.2': 'We strictly comply with academic norms for citations, aiming to provide research learning convenience for high school students, in line with the principle of fair use.',
            'copyright.content.3': 'All cited content clearly indicates the source and is for educational purposes only.',
            'copyright.user.title': 'User-generated Content',
            'copyright.user.1': 'The copyright of paper files, notes, and annotations uploaded by users on this platform still belongs to the users.',
            'copyright.user.2': 'Users grant this platform the right to store and display this content to provide interpretation services.',
            'copyright.user.3': 'Users can delete their uploaded content at any time.',
            'copyright.license.title': 'Usage License',
            'copyright.license.1': 'Any individual or educational institution can freely share website links for non-commercial learning purposes.',
            'copyright.license.2': 'If you need to copy, modify, or use the design or content of this website for other public purposes, please contact us in advance through the email address in "Contact Us" and obtain our written permission.',
            'copyright.license.3': 'Schools and educational institutions can use this website for classroom teaching purposes after obtaining permission.',
            'copyright.report.title': 'Infringement Report',
            'copyright.report.content': 'If you believe that the content of this website infringes your copyright, please contact us in the following ways:',
            'copyright.report.1': 'Email: 1182332400@qq.com or biokoala@outlook.com',
            'copyright.report.2': 'Please provide detailed infringement evidence and your contact information',
            'copyright.report.3': 'We will process within 10 working days after receiving the report',
            
            // 联系我们
            'contact.title': 'Contact Us',
            'contact.intro': 'We are a development team composed of high school students. The birth and optimization of this website are inseparable from user support. Therefore, we highly value your feedback.',
            'contact.team.title': 'Team Introduction',
            'contact.team.content': 'We are a high school student team participating in the CTB (China Thinks Big) Global Youth Research Innovation Forum. Our goal is to help peers better read and understand natural science academic papers.',
            'contact.project.title': 'Project Background',
            'contact.project.content': 'Through preliminary research, we found that the popularity of high school students reading scientific academic papers is relatively low, mainly due to poor paper readability, lack of personalized assistance tools, etc. For this purpose, we developed ANSAPRA (Adaptive Natural Science Academic Paper Reading Agent).',
            'contact.topics.title': 'Matters You Can Contact Us About',
            'contact.topics.1': 'Website function suggestions or error reports: If you find bugs in the website or have improvement suggestions',
            'contact.topics.2': 'Questions about privacy policy: Any questions about personal information processing',
            'contact.topics.3': 'Cooperation intentions: Schools, educational institutions, or media hoping to cooperate',
            'contact.topics.4': 'Copyright-related issues: Questions or reports involving content copyright',
            'contact.topics.5': 'Academic support: Hope to obtain more academic resources or guidance',
            'contact.topics.6': 'Any other questions: Any questions related to this website',
            'contact.methods.title': 'Contact Methods',
            'contact.methods.1': 'Main Email',
            'contact.methods.2': 'Alternate Email',
            'contact.response.title': 'Response Time',
            'contact.response.content': 'We will try our best to reply to your email within 10 working days. Since we are a student team, replies may be after class hours, please understand.',
            'contact.suggestions.title': 'Feedback Suggestions',
            'contact.suggestions.1': 'Clear email subject, such as "[Feature Suggestion]", "[Error Report]", etc.',
            'contact.suggestions.2': 'Provide detailed problem description and reproduction steps',
            'contact.suggestions.3': 'If it\'s a feature suggestion, please explain your usage scenario and expected effect',
            'contact.suggestions.4': 'Leave your contact information for further communication'
        }
    },
    
    // 初始化
    init() {
        this.currentLang = localStorage.getItem('language') || 'zh';
        document.documentElement.lang = this.currentLang;
        this.applyTranslations();
    },
    
    // 切换语言
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('language', lang);
            document.documentElement.lang = lang;
            this.applyTranslations();
            
            // 触发自定义事件
            document.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: lang }
            }));
            
            return true;
        }
        return false;
    },
    
    // 获取翻译
    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                // 回退到中文
                let zhValue = this.translations['zh'];
                for (const k2 of keys) {
                    if (zhValue && zhValue[k2] !== undefined) {
                        zhValue = zhValue[k2];
                    } else {
                        return key;
                    }
                }
                return zhValue || key;
            }
        }
        return value || key;
    },
    
    // 应用翻译到页面
    applyTranslations() {
        // 更新所有有data-i18n属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' && element.type === 'text' || 
                element.tagName === 'INPUT' && element.type === 'email' ||
                element.tagName === 'INPUT' && element.type === 'password' ||
                element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else if (element.tagName === 'IMG' && element.hasAttribute('data-i18n-alt')) {
                element.alt = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // 更新标题
        document.title = this.t('app.name') + ' - ' + this.t('app.subtitle');
    }
};

// 初始化i18n
document.addEventListener('DOMContentLoaded', () => {
    i18n.init();
});

// 导出到全局
window.i18n = i18n;
