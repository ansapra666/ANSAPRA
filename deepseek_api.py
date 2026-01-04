import requests
import json
from config import Config

class DeepSeekAPI:
    def __init__(self):
        self.api_key = Config.DEEPSEEK_API_KEY
        self.api_url = Config.DEEPSEEK_API_URL
        self.model = Config.DEEPSEEK_MODEL
    
    def generate_interpretation(self, user_data, paper_content):
        """生成论文解读"""
        
        # 构建系统提示词
        system_prompt = """你是一位专业的自然科学教育专家，专门帮助高中生理解复杂的学术论文。
        请根据用户的知识水平、学习偏好和论文内容，生成适合高中生的解读。
        解读要求：
        1. 语言简洁清晰，避免冗长句子
        2. 逻辑清晰，分小标题组织内容
        3. 遵循论文本身的段落逻辑
        4. 关注用户知识框架的薄弱点
        5. 发挥用户在自然科学方面的长处
        6. 在最后附上术语解读区
        7. 使用中文输出
        """
        
        # 构建用户消息
        user_message = f"""
        用户是一位高中生，需要解读一篇自然科学学术论文。
        
        用户个性化设置：
        - 阅读准备程度：{user_data.get('reading_prep', '中等')}
        - 阅读目的：{user_data.get('reading_purpose', '知识探索')}
        - 可用时间：{user_data.get('reading_time', '10-30分钟')}
        - 解读风格偏好：{user_data.get('reading_style', '生动形象')}
        - 解读深度：{user_data.get('reading_depth', '平衡详细')}
        - 测试偏好：{user_data.get('test_preferences', '选择题')}
        - 图表偏好：{user_data.get('chart_preferences', '思维导图')}
        
        用户过往阅读历史：{user_data.get('reading_history', '暂无')}
        
        用户知识框架问卷数据：{user_data.get('questionnaire_data', '{}')}
        
        需要解读的论文内容：
        {paper_content}
        
        请根据以上信息生成一篇符合用户个性化需求的解读内容。
        """
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "max_tokens": 8000,  # 不限制长度，但设置足够大的值
            "temperature": 0.7,
            "stream": False
        }
        
        try:
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=120)
            response.raise_for_status()
            
            result = response.json()
            interpretation = result['choices'][0]['message']['content']
            
            return {
                "success": True,
                "interpretation": interpretation,
                "usage": result.get('usage', {})
            }
            
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"API请求失败: {str(e)}"
            }
        except (KeyError, json.JSONDecodeError) as e:
            return {
                "success": False,
                "error": f"API响应解析失败: {str(e)}"
            }
    
    def generate_mindmap(self, paper_content):
        """生成思维导图数据"""
        
        prompt = f"""请基于以下论文内容，生成一个结构化的思维导图数据（JSON格式）。
        思维导图应该包含论文的主要部分、关键概念和逻辑关系。
        
        论文内容：
        {paper_content[:2000]}  # 限制内容长度
        
        返回格式：
        {{
            "title": "论文标题或主题",
            "nodes": [
                {{
                    "id": "node1",
                    "label": "节点标签",
                    "children": [
                        {{"id": "child1", "label": "子节点1"}},
                        {{"id": "child2", "label": "子节点2"}}
                    ]
                }}
            ]
        }}
        """
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "你是一个思维导图生成助手，请返回有效的JSON数据。"},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 2000,
            "temperature": 0.3,
            "response_format": {"type": "json_object"}
        }
        
        try:
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=60)
            response.raise_for_status()
            
            result = response.json()
            mindmap_data = result['choices'][0]['message']['content']
            
            return {
                "success": True,
                "mindmap": json.loads(mindmap_data)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
