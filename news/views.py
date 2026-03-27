import logging
from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from newsapi import NewsApiClient

logger = logging.getLogger(__name__)

def index(request):
    return render(request, 'index.html')

def get_news(request):
    category = request.GET.get('category', 'politics').lower()
    
    # Init
    newsapi = NewsApiClient(api_key=settings.NEWS_API_KEY)
    
    try:
        response = newsapi.get_everything(
            q=category,
            language='en',
            sort_by='relevancy',
        )
        
        articles = response.get('articles', [])
        
        formatted_articles = [
            {
                'title': article.get('title'),
                'description': article.get('description'),
                'source': article.get('source', {}).get('name'),
                'publishedAt': article.get('publishedAt'),
                'url': article.get('url'),
            }
            for article in articles if article.get('title') and article.get('title') != '[Removed]'
        ]
        
        formatted_articles = formatted_articles[:20]
        
        return JsonResponse({'status': 'success', 'articles': formatted_articles})
    except Exception as e:
        logger.exception("Failed to fetch news")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
