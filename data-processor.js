// Data Processor - Handles data filtering and aggregation
class DataProcessor {
    static filterData() {
        const startDate = DOM.startDateInput.value ? new Date(DOM.startDateInput.value) : null;
        const endDate = DOM.endDateInput.value ? new Date(DOM.endDateInput.value) : null;

        if (!startDate || !endDate) {
            AppState.filteredData = [...AppState.allData];
            return;
        }

        AppState.filteredData = AppState.allData.filter(row => {
            const paymentDate = new Date(row['Payment Date']);
            const inclusiveEndDate = new Date(endDate);
            inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);
            return paymentDate >= startDate && paymentDate < inclusiveEndDate;
        });
    }

    static aggregateData() {
        const paymentsByPaymentDate = {};
        const paymentsByCallingDate = {};
        const paymentsByMode = {};
        const paymentsByCRM = {};
        const paymentsByCampaign = {};
        
        AppState.filteredData.forEach(row => {
            const amount = parseFloat(row['Amount']);
            if (isNaN(amount)) return;

            // Aggregate by Payment Date
            const paymentDate = row['Payment Date'];
            if (paymentDate) {
                paymentsByPaymentDate[paymentDate] = (paymentsByPaymentDate[paymentDate] || 0) + amount;
            }

            // Aggregate by Calling Date
            const callingDate = row['Calling Date'];
            if (callingDate) {
                paymentsByCallingDate[callingDate] = (paymentsByCallingDate[callingDate] || 0) + amount;
            }

            // Aggregate by Payment Mode
            const mode = row['Payment Mode'];
            if (!paymentsByMode[mode]) paymentsByMode[mode] = { count: 0, amount: 0 };
            paymentsByMode[mode].amount += amount;
            paymentsByMode[mode].count++;

            // Aggregate by CRM ID
            const crmId = row['CRM ID'];
            if (!paymentsByCRM[crmId]) paymentsByCRM[crmId] = { count: 0, amount: 0 };
            paymentsByCRM[crmId].amount += amount;
            paymentsByCRM[crmId].count++;

            // Aggregate by Campaign
            const campaign = row['Campaign'];
            if (!paymentsByCampaign[campaign]) paymentsByCampaign[campaign] = { count: 0, amount: 0 };
            paymentsByCampaign[campaign].amount += amount;
            paymentsByCampaign[campaign].count++;
        });

        // Convert to arrays for sorting
        AppState.crmSummaryData = Object.keys(paymentsByCRM).map(crmId => ({
            crmId,
            amount: paymentsByCRM[crmId].amount,
            count: paymentsByCRM[crmId].count
        }));

        AppState.campaignSummaryData = Object.keys(paymentsByCampaign).map(campaign => ({
            campaign,
            amount: paymentsByCampaign[campaign].amount,
            count: paymentsByCampaign[campaign].count
        }));

        return { paymentsByPaymentDate, paymentsByCallingDate, paymentsByMode };
    }

    static updateStats() {
        const totalAmount = AppState.filteredData.reduce((sum, row) => sum + parseFloat(row['Amount'] || 0), 0);
        const totalTransactions = AppState.filteredData.length;
        const uniqueCRMs = new Set(AppState.filteredData.map(row => row['CRM ID'])).size;
        const activeCampaigns = new Set(AppState.filteredData.map(row => row['Campaign'])).size;

        DOM.totalAmount.textContent = `₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
        DOM.totalTransactions.textContent = totalTransactions.toLocaleString();
        DOM.uniqueCRM.textContent = uniqueCRMs.toString();
        DOM.activeCampaigns.textContent = activeCampaigns.toString();
    }

    static sortTable(tableData, key, order) {
        const numericKeys = ['Amount', 'amount', 'count'];
        const dateKeys = ['Timestamp', 'Payment Date', 'Calling Date'];
        return tableData.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            if (numericKeys.includes(key)) {
                return order === 'asc' ? parseFloat(aVal) - parseFloat(bVal) : parseFloat(bVal) - parseFloat(aVal);
            } else if (dateKeys.includes(key)) {
                const aDate = new Date(aVal);
                const bDate = new Date(bVal);
                return order === 'asc' ? aDate - bDate : bDate - aDate;
            } else {
                return order === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
            }
        });
    }

    static filterAndRender() {
        this.filterData();
        this.updateStats();
        ChartRenderer.renderDashboard();
        TableRenderer.populateFilters();
        TableRenderer.populateSummaryFilters();
        // Sort by Timestamp (latest first) by default
        const sortedData = this.sortTable([...AppState.filteredData], 'Timestamp', 'desc');
        TableRenderer.renderTable(sortedData);
    }
}