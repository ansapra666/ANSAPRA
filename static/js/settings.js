/**
 * ANSAPRA - 设置管理JavaScript文件
 * 处理用户设置、问卷加载等功能
 */

// 加载使用说明
function loadInstructions() {
    const container = document.getElementById('instructions-content');
    
    const instructions = `
        <div class="content-section">
            <h3><i class="fas fa-code"></i> 技术说明</h3>
            <ul>
                <li><strong>后端框架：</strong>基于Flask、Python、Web框架构建</li>
                <li><strong>前端技术：</strong>HTML5 + CSS3 + JavaScript响应式设计</li>
                <li><strong>文件处理：</strong>集成pdfplumber、python-docx等专业解析库</li>
                <li><strong>API接口：</strong>调用DeepSeek-V1 API，支持前后端分离</li>
            </ul>
        </div>
        
        <div class="content-section">
            <h3><i class="fas fa-list-ol"></i> 使用步骤</h3>
            
            <h4>1. 阅读产品介绍与使用说明</h4>
            <ul>
                <li><strong>了解功能：</strong>详细阅读首页功能介绍，了解我们的核心开发理念</li>
                <li><strong>观看使用说明：</strong>详细阅读本页使用说明部分，了解网页基本使用方法</li>
            </ul>
            
            <h4>2. 进入"用户设置"页面，进行参数配置</h4>
            <ul>
                <li><strong>视觉设置：</strong>选择不同颜色的背景主题，调节字体形式与大小</li>
                <li><strong>阅读习惯设置：</strong>对您个人的论文解读的偏好和特质进行个性化设置</li>
                <li><strong>语言设置：</strong>切换网页语言为中文/英文</li>
                <li><strong>账户设置：</strong>退出登录</li>
            </ul>
            
            <h4>3. 进行论文解读</h4>
            <ul>
                <li><strong>上传论文：</strong>支持拖拽上传或文件选择，最大支持16MB文件；pdf、docx文件均可接受</li>
                <li><strong>文本输入：</strong>直接粘贴论文摘要或关键段落</li>
                <li><strong>生成解读：</strong>点击"开始解读"按钮，等待AI生成详细分析</li>
            </ul>
        </div>
        
        <div class="content-section">
            <h3><i class="fas fa-cogs"></i> 功能介绍</h3>
            
            <h4>A. 解读核心功能</h4>
            <ul>
                <li><strong>智能解读：</strong>将复杂学术语言转换为通俗易懂的解释</li>
                <li><strong>术语解释：</strong>对专业术语提供详细定义和背景说明</li>
                <li><strong>个性化设置：</strong>注重用户知识框架、阅读偏好差异性，提供设置功能</li>
                <li><strong>自适应算法：</strong>通过用户的阅读记录，自动更新、调整解读内容，推送相关论文</li>
            </ul>
            
            <h4>B. 视觉设置功能</h4>
            <ul>
                <li><strong>背景切换：</strong>支持不同颜色主题调节以及自定义主题设置</li>
                <li><strong>字体调节：</strong>可调整解读内容的字体大小和行间距</li>
                <li><strong>高亮显示：</strong>重要内容支持批注，支持自定义颜色标记</li>
            </ul>
            
            <h4>C. 反馈与联系功能</h4>
            <p>您可以在页面底部的"联系我们"中找到开发团队的联系方式</p>
            
            <h4>D. 其他实用功能</h4>
            <ul>
                <li><strong>多语言支持：</strong>支持中英双语解读界面</li>
                <li><strong>进度保存功能：</strong>同一用户登录时自动打开上次退出时的阅读界面</li>
            </ul>
        </div>
        
        <div class="content-section">
            <h3><i class="fas fa-lightbulb"></i> 使用小建议</h3>
            
            <h4>1. 除了论文解读，我们还鼓励...</h4>
            <ul>
                <li><strong>协作学习：</strong>邀请同学一起使用，组成学习小组讨论解读结果</li>
                <li><strong>教学辅助：</strong>教师可将我们的解读作为教学材料，帮助学生理解难点</li>
                <li><strong>写作参考：</strong>参考专业学术论文的解读逻辑和表达方式，提升自己的学术写作水平</li>
                <li><strong>知识整理：</strong>将解读结果整理成个人笔记，构建系统化的知识体系</li>
                <li><strong>原文理解：</strong>多注重论文原文内容展示界面，避免依赖AI解读导致论文内容误解</li>
            </ul>
            
            <h4>2. 网站宣传与分享</h4>
            <ul>
                <li><strong>学术圈分享：</strong>如果觉得好用，请推荐给您的研究团队和实验室</li>
                <li><strong>社交媒体：</strong>在学术社交媒体上分享您的使用体验</li>
                <li><strong>课程推荐：</strong>向授课教师推荐作为课程辅助工具</li>
            </ul>
            
            <h4>3. 网站问题反馈与建议</h4>
            <ul>
                <li><strong>及时反馈：</strong>遇到任何技术问题请立即通过"联系我们"页面报告</li>
                <li><strong>功能建议：</strong>有任何新功能想法，欢迎提交到用户建议板块</li>
                <li><strong>准确性反馈：</strong>发现解读不准确时，请提供具体段落和修正建议</li>
            </ul>
            
            <div class="alert alert-info">
                <strong>温馨提示：</strong>本服务旨在辅助学术理解，不替代专业学术评审。重要研究决策请结合专家意见。我们持续优化AI模型，欢迎您在使用过程中提供宝贵反馈，共同打造更好的学术辅助工具！
            </div>
        </div>
    `;
    
    container.innerHTML = instructions;
}

// 加载问卷
function loadQuestionnaire() {
    const container = document.getElementById('questionnaire-container');
    
    const questionnaire = `
        <h4>认知框架调查问卷</h4>
        
        <div class="question-item">
            <div class="question-text">一、基本情况</div>
        </div>
        
        <div class="question-item">
            <div class="question-text">1. 您所在的年级是？</div>
            <div class="options-grid">
                <label class="option-label">
                    <input type="radio" name="grade" value="9">
                    <span>A. 9年级</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="grade" value="10">
                    <span>B. 10年级</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="grade" value="11">
                    <span>C. 11年级</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="grade" value="12">
                    <span>D. 12年级</span>
                </label>
            </div>
        </div>
        
        <div class="question-item">
            <div class="question-text">2. 您所处的教育体系是？</div>
            <div class="options-grid">
                <label class="option-label">
                    <input type="radio" name="education_system" value="international">
                    <span>A. 国际体系</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="education_system" value="regular">
                    <span>B. 普高体系</span>
                </label>
            </div>
        </div>
        
        <div class="question-item">
            <div class="question-text">3. 您对各个自然科学学科的感兴趣程度？（1-5打分）</div>
            <div class="subject-interests">
                <div class="subject-item">
                    <span>物理学：</span>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <button type="button" class="rating-btn" data-subject="physics" data-rating="${num}" onclick="setRating(this)">${num}</button>
                        `).join('')}
                    </div>
                </div>
                <div class="subject-item">
                    <span>生物学、医学等：</span>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <button type="button" class="rating-btn" data-subject="biology" data-rating="${num}" onclick="setRating(this)">${num}</button>
                        `).join('')}
                    </div>
                </div>
                <div class="subject-item">
                    <span>化学：</span>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <button type="button" class="rating-btn" data-subject="chemistry" data-rating="${num}" onclick="setRating(this)">${num}</button>
                        `).join('')}
                    </div>
                </div>
                <div class="subject-item">
                    <span>地理地质学：</span>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <button type="button" class="rating-btn" data-subject="geology" data-rating="${num}" onclick="setRating(this)">${num}</button>
                        `).join('')}
                    </div>
                </div>
                <div class="subject-item">
                    <span>天体天文学：</span>
                    <div class="rating-scale">
                        ${[1,2,3,4,5].map(num => `
                            <button type="button" class="rating-btn" data-subject="astronomy" data-rating="${num}" onclick="setRating(this)">${num}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="question-item">
            <div class="question-text">4. 您学习自然科学课外知识的频率是？</div>
            <div class="options-grid">
                <label class="option-label">
                    <input type="radio" name="learning_frequency" value="weekly">
                    <span>A. 一周1次或更频繁</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="learning_frequency" value="monthly">
                    <span>B. 一个月1-3次</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="learning_frequency" value="rarely">
                    <span>C. 几个月1次</span>
                </label>
            </div>
        </div>
        
        <div class="question-item">
            <div class="question-text">5. 在双缝干涉实验中，使用波长为λ的单色光。如果将整个实验装置从空气移入折射率为n的透明液体中，同时将屏到双缝的距离D和双缝间距d保持不变，那么屏幕上相邻明条纹中心的间距Δx将如何变化？</div>
            <div class="options-grid">
                <label class="option-label">
                    <input type="radio" name="physics_question" value="A">
                    <span>A. 变为原来的n倍</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="physics_question" value="B">
                    <span>B. 变为原来的1/n</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="physics_question" value="C">
                    <span>C. 保持不变</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="physics_question" value="D">
                    <span>D. 无法确定，因为光的频率也改变了</span>
                </label>
            </div>
        </div>
        
        <div class="question-item">
            <div class="question-text">6. 将少量固体醋酸钠（CH₃COONa）加入到一定体积的稀醋酸（CH₃COOH）溶液中。假设溶液体积变化忽略不计，该操作会导致溶液中：</div>
            <div class="options-grid">
                <label class="option-label">
                    <input type="radio" name="chemistry_question" value="A">
                    <span>A. pH值显著下降</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="chemistry_question" value="B">
                    <span>B. 醋酸根离子浓度与氢离子浓度的比值增大</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="chemistry_question" value="C">
                    <span>C. 醋酸的电离度显著降低</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="chemistry_question" value="D">
                    <span>D. 水的离子积常数Kw增大</span>
                </label>
            </div>
        </div>
        
        <div class="question-item">
            <div class="question-text">7. 参考示例题型：水生植物Quillwort在 submerged 时采用CAM代谢，夜间固定CO₂生成苹果酸，白天释放CO₂进行光合作用。这被认为是由于白天水中CO₂被其他光合生物强烈竞争而导致稀缺。据此逻辑，以下哪种情况最可能促使陆生仙人掌在夜间（而非白天）开放其气孔吸收CO₂？</div>
            <div class="options-grid">
                <label class="option-label">
                    <input type="radio" name="biology_question" value="A">
                    <span>A. 为了在夜间更有效地进行光反应。</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="biology_question" value="B">
                    <span>B. 为了在白天关闭气孔以减少水分散失，同时仍能获取CO₂。</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="biology_question" value="C">
                    <span>C. 因为夜间土壤中水分更多，有利于CO₂吸收。</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="biology_question" value="D">
                    <span>D. 因为夜间温度更低，CO₂溶解度更高。</span>
                </label>
            </div>
        </div>
        
        <div class="question-item">
            <div class="question-text">8. 假设我们可以观测到一颗围绕类太阳恒星运行的系外行星。通过测量恒星光谱的多普勒位移，我们得到了恒星视向速度随时间变化的周期性曲线。仅凭这条曲线，我们可以最可靠地确定该系外行星的哪个参数？</div>
            <div class="options-grid">
                <label class="option-label">
                    <input type="radio" name="astronomy_question" value="A">
                    <span>A. 行星的精确质量</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="astronomy_question" value="B">
                    <span>B. 行星轨道周期的最小质量（M sin i）</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="astronomy_question" value="C">
                    <span>C. 行星的半径</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="astronomy_question" value="D">
                    <span>D. 行星大气的成分</span>
                </label>
            </div>
        </div>
        
        <div class="question-item">
            <div class="question-text">9. 在分析某河流三角洲的沉积岩芯时，科学家发现从底层到顶层，沉积物颗粒的平均粒径有"粗 -> 细 -> 粗"的垂向变化序列。这最有可能指示了该区域在沉积期间经历了：</div>
            <div class="options-grid">
                <label class="option-label">
                    <input type="radio" name="geology_question" value="A">
                    <span>A. 持续的海平面上升</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="geology_question" value="B">
                    <span>B. 一次海平面下降，随后又上升</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="geology_question" value="C">
                    <span>C. 一次海平面的上升，随后又下降（一个完整的海侵-海退旋回）</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="geology_question" value="D">
                    <span>D. 持续的构造抬升</span>
                </label>
            </div>
        </div>
        
        <div class="question-item">
            <div class="question-text">二、科学感知</div>
        </div>
        
        <div class="question-item">
            <div class="question-text">1. 您认为您对以下学习方式的喜好与习惯程度是？【1-5评分，1为极其不喜欢/习惯，5为极其喜欢/习惯】</div>
            <div class="learning-styles">
                ${['量化学习，数字和公式更能解释清楚特定知识点', 
                   '文字理解，通过清晰详细的语言表述知识点', 
                   '可视化学习，习惯借助图表甚至立体模型展现特定知识点', 
                   '互动性学习，依赖问题引导、课堂互动或视频等视听型教学方式', 
                   '实践性学习，习惯通过动手实践和严谨实验过程理解特定知识点'].map((style, index) => `
                    <div class="style-item">
                        <span>${style}</span>
                        <div class="rating-scale">
                            ${[1,2,3,4,5].map(num => `
                                <button type="button" class="rating-btn" data-style="${index}" data-rating="${num}" onclick="setRating(this)">${num}</button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="question-item">
            <div class="question-text">2. 您觉得以下哪一个描述最符合自然科学（天文学，生物学等）知识在您大脑中的样子？</div>
            <div class="options-grid">
                <label class="option-label">
                    <input type="radio" name="knowledge_structure" value="A">
                    <span>A. 一本厚重的教科书，由浅入深</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="knowledge_structure" value="B">
                    <span>B. 一个完整的蜘蛛网，互相联系，互相支撑</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="knowledge_structure" value="C">
                    <span>C. 独立的数据库，每个学科都是独一无二的存储</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="knowledge_structure" value="D">
                    <span>D. 一个全能但是无序的工具箱</span>
                </label>
            </div>
        </div>
        
        <div class="question-item">
            <div class="question-text">3. 您觉得您的科学思考力（使用自然科学等方式思考问题）如何（1-5分）</div>
            <div class="rating-scale" style="justify-content: center;">
                ${[1,2,3,4,5].map(num => `
                    <button type="button" class="rating-btn" data-skill="thinking" data-rating="${num}" onclick="setRating(this)">${num}</button>
                `).join('')}
            </div>
        </div>
        
        <div class="question-item">
            <div class="question-text">4. 您觉得您的科学洞察力（从现象到本质的能力）如何（1-5分）</div>
            <div class="rating-scale" style="justify-content: center;">
                ${[1,2,3,4,5].map(num => `
                    <button type="button" class="rating-btn" data-skill="insight" data-rating="${num}" onclick="setRating(this)">${num}</button>
                `).join('')}
            </div>
        </div>
        
        <div class="question-item">
            <div class="question-text">5. 您觉得您的科学现象敏感度（从生活中发现科学问题）（1-5分）</div>
            <div class="rating-scale" style="justify-content: center;">
                ${[1,2,3,4,5].map(num => `
                    <button type="button" class="rating-btn" data-skill="sensitivity" data-rating="${num}" onclick="setRating(this)">${num}</button>
                `).join('')}
            </div>
        </div>
        
        <div class="question-item">
            <div class="question-text">6. 您觉得您的跨学科联系能力如何（针对特定现象联系多学科知识解答）（1-5分）</div>
            <div class="rating-scale" style="justify-content: center;">
                ${[1,2,3,4,5].map(num => `
                    <button type="button" class="rating-btn" data-skill="interdisciplinary" data-rating="${num}" onclick="setRating(this)">${num}</button>
                `).join('')}
            </div>
        </div>
        
        <div class="question-item">
            <div class="question-text">7. 请阅读如下这个科学选段，回答问题：</div>
            <div class="text-excerpt">
                <p>本研究通过先进的量子相干光谱技术，发现经过特定频率（528Hz）声波处理的水分子会形成稳定的"谐振记忆结构"。当志愿者饮用这种结构化水后，其生物光子发射强度平均提升47.3%（p<0.05），线粒体ATP合成效率显著改善。实验采用双盲设计，30名志愿者随机分为两组，实验组饮用结构化水，对照组饮用普通蒸馏水。一周后，实验组在主观幸福感量表（SWLS）上的得分比对照组高出62%，同时其DNA端粒长度经PCR检测显示平均延长0.4个碱基对。这些结果表明，水分子可以通过频率信息存储和传递机制，直接优化人类细胞的量子生物场，为能量医学开辟新途径。</p>
                <p>请为这段论文选段从学术严谨性与学术逻辑性方面打分（1-5）1-很差，5-很好</p>
            </div>
            <div class="rating-scale" style="justify-content: center;">
                ${[1,2,3,4,5].map(num => `
                    <button type="button" class="rating-btn" data-assessment="paper_quality" data-rating="${num}" onclick="setRating(this)">${num}</button>
                `).join('')}
            </div>
        </div>
        
        <div class="question-item">
            <div class="question-text">8. 您刚才通过什么方面做出选段学术严谨性与逻辑性的评分判断？</div>
            <div class="options-grid">
                <label class="option-label">
                    <input type="checkbox" name="assessment_criteria" value="A">
                    <span>A. 选段对现象描述的学术语言使用</span>
                </label>
                <label class="option-label">
                    <input type="checkbox" name="assessment_criteria" value="B">
                    <span>B. 选段中提及的分析问题、测量用到的科学技术</span>
                </label>
                <label class="option-label">
                    <input type="checkbox" name="assessment_criteria" value="C">
                    <span>C. 选段中提及的实验数据</span>
                </label>
                <label class="option-label">
                    <input type="checkbox" name="assessment_criteria" value="D">
                    <span>D. 选段中涉及的科学理论（现象和本质）</span>
                </label>
                <label class="option-label">
                    <input type="checkbox" name="assessment_criteria" value="E">
                    <span>E. 单纯凭感觉评分</span>
                </label>
            </div>
        </div>
        
        <div class="question-item">
            <div class="question-text">9. 提及全球变暖与温室效应，您最想探究的问题是什么？</div>
            <div class="options-grid">
                <label class="option-label">
                    <input type="radio" name="global_warming_question" value="A">
                    <span>A. 全球变暖能直接导致或者间接导致什么后果？</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="global_warming_question" value="B">
                    <span>B. 温室效应是什么？什么是温室气体？它是怎么导致全球变暖的？</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="global_warming_question" value="C">
                    <span>C. 有什么相关技术可以改善温室效应？我们可以做什么去改善温室效应？</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="global_warming_question" value="D">
                    <span>D. 温室效应背后的学科领域是什么？哪些学科可以帮助理解或是改善温室效应？</span>
                </label>
                <label class="option-label">
                    <input type="radio" name="global_warming_question" value="E">
                    <span>E. 除了温室效应，还有什么会导致全球变暖？</span>
                </label>
            </div>
        </div>
    `;
    
    container.innerHTML = questionnaire;
}

// 设置评分
function setRating(button) {
    const rating = parseInt(button.dataset.rating);
    const category = button.dataset.subject || button.dataset.skill || button.dataset.style || button.dataset.assessment;
    
    // 移除同一类别中其他按钮的活动状态
    const container = button.closest('.rating-scale');
    container.querySelectorAll('.rating-btn').forEach(btn => {
        if (btn.dataset.subject === category || 
            btn.dataset.skill === category || 
            btn.dataset.style === category || 
            btn.dataset.assessment === category) {
            btn.classList.remove('active');
        }
    });
    
    // 设置当前按钮为活动状态
    button.classList.add('active');
}

// 收集问卷数据
function collectQuestionnaireData() {
    const questionnaire = {};
    
    // 基本信息
    questionnaire.grade = document.querySelector('input[name="grade"]:checked')?.value;
    questionnaire.education_system = document.querySelector('input[name="education_system"]:checked')?.value;
    questionnaire.learning_frequency = document.querySelector('input[name="learning_frequency"]:checked')?.value;
    
    // 学科兴趣
    questionnaire.subject_interests = {};
    ['physics', 'biology', 'chemistry', 'geology', 'astronomy'].forEach(subject => {
        const activeBtn = document.querySelector(`.rating-btn[data-subject="${subject}"].active`);
        if (activeBtn) {
            questionnaire.subject_interests[subject] = parseInt(activeBtn.dataset.rating);
        }
    });
    
    // 学科问题
    questionnaire.physics_question = document.querySelector('input[name="physics_question"]:checked')?.value;
    questionnaire.chemistry_question = document.querySelector('input[name="chemistry_question"]:checked')?.value;
    questionnaire.biology_question = document.querySelector('input[name="biology_question"]:checked')?.value;
    questionnaire.astronomy_question = document.querySelector('input[name="astronomy_question"]:checked')?.value;
    questionnaire.geology_question = document.querySelector('input[name="geology_question"]:checked')?.value;
    
    // 学习风格
    questionnaire.learning_styles = {};
    for (let i = 0; i < 5; i++) {
        const activeBtn = document.querySelector(`.rating-btn[data-style="${i}"].active`);
        if (activeBtn) {
            questionnaire.learning_styles[`style_${i}`] = parseInt(activeBtn.dataset.rating);
        }
    }
    
    // 知识结构
    questionnaire.knowledge_structure = document.querySelector('input[name="knowledge_structure"]:checked')?.value;
    
    // 能力评估
    ['thinking', 'insight', 'sensitivity', 'interdisciplinary'].forEach(skill => {
        const activeBtn = document.querySelector(`.rating-btn[data-skill="${skill}"].active`);
        if (activeBtn) {
            questionnaire[`${skill}_ability`] = parseInt(activeBtn.dataset.rating);
        }
    });
    
    // 论文质量评估
    const paperQualityBtn = document.querySelector('.rating-btn[data-assessment="paper_quality"].active');
    if (paperQualityBtn) {
        questionnaire.paper_quality_assessment = parseInt(paperQualityBtn.dataset.rating);
    }
    
    // 评估标准
    const criteria = document.querySelectorAll('input[name="assessment_criteria"]:checked');
    questionnaire.assessment_criteria = Array.from(criteria).map(cb => cb.value);
    
    // 全球变暖问题
    questionnaire.global_warming_question = document.querySelector('input[name="global_warming_question"]:checked')?.value;
    
    return questionnaire;
}

// 保存问卷
async function saveQuestionnaire(questionnaire) {
    try {
        const response = await fetch('/api/save_questionnaire', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questionnaire })
        });
        
        if (!response.ok) {
            console.error('保存问卷失败');
        }
    } catch (error) {
        console.error('保存问卷失败:', error);
    }
}

// 初始化设置
function initSettings() {
    // 设置选项卡切换
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // 移除所有选项卡的活动状态
            document.querySelectorAll('.settings-tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // 隐藏所有设置面板
            document.querySelectorAll('.settings-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            
            // 激活当前选项卡
            tab.classList.add('active');
            
            // 显示对应的设置面板
            document.getElementById(`${tabName}-settings`).classList.add('active');
        });
    });
    
    // 加载阅读习惯设置
    loadReadingSettings();
    
    // 加载视觉设置
    loadVisualSettings();
}

// 加载用户设置
async function loadUserSettings() {
    if (currentUser?.guest) {
        userSettings = getDefaultSettings();
        return;
    }
    
    try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        if (response.ok && data.settings) {
            userSettings = data.settings;
        } else {
            userSettings = getDefaultSettings();
        }
    } catch (error) {
        console.error('加载用户设置失败:', error);
        userSettings = getDefaultSettings();
    }
}

// 获取默认设置
function getDefaultSettings() {
    return {
        reading: {
            preparation_level: 'B',
            reading_reason: 'B',
            time_preference: 'B',
            interpretation_style: 'A',
            interpretation_depth: 'B',
            self_test_content: ['A', 'B'],
            preferred_charts: ['A', 'B']
        },
        visual: {
            theme: 'light-blue',
            font_size: '18px',
            font_family: 'Microsoft YaHei, sans-serif',
            custom_background: null
        },
        language: {
            interface_language: 'zh'
        }
    };
}

// 应用用户设置
function applyUserSettings() {
    if (!userSettings) return;
    
    // 应用视觉设置
    applyVisualSettings();
    
    // 应用语言设置
    applyLanguageSettings();
    
    // 更新设置界面
    updateSettingsUI();
}

// 应用视觉设置
function applyVisualSettings() {
    if (!userSettings?.visual) return;
    
    const visual = userSettings.visual;
    const root = document.documentElement;
    const body = document.body;
    
    // 应用主题
    const currentTheme = body.classList[0]?.startsWith('theme-') ? body.classList[0] : null;
    if (currentTheme) {
        body.classList.remove(currentTheme);
    }
    body.classList.add(visual.theme);
    
    // 应用字体大小
    document.querySelectorAll('.font-size-16, .font-size-18, .font-size-20, .font-size-22, .font-size-24, .font-size-26, .font-size-28, .font-size-30').forEach(el => {
        el.classList.remove('font-size-16', 'font-size-18', 'font-size-20', 'font-size-22', 'font-size-24', 'font-size-26', 'font-size-28', 'font-size-30');
    });
    document.body.classList.add(`font-size-${parseInt(visual.font_size)}`);
    
    // 应用字体家族
    document.querySelectorAll('.font-family-sans, .font-family-serif, .font-family-kai, .font-family-eczar, .font-family-cabin').forEach(el => {
        el.classList.remove('font-family-sans', 'font-family-serif', 'font-family-kai', 'font-family-eczar', 'font-family-cabin');
    });
    
    if (visual.font_family.includes('Kai')) {
        body.classList.add('font-family-kai');
    } else if (visual.font_family.includes('Serif')) {
        body.classList.add('font-family-serif');
    } else if (visual.font_family.includes('Eczar')) {
        body.classList.add('font-family-eczar');
    } else if (visual.font_family.includes('Cabin')) {
        body.classList.add('font-family-cabin');
    } else {
        body.classList.add('font-family-sans');
    }
    
    // 应用自定义背景
    if (visual.custom_background) {
        body.classList.add('custom-background');
        body.style.backgroundImage = `url(${visual.custom_background})`;
    } else {
        body.classList.remove('custom-background');
        body.style.backgroundImage = '';
    }
}

// 应用语言设置
function applyLanguageSettings() {
    if (!userSettings?.language) return;
    
    const lang = userSettings.language.interface_language;
    
    // 更新语言选择器
    document.querySelectorAll('input[name="language"]').forEach(radio => {
        radio.checked = radio.value === lang;
    });
    
    // 这里可以添加更多语言切换逻辑
    // 注意：完整的双语切换需要更复杂的实现
}

// 更新设置界面
function updateSettingsUI() {
    if (!userSettings) return;
    
    // 更新阅读习惯设置
    updateReadingSettingsUI();
    
    // 更新视觉设置
    updateVisualSettingsUI();
}

// 加载阅读习惯设置
function loadReadingSettings() {
    const container = document.getElementById('reading-settings');
    
    const settingsForm = `
        <form id="reading-settings-form">
            <div class="form-group">
                <label>阅读一篇专业自然科学论文之前，您会在论文所在领域知识方面做什么程度的准备？</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="preparation_level" value="A" onchange="updateSetting('reading', 'preparation_level', 'A')">
                        <span>A、几乎不做准备</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="preparation_level" value="B" onchange="updateSetting('reading', 'preparation_level', 'B')">
                        <span>B、做一些准备</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="preparation_level" value="C" onchange="updateSetting('reading', 'preparation_level', 'C')">
                        <span>C、做较为深入的准备</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>您阅读自然科学论文的原因是？</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="reading_reason" value="A" onchange="updateSetting('reading', 'reading_reason', 'A')">
                        <span>A. 目标驱动者：为完成特定任务（如作业、比赛）而阅读，追求高效和直接</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="reading_reason" value="B" onchange="updateSetting('reading', 'reading_reason', 'B')">
                        <span>B. 知识探索者：受学科兴趣驱动，希望拓宽知识面，不急于求成，不追求深入理解</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="reading_reason" value="C" onchange="updateSetting('reading', 'reading_reason', 'C')">
                        <span>C. 深度学习者：为了深入理解并研究某一领域知识，论文知识之外，同时重视研究方法和应用</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="reading_reason" value="D" onchange="updateSetting('reading', 'reading_reason', 'D')">
                        <span>D. 科学了解者：希望通过论文解读提升个人科学素养和整体科学感知能力</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>您愿意在多长时间内解读一篇自然科学论文？</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="time_preference" value="A" onchange="updateSetting('reading', 'time_preference', 'A')">
                        <span>A、10分钟内</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="time_preference" value="B" onchange="updateSetting('reading', 'time_preference', 'B')">
                        <span>B、10-30分钟内</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="time_preference" value="C" onchange="updateSetting('reading', 'time_preference', 'C')">
                        <span>C、30分钟及以上</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>您喜好的自然科学论文解读风格与方式是？</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="interpretation_style" value="A" onchange="updateSetting('reading', 'interpretation_style', 'A')">
                        <span>A. 生动形象，语言偏口语化，能联系生活中最简单的例子和类比解读论文</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="interpretation_style" value="B" onchange="updateSetting('reading', 'interpretation_style', 'B')">
                        <span>B. 量化解读，尽量通过数据和公式解读论文</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="interpretation_style" value="C" onchange="updateSetting('reading', 'interpretation_style', 'C')">
                        <span>C. 专业解读，通过较为正式的语言和专业严谨的表达解读论文，对论文内容稍作调整</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="interpretation_style" value="D" onchange="updateSetting('reading', 'interpretation_style', 'D')">
                        <span>D. 原汁原味，保留原文的表达风格和表述方式，接受长难句、专业术语解读方式</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="interpretation_style" value="E" onchange="updateSetting('reading', 'interpretation_style', 'E')">
                        <span>E. 逐步推导，通过问题引入的方式，类似于课堂教学的方式逐步介绍知识，强调互动性</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>您喜好的自然科学论文解读深度是？</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="interpretation_depth" value="A" onchange="updateSetting('reading', 'interpretation_depth', 'A')">
                        <span>A. 简洁概括</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="interpretation_depth" value="B" onchange="updateSetting('reading', 'interpretation_depth', 'B')">
                        <span>B. 平衡详细</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="interpretation_depth" value="C" onchange="updateSetting('reading', 'interpretation_depth', 'C')">
                        <span>C. 详细深入</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>您希望读后自测部分包含哪些内容？（可多选）</label>
                <div class="checkbox-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="self_test_content" value="A" onchange="updateCheckboxSetting('reading', 'self_test_content', 'A', this.checked)">
                        <span>A. 相关定义填空题</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="self_test_content" value="B" onchange="updateCheckboxSetting('reading', 'self_test_content', 'B', this.checked)">
                        <span>B. 易错易混选择题</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="self_test_content" value="C" onchange="updateCheckboxSetting('reading', 'self_test_content', 'C', this.checked)">
                        <span>C. 公式逻辑默写题</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>您偏好的图表形式是？（可多选）</label>
                <div class="checkbox-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="preferred_charts" value="A" onchange="updateCheckboxSetting('reading', 'preferred_charts', 'A', this.checked)">
                        <span>A. 思维导图（树状）</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="preferred_charts" value="B" onchange="updateCheckboxSetting('reading', 'preferred_charts', 'B', this.checked)">
                        <span>B. 流程图与逻辑图</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="preferred_charts" value="C" onchange="updateCheckboxSetting('reading', 'preferred_charts', 'C', this.checked)">
                        <span>C. 表格</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="preferred_charts" value="D" onchange="updateCheckboxSetting('reading', 'preferred_charts', 'D', this.checked)">
                        <span>D. 统计图（折线图、柱状图等）</span>
                    </label>
                </div>
            </div>
        </form>
    `;
    
    container.innerHTML = settingsForm;
}

// 更新阅读习惯设置UI
function updateReadingSettingsUI() {
    if (!userSettings?.reading) return;
    
    const reading = userSettings.reading;
    
    // 更新单选按钮
    Object.keys(reading).forEach(key => {
        if (typeof reading[key] === 'string') {
            const radio = document.querySelector(`input[name="${key}"][value="${reading[key]}"]`);
            if (radio) {
                radio.checked = true;
            }
        }
    });
    
    // 更新复选框
    if (Array.isArray(reading.self_test_content)) {
        document.querySelectorAll('input[name="self_test_content"]').forEach(checkbox => {
            checkbox.checked = reading.self_test_content.includes(checkbox.value);
        });
    }
    
    if (Array.isArray(reading.preferred_charts)) {
        document.querySelectorAll('input[name="preferred_charts"]').forEach(checkbox => {
            checkbox.checked = reading.preferred_charts.includes(checkbox.value);
        });
    }
}

// 加载视觉设置
function loadVisualSettings() {
    const container = document.getElementById('visual-settings');
    
    const settingsForm = `
        <form id="visual-settings-form">
            <div class="form-group">
                <label>背景主题</label>
                <div class="color-picker">
                    <div class="color-option" style="background-color: #f5f7fa;" data-theme="light-blue" onclick="changeTheme('light-blue')"></div>
                    <div class="color-option" style="background-color: #fce4ec;" data-theme="light-pink" onclick="changeTheme('light-pink')"></div>
                    <div class="color-option" style="background-color: #f1f8e9;" data-theme="light-green" onclick="changeTheme('light-green')"></div>
                    <div class="color-option" style="background-color: #f3e5f5;" data-theme="light-purple" onclick="changeTheme('light-purple')"></div>
                </div>
            </div>
            
            <div class="form-group">
                <label>字体大小</label>
                <div class="slider-container">
                    <input type="range" id="font-size-slider" min="16" max="30" step="2" value="18" oninput="changeFontSize(this.value)">
                    <div class="slider-values">
                        <span>16px</span>
                        <span>18px</span>
                        <span>20px</span>
                        <span>22px</span>
                        <span>24px</span>
                        <span>26px</span>
                        <span>28px</span>
                        <span>30px</span>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label>字体家族</label>
                <div class="font-picker">
                    <div class="font-option" data-font="sans" onclick="changeFontFamily('Microsoft YaHei, sans-serif')">微软雅黑</div>
                    <div class="font-option" data-font="serif" onclick="changeFontFamily('Noto Serif SC, serif')">思源宋体</div>
                    <div class="font-option" data-font="kai" onclick="changeFontFamily('LXGW WenKai TC, cursive')">霞鹜文楷</div>
                    <div class="font-option" data-font="eczar" onclick="changeFontFamily('Eczar, serif')">Eczar 英文</div>
                    <div class="font-option" data-font="cabin" onclick="changeFontFamily('Cabin, sans-serif')">Cabin 英文</div>
                </div>
            </div>
            
            <div class="form-group">
                <label>自定义背景图片</label>
                <input type="file" id="background-image" accept="image/*" onchange="handleBackgroundImage(event)" style="margin-bottom: 10px;">
                <button type="button" class="btn btn-small" onclick="clearCustomBackground()">清除自定义背景</button>
            </div>
        </form>
    `;
    
    container.innerHTML = settingsForm;
}

// 更新视觉设置UI
function updateVisualSettingsUI() {
    if (!userSettings?.visual) return;
    
    const visual = userSettings.visual;
    
    // 更新主题选择
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === visual.theme) {
            option.classList.add('active');
        }
    });
    
    // 更新字体大小滑块
    const slider = document.getElementById('font-size-slider');
    if (slider) {
        const fontSize = parseInt(visual.font_size);
        slider.value = fontSize;
    }
    
    // 更新字体选择
    document.querySelectorAll('.font-option').forEach(option => {
        option.classList.remove('active');
        
        const fontMap = {
            'Microsoft YaHei, sans-serif': 'sans',
            'Noto Serif SC, serif': 'serif',
            'LXGW WenKai TC, cursive': 'kai',
            'Eczar, serif': 'eczar',
            'Cabin, sans-serif': 'cabin'
        };
        
        if (option.dataset.font === fontMap[visual.font_family]) {
            option.classList.add('active');
        }
    });
}

// 更新设置
async function updateSetting(category, key, value) {
    if (!userSettings) return;
    
    if (!userSettings[category]) {
        userSettings[category] = {};
    }
    
    userSettings[category][key] = value;
    
    // 立即应用设置
    applyUserSettings();
    
    // 保存到后端（如果不是游客）
    if (!currentUser?.guest) {
        await saveSettings();
    }
}

// 更新复选框设置
async function updateCheckboxSetting(category, key, value, checked) {
    if (!userSettings) return;
    
    if (!userSettings[category]) {
        userSettings[category] = {};
    }
    
    if (!userSettings[category][key]) {
        userSettings[category][key] = [];
    }
    
    if (checked && !userSettings[category][key].includes(value)) {
        userSettings[category][key].push(value);
    } else if (!checked) {
        userSettings[category][key] = userSettings[category][key].filter(item => item !== value);
    }
    
    // 立即应用设置
    applyUserSettings();
    
    // 保存到后端（如果不是游客）
    if (!currentUser?.guest) {
        await saveSettings();
    }
}

// 保存设置
async function saveSettings() {
    if (currentUser?.guest) {
        alert('游客模式下设置不会被保存');
        return;
    }
    
    try {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'all',
                data: userSettings
            })
        });
        
        if (!response.ok) {
            console.error('保存设置失败');
        }
    } catch (error) {
        console.error('保存设置失败:', error);
    }
}

// 更改主题
function changeTheme(theme) {
    updateSetting('visual', 'theme', theme);
}

// 更改字体大小
function changeFontSize(size) {
    updateSetting('visual', 'font_size', `${size}px`);
}

// 更改字体家族
function changeFontFamily(font) {
    updateSetting('visual', 'font_family', font);
}

// 更改语言
function changeLanguage(lang) {
    updateSetting('language', 'interface_language', lang);
}

// 处理背景图片
function handleBackgroundImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageUrl = e.target.result;
        updateSetting('visual', 'custom_background', imageUrl);
    };
    reader.readAsDataURL(file);
}

// 清除自定义背景
function clearCustomBackground() {
    updateSetting('visual', 'custom_background', null);
    document.getElementById('background-image').value = '';
}

// 删除账户
async function deleteAccount() {
    if (!confirm('确定要删除账户吗？这将永久清除所有数据，包括解读历史和个性化设置。')) {
        return;
    }
    
    try {
        const response = await fetch('/api/delete_account', {
            method: 'POST'
        });
        
        if (response.ok) {
            alert('账户已删除');
            location.reload();
        } else {
            const data = await response.json();
            alert(data.error || '删除账户失败');
        }
    } catch (error) {
        console.error('删除账户失败:', error);
        alert('删除账户失败');
    }
}
