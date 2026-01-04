import requests
import json
from config import Config

class SpringerAPI:
    def __init__(self):
        self.api_key = Config.SPRINGER_API_KEY
        self.api_url = Config.SPRINGER_API_URL
    
    def search_papers(self, keywords, max_results=5):
        """搜索相关论文"""
        
        params = {
            'q': keywords,
            'api_key': self.api_key,
            's': 1,  # Start index
            'p': max_results,  # Results per page
            'format': 'json'
        }
        
        try:
            response = requests.get(self.api_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'records' not in data:
                return []
            
            papers = []
            for record in data['records'][:max_results]:
                paper = {
                    'title': record.get('title', ''),
                    'authors': ', '.join([creator.get('creator', '') for creator in record.get('creators', [])]),
                    'journal': record.get('publicationName', ''),
                    'url': record.get('url', [{}])[0].get('value', '') if record.get('url') else '',
                    'doi': record.get('doi', ''),
                    'abstract': record.get('abstract', ''),
                    'year': record.get('publicationDate', '').split('-')[0] if record.get('publicationDate') else ''
                }
                papers.append(paper)
            
            return papers
            
        except Exception as e:
            print(f"Springer API error: {e}")
            return []
    
    def get_recommendations(self, user_interests, recent_papers):
        """根据用户兴趣和近期阅读历史推荐论文"""
        
        # 从近期论文提取关键词
        keywords = []
        for paper in recent_papers[-3:]:  # 取最近3篇论文
            if paper.get('paper_title'):
                keywords.append(paper['paper_title'])
        
        # 添加用户兴趣关键词
        if user_interests:
            if 'physics' in user_interests.lower():
                keywords.append('physics')
            if 'biology' in user_interests.lower() or 'medicine' in user_interests.lower():
                keywords.append('biology')
            if 'chemistry' in user_interests.lower():
                keywords.append('chemistry')
            if 'astronomy' in user_interests.lower():
                keywords.append('astronomy')
            if 'geology' in user_interests.lower():
                keywords.append('geology')
        
        # 组合关键词
        search_query = ' '.join(keywords[:5])
        
        if not search_query:
            search_query = 'natural science'
        
        return self.search_papers(search_query)
