// Main Application Script
class App {
    static async init() {
        initializeDOM();
        this.setupEventListeners();
        this.setDefaultDates();
        this.initInternetMonitoring();
        await this.loadData();
    }

    static setupEventListeners() {
        // View toggle
        DOM.dashboardViewBtn.addEventListener('click', () => this.switchView('dashboard'));
        DOM.tableViewBtn.addEventListener('click', () => this.switchView('table'));

        // Date filters and refresh
        DOM.startDateInput.addEventListener('change', () => DataProcessor.filterAndRender());
        DOM.endDateInput.addEventListener('change', () => DataProcessor.filterAndRender());
        DOM.refreshBtn.addEventListener('click', () => this.loadData());

        // Table search and filters
        DOM.tableSearchInput.addEventListener('input', () => TableRenderer.applyFilters());
        DOM.campaignFilter.addEventListener('change', () => TableRenderer.applyFilters());
        DOM.crmFilter.addEventListener('change', () => TableRenderer.applyFilters());
        DOM.paymentModeFilter.addEventListener('change', () => TableRenderer.applyFilters());
        DOM.callingDateFilter.addEventListener('change', () => TableRenderer.applyFilters());

        // Table sorting
        document.querySelectorAll('.sortable-header').forEach(header => {
            header.addEventListener('click', () => this.handleSort(header));
        });
    }

    static switchView(view) {
        AppState.currentView = view;
        
        if (view === 'dashboard') {
            DOM.dashboardView.classList.remove('hidden');
            DOM.tableView.classList.add('hidden');
            DOM.dashboardViewBtn.classList.add('active');
            DOM.tableViewBtn.classList.remove('active');
            DOM.slider.style.transform = 'translateX(0)';
        } else {
            DOM.dashboardView.classList.add('hidden');
            DOM.tableView.classList.remove('hidden');
            DOM.dashboardViewBtn.classList.remove('active');
            DOM.tableViewBtn.classList.add('active');
            DOM.slider.style.transform = 'translateX(100%)';
            // Set default sort indicator on Timestamp column
            this.setDefaultTableSort();
        }
    }

    static setDefaultDates() {
        const today = new Date();
        const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        // Format dates properly to avoid timezone issues
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        DOM.startDateInput.value = formatDate(firstOfMonth);
        DOM.endDateInput.value = formatDate(today);
    }

    static async loadData() {
        try {
            DOM.loadingOverlay.classList.remove('hidden');
            await DataService.fetchData();
            DataProcessor.filterAndRender();
            this.hideMessage();
        } catch (error) {
            this.showMessage('Failed to load data. Please try again.', 'error');
        } finally {
            DOM.loadingOverlay.classList.add('hidden');
        }
    }

    static showMessage(text, type = 'info') {
        DOM.messageText.textContent = text;
        DOM.messageBox.className = `message-box ${type}`;
        DOM.messageBox.classList.remove('hidden');
        setTimeout(() => this.hideMessage(), 5000);
    }

    static hideMessage() {
        DOM.messageBox.classList.add('hidden');
    }

    static setDefaultTableSort() {
        // Reset all headers
        document.querySelectorAll('.sortable-header').forEach(h => {
            h.dataset.sortOrder = '';
            h.classList.remove('asc', 'desc');
        });
        
        // Set Timestamp column as default sort (desc)
        const timestampHeader = document.querySelector('[data-sort-key="Timestamp"]');
        if (timestampHeader) {
            timestampHeader.dataset.sortOrder = 'desc';
            timestampHeader.classList.add('desc');
        }
    }

    static handleSort(header) {
        const key = header.dataset.sortKey;
        const currentOrder = header.dataset.sortOrder || 'desc';
        const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
        
        // Reset all headers
        document.querySelectorAll('.sortable-header').forEach(h => {
            h.dataset.sortOrder = '';
            h.classList.remove('asc', 'desc');
        });
        
        // Set current header
        header.dataset.sortOrder = newOrder;
        header.classList.add(newOrder);
        
        // Sort and render based on table
        const table = header.closest('table');
        if (table.querySelector('#crmSummaryTableBody')) {
            const sorted = DataProcessor.sortTable([...AppState.crmSummaryData], key, newOrder);
            TableRenderer.renderCrmSummaryTable(sorted);
        } else if (table.querySelector('#campaignSummaryTableBody')) {
            const sorted = DataProcessor.sortTable([...AppState.campaignSummaryData], key, newOrder);
            TableRenderer.renderCampaignSummaryTable(sorted);
        } else if (table.querySelector('#dataTableBody')) {
            const sorted = DataProcessor.sortTable([...AppState.filteredData], key, newOrder);
            TableRenderer.renderTable(sorted);
        }
    }

    static initInternetMonitoring() {
        this.updateInternetStatus();
        
        // Check internet status every 30 seconds
        setInterval(() => this.updateInternetStatus(), 30000);
        
        // Listen for online/offline events
        window.addEventListener('online', () => this.updateInternetStatus());
        window.addEventListener('offline', () => this.updateInternetStatus());
    }

    static updateInternetStatus() {
        const isOnline = navigator.onLine;
        
        if (isOnline) {
            DOM.liveDataStatus.style.display = 'flex';
            DOM.internetStatus.style.display = 'none';
        } else {
            DOM.liveDataStatus.style.display = 'none';
            DOM.internetStatus.style.display = 'flex';
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => App.init());