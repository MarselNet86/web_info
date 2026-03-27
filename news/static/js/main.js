const tabs = document.querySelectorAll('.tab');
const newsList = document.getElementById('news-list');
const sidebarTitle = document.getElementById('sidebar-title');

const mainTitle = document.getElementById('main-title');
const mainMeta = document.getElementById('main-meta');
const mainContent = document.getElementById('main-content');

let currentCategory = 'politics';
let articlesData = [];

function renderSkeletons() {
    newsList.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const skeletonHtml = `
            <div class="note-item">
                <div class="skeleton skeleton-meta"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-title" style="width: 60%;"></div>
                <div class="skeleton skeleton-text" style="width: 90%; margin-top: 10px;"></div>
                <div class="skeleton skeleton-text" style="width: 70%;"></div>
            </div>
        `;
        newsList.innerHTML += skeletonHtml;
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function fetchNews(category) {
    renderSkeletons();
    
    try {
        const res = await fetch(`/api/news/?category=${category}`);
        const data = await res.json();
        
        if (data.status === 'success') {
            articlesData = data.articles;
            renderNewsList(articlesData);
            
            if (articlesData.length > 0) {
                selectArticle(0);
            } else {
                mainTitle.textContent = "No articles found";
                mainMeta.textContent = "";
                mainContent.innerHTML = "<p>Try another category.</p>";
            }
        } else {
            newsList.innerHTML = `<div style="padding: 20px;">Error loading news.</div>`;
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        newsList.innerHTML = `<div style="padding: 20px;">Failed to fetch API.</div>`;
    }
}

function renderNewsList(articles) {
    newsList.innerHTML = '';
    articles.forEach((article, index) => {
        const item = document.createElement('div');
        item.className = 'note-item';
        item.dataset.index = index;
        
        item.innerHTML = `
            <div class="note-meta">
                <span>${article.source || 'News'}</span>
                <span>${formatDate(article.publishedAt)}</span>
            </div>
            <div class="note-title">${article.title}</div>
            <div class="note-preview">${article.description || 'No description available.'}</div>
        `;
        
        item.addEventListener('click', () => selectArticle(index));
        newsList.appendChild(item);
    });
}

function selectArticle(index) {
    // Update selection state
    document.querySelectorAll('.note-item').forEach(el => el.classList.remove('selected'));
    const selectedItem = document.querySelector(`.note-item[data-index="${index}"]`);
    if (selectedItem) selectedItem.classList.add('selected');
    
    // Update main editor
    const article = articlesData[index];
    if (!article) return;
    
    mainTitle.textContent = article.title;
    mainMeta.textContent = `${article.source || 'Unknown'} • ${formatDate(article.publishedAt)}`;
    
    // Render content
    mainContent.innerHTML = `
        <p>${article.description || 'No detailed description available.'}</p>
        ${article.url ? `<a href="${article.url}" target="_blank" class="read-more-btn">Read Full Article</a>` : ''}
    `;
}

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Keep z-index logic if needed or handled purely via css state
        
        currentCategory = tab.dataset.category;
        sidebarTitle.textContent = `${currentCategory} News`;
        fetchNews(currentCategory);
    });
});

// Initial fetch
fetchNews(currentCategory);
