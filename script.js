// Marketing Dashboard JavaScript

class MarketingDashboard {
    constructor() {
        this.articles = [];
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.render();
    }

    // Data management
    loadData() {
        const saved = localStorage.getItem('marketing-articles');
        if (saved) {
            this.articles = JSON.parse(saved);
        } else {
            // Sample data for demonstration
            this.articles = [
                {
                    id: 1,
                    name: "Article Marketing Digital",
                    price: 150.50,
                    views: 1200,
                    clicks: 89,
                    likes: 45,
                    follows: 12
                },
                {
                    id: 2,
                    name: "Campagne SEO Premium",
                    price: 299.99,
                    views: 2500,
                    clicks: 186,
                    likes: 78,
                    follows: 23
                }
            ];
            this.saveData();
        }
    }

    saveData() {
        localStorage.setItem('marketing-articles', JSON.stringify(this.articles));
    }

    generateId() {
        return Date.now() + Math.random();
    }

    // CRUD operations
    addArticle(articleData) {
        const newArticle = {
            id: this.generateId(),
            ...articleData
        };
        this.articles.push(newArticle);
        this.saveData();
        this.render();
        this.showNotification('Article ajouté avec succès!', 'success');
    }

    editArticle(id, articleData) {
        const index = this.articles.findIndex(article => article.id === id);
        if (index !== -1) {
            this.articles[index] = { id, ...articleData };
            this.saveData();
            this.render();
            this.showNotification('Article modifié avec succès!', 'success');
        }
    }

    deleteArticle(id) {
        const index = this.articles.findIndex(article => article.id === id);
        if (index !== -1) {
            const article = this.articles[index];
            if (confirm(`Êtes-vous sûr de vouloir supprimer "${article.name}" ?`)) {
                this.articles.splice(index, 1);
                this.saveData();
                this.render();
                this.showNotification('Article supprimé avec succès!', 'warning');
            }
        }
    }

    // Statistics calculation
    calculateStats() {
        return this.articles.reduce((stats, article) => {
            stats.totalViews += article.views;
            stats.totalClicks += article.clicks;
            stats.totalLikes += article.likes;
            stats.totalFollows += article.follows;
            return stats;
        }, {
            totalViews: 0,
            totalClicks: 0,
            totalLikes: 0,
            totalFollows: 0
        });
    }

    // Rendering
    render() {
        this.renderStats();
        this.renderArticles();
    }

    renderStats() {
        const stats = this.calculateStats();
        
        document.getElementById('totalViews').textContent = this.formatNumber(stats.totalViews);
        document.getElementById('totalClicks').textContent = this.formatNumber(stats.totalClicks);
        document.getElementById('totalLikes').textContent = this.formatNumber(stats.totalLikes);
        document.getElementById('totalFollows').textContent = this.formatNumber(stats.totalFollows);
    }

    renderArticles() {
        const container = document.getElementById('articlesContainer');
        const emptyState = document.getElementById('emptyState');
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        
        const filteredArticles = this.articles.filter(article =>
            article.name.toLowerCase().includes(searchTerm)
        );

        if (filteredArticles.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        emptyState.style.display = 'none';

        container.innerHTML = filteredArticles.map(article => `
            <div class="article-card" data-id="${article.id}">
                <div class="article-header">
                    <h3 class="article-title">${this.escapeHtml(article.name)}</h3>
                    <span class="article-price">${this.formatPrice(article.price)}</span>
                </div>
                <div class="article-stats">
                    <div class="stat-item">
                        <span class="stat-value">${this.formatNumber(article.views)}</span>
                        <span class="stat-label">Vues</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.formatNumber(article.clicks)}</span>
                        <span class="stat-label">Clics</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.formatNumber(article.likes)}</span>
                        <span class="stat-label">Likes</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.formatNumber(article.follows)}</span>
                        <span class="stat-label">Follows</span>
                    </div>
                </div>
                <div class="article-actions">
                    <button class="edit-btn" onclick="dashboard.openEditModal(${article.id})">
                        ✏️ Modifier
                    </button>
                    <button class="delete-btn" onclick="dashboard.deleteArticle(${article.id})">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Event handlers
    bindEvents() {
        // Form submission
        document.getElementById('articleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', () => {
            this.renderArticles();
        });

        // Export PDF
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToPDF();
        });

        // Modal events
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeEditModal();
        });

        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.closeEditModal();
        });

        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditSubmit();
        });

        // Close modal on outside click
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') {
                this.closeEditModal();
            }
        });
    }

    handleFormSubmit() {
        const formData = {
            name: document.getElementById('articleName').value.trim(),
            price: parseFloat(document.getElementById('articlePrice').value),
            views: parseInt(document.getElementById('articleViews').value),
            clicks: parseInt(document.getElementById('articleClicks').value),
            likes: parseInt(document.getElementById('articleLikes').value),
            follows: parseInt(document.getElementById('articleFollows').value)
        };

        if (!formData.name) {
            this.showNotification('Le nom de l\'article est requis!', 'error');
            return;
        }

        this.addArticle(formData);
        document.getElementById('articleForm').reset();
    }

    // Modal functionality
    openEditModal(id) {
        const article = this.articles.find(a => a.id === id);
        if (!article) return;

        this.currentEditId = id;
        
        document.getElementById('editName').value = article.name;
        document.getElementById('editPrice').value = article.price;
        document.getElementById('editViews').value = article.views;
        document.getElementById('editClicks').value = article.clicks;
        document.getElementById('editLikes').value = article.likes;
        document.getElementById('editFollows').value = article.follows;

        document.getElementById('editModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeEditModal() {
        document.getElementById('editModal').classList.remove('active');
        document.body.style.overflow = 'auto';
        this.currentEditId = null;
    }

    handleEditSubmit() {
        if (!this.currentEditId) return;

        const formData = {
            name: document.getElementById('editName').value.trim(),
            price: parseFloat(document.getElementById('editPrice').value),
            views: parseInt(document.getElementById('editViews').value),
            clicks: parseInt(document.getElementById('editClicks').value),
            likes: parseInt(document.getElementById('editLikes').value),
            follows: parseInt(document.getElementById('editFollows').value)
        };

        if (!formData.name) {
            this.showNotification('Le nom de l\'article est requis!', 'error');
            return;
        }

        this.editArticle(this.currentEditId, formData);
        this.closeEditModal();
    }

    // PDF Export
    async exportToPDF() {
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.classList.add('loading');
        exportBtn.textContent = '📄 Génération...';

        try {
            // Create a clean version for PDF
            const element = document.createElement('div');
            element.innerHTML = `
                <div style="padding: 20px; font-family: Arial, sans-serif;">
                    <h1 style="text-align: center; color: #2563eb; margin-bottom: 30px;">
                        📊 Rapport Marketing Dashboard
                    </h1>
                    <p style="text-align: center; color: #6b7280; margin-bottom: 40px;">
                        Généré le ${new Date().toLocaleDateString('fr-FR')}
                    </p>
                    
                    ${this.generateStatsHTML()}
                    ${this.generateArticlesHTML()}
                </div>
            `;

            const opt = {
                margin: 1,
                filename: 'rapport-marketing.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(element).save();
            this.showNotification('PDF exporté avec succès!', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'export PDF:', error);
            this.showNotification('Erreur lors de l\'export PDF', 'error');
        } finally {
            exportBtn.classList.remove('loading');
            exportBtn.textContent = '📄 Exporter PDF';
        }
    }

    generateStatsHTML() {
        const stats = this.calculateStats();
        return `
            <div style="margin-bottom: 40px;">
                <h2 style="color: #374151; margin-bottom: 20px;">Statistiques Globales</h2>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                    <div style="padding: 15px; background: #f9fafb; border-radius: 8px; text-align: center;">
                        <h3 style="font-size: 24px; margin-bottom: 5px; color: #2563eb;">${this.formatNumber(stats.totalViews)}</h3>
                        <p style="color: #6b7280;">Total Vues</p>
                    </div>
                    <div style="padding: 15px; background: #f9fafb; border-radius: 8px; text-align: center;">
                        <h3 style="font-size: 24px; margin-bottom: 5px; color: #2563eb;">${this.formatNumber(stats.totalClicks)}</h3>
                        <p style="color: #6b7280;">Total Clics</p>
                    </div>
                    <div style="padding: 15px; background: #f9fafb; border-radius: 8px; text-align: center;">
                        <h3 style="font-size: 24px; margin-bottom: 5px; color: #2563eb;">${this.formatNumber(stats.totalLikes)}</h3>
                        <p style="color: #6b7280;">Total Likes</p>
                    </div>
                    <div style="padding: 15px; background: #f9fafb; border-radius: 8px; text-align: center;">
                        <h3 style="font-size: 24px; margin-bottom: 5px; color: #2563eb;">${this.formatNumber(stats.totalFollows)}</h3>
                        <p style="color: #6b7280;">Total Follows</p>
                    </div>
                </div>
            </div>
        `;
    }

    generateArticlesHTML() {
        if (this.articles.length === 0) {
            return '<p style="text-align: center; color: #6b7280;">Aucun article disponible.</p>';
        }

        return `
            <div>
                <h2 style="color: #374151; margin-bottom: 20px;">Liste des Articles</h2>
                ${this.articles.map(article => `
                    <div style="margin-bottom: 20px; padding: 20px; background: white; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="color: #374151; margin: 0;">${this.escapeHtml(article.name)}</h3>
                            <span style="font-weight: bold; color: #16a34a; font-size: 18px;">${this.formatPrice(article.price)}</span>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                            <div style="text-align: center; padding: 10px; background: #f9fafb; border-radius: 6px;">
                                <strong style="display: block; font-size: 16px; color: #374151;">${this.formatNumber(article.views)}</strong>
                                <span style="font-size: 12px; color: #6b7280;">Vues</span>
                            </div>
                            <div style="text-align: center; padding: 10px; background: #f9fafb; border-radius: 6px;">
                                <strong style="display: block; font-size: 16px; color: #374151;">${this.formatNumber(article.clicks)}</strong>
                                <span style="font-size: 12px; color: #6b7280;">Clics</span>
                            </div>
                            <div style="text-align: center; padding: 10px; background: #f9fafb; border-radius: 6px;">
                                <strong style="display: block; font-size: 16px; color: #374151;">${this.formatNumber(article.likes)}</strong>
                                <span style="font-size: 12px; color: #6b7280;">Likes</span>
                            </div>
                            <div style="text-align: center; padding: 10px; background: #f9fafb; border-radius: 6px;">
                                <strong style="display: block; font-size: 16px; color: #374151;">${this.formatNumber(article.follows)}</strong>
                                <span style="font-size: 12px; color: #6b7280;">Follows</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Utility functions
    formatNumber(num) {
        return new Intl.NumberFormat('fr-FR').format(num);
    }

    formatPrice(price) {
        return new Intl.NumberFormat('fr-MA').format(price) + ' DH';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        `;

        const colors = {
            success: '#16a34a',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize dashboard
const dashboard = new MarketingDashboard();

// Make dashboard globally accessible for inline event handlers
window.dashboard = dashboard;