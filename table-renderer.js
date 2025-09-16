// Table Renderer - Handles all table rendering and interactions
class TableRenderer {
    static renderCrmSummaryTable(data, skipSort = false) {
        const tbody = DOM.crmSummaryTableBody;
        tbody.innerHTML = '';
        
        // Apply filters
        const campaignFilter = DOM.crmCampaignFilter.value;
        const callingDateFilter = DOM.crmCallingDateFilter.value;
        
        let filteredData = data;
        if (campaignFilter || callingDateFilter) {
            filteredData = this.getFilteredCrmData(campaignFilter, callingDateFilter);
        }
        
        // Only apply default sorting if not already sorted
        if (!skipSort) {
            filteredData.sort((a, b) => b.amount - a.amount);
        }
        
        filteredData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.crmId}</td>
                <td>₹${item.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                <td>${item.count}</td>
            `;
            tbody.appendChild(row);
        });
        
        // Update totals
        const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);
        const totalCount = filteredData.reduce((sum, item) => sum + item.count, 0);
        DOM.crmTotalAmount.textContent = `₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
        DOM.crmTotalCount.textContent = totalCount.toString();
    }

    static renderCampaignSummaryTable(data, skipSort = false) {
        const tbody = DOM.campaignSummaryTableBody;
        tbody.innerHTML = '';
        
        // Apply filters
        const callingDateFilter = DOM.campaignCallingDateFilter.value;
        
        let filteredData = data;
        if (callingDateFilter) {
            filteredData = this.getFilteredCampaignData(callingDateFilter);
        }
        
        // Only apply default sorting if not already sorted
        if (!skipSort) {
            filteredData.sort((a, b) => b.amount - a.amount);
        }
        
        filteredData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.campaign}</td>
                <td>₹${item.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                <td>${item.count}</td>
            `;
            tbody.appendChild(row);
        });
        
        // Update totals
        const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);
        const totalCount = filteredData.reduce((sum, item) => sum + item.count, 0);
        DOM.campaignTotalAmount.textContent = `₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
        DOM.campaignTotalCount.textContent = totalCount.toString();
    }

    static renderTable(data) {
        const tbody = DOM.dataTableBody;
        tbody.innerHTML = '';
        
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row['CRM ID'] || ''}</td>
                <td>${row['Loan ID'] || ''}</td>
                <td>${row['Mobile number'] || ''}</td>
                <td>${row['Calling Date'] || ''}</td>
                <td>${row['Payment Date'] || ''}</td>
                <td>₹${parseFloat(row['Amount'] || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                <td>${row['Payment Mode'] || ''}</td>
                <td>${row['Campaign'] || ''}</td>
                <td>${row['Timestamp'] || ''}</td>
                <td><button class="copy-btn" onclick="TableRenderer.copyRowData(this)" title="Copy transaction details"><i class="fas fa-copy"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    static populateFilters() {
        const data = AppState.filteredData;
        
        // Get unique values for each filter
        const campaigns = [...new Set(data.map(row => row['Campaign']).filter(Boolean))].sort();
        const crmIds = [...new Set(data.map(row => row['CRM ID']).filter(Boolean))].sort();
        const paymentModes = [...new Set(data.map(row => row['Payment Mode']).filter(Boolean))].sort();
        const callingDates = [...new Set(data.map(row => row['Calling Date']).filter(Boolean))].sort();
        
        // Populate dropdowns
        this.populateSelect(DOM.campaignFilter, campaigns, 'All Campaign');
        this.populateSelect(DOM.crmFilter, crmIds, 'All CRM ID');
        this.populateSelect(DOM.paymentModeFilter, paymentModes, 'All Payment Mode');
        this.populateSelect(DOM.callingDateFilter, callingDates, 'All Calling Date');
    }
    
    static populateSelect(selectElement, options, defaultText) {
        selectElement.innerHTML = `<option value="">${defaultText}</option>`;
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    }

    static applyFilters() {
        const searchTerm = DOM.tableSearchInput.value.toLowerCase();
        const campaignFilter = DOM.campaignFilter.value;
        const crmFilter = DOM.crmFilter.value;
        const paymentModeFilter = DOM.paymentModeFilter.value;
        const callingDateFilter = DOM.callingDateFilter.value;
        
        let filtered = AppState.filteredData.filter(row => {
            // Search filter
            const matchesSearch = !searchTerm || Object.values(row).some(value => 
                String(value).toLowerCase().includes(searchTerm)
            );
            
            // Dropdown filters
            const matchesCampaign = !campaignFilter || row['Campaign'] === campaignFilter;
            const matchesCrm = !crmFilter || row['CRM ID'] === crmFilter;
            const matchesPaymentMode = !paymentModeFilter || row['Payment Mode'] === paymentModeFilter;
            const matchesCallingDate = !callingDateFilter || row['Calling Date'] === callingDateFilter;
            
            return matchesSearch && matchesCampaign && matchesCrm && matchesPaymentMode && matchesCallingDate;
        });
        
        this.renderTable(filtered);
    }

    static filterTable(searchTerm) {
        this.applyFilters();
    }

    static populateSummaryFilters() {
        const data = AppState.filteredData;
        
        // Get unique values
        const campaigns = [...new Set(data.map(row => row['Campaign']).filter(Boolean))].sort();
        const callingDates = [...new Set(data.map(row => row['Calling Date']).filter(Boolean))].sort();
        
        // Populate CRM filters
        this.populateSelect(DOM.crmCampaignFilter, campaigns, 'All Campaign');
        this.populateSelect(DOM.crmCallingDateFilter, callingDates, 'All Calling Date');
        
        // Populate Campaign filters
        this.populateSelect(DOM.campaignCallingDateFilter, callingDates, 'All Calling Date');
    }

    static getFilteredCrmData(campaignFilter, callingDateFilter) {
        let filteredData = AppState.filteredData;
        
        if (campaignFilter) {
            filteredData = filteredData.filter(row => row['Campaign'] === campaignFilter);
        }
        if (callingDateFilter) {
            filteredData = filteredData.filter(row => row['Calling Date'] === callingDateFilter);
        }
        
        // Aggregate by CRM ID
        const paymentsByCRM = {};
        filteredData.forEach(row => {
            const amount = parseFloat(row['Amount']);
            if (isNaN(amount)) return;
            
            const crmId = row['CRM ID'];
            if (!paymentsByCRM[crmId]) paymentsByCRM[crmId] = { count: 0, amount: 0 };
            paymentsByCRM[crmId].amount += amount;
            paymentsByCRM[crmId].count++;
        });
        
        return Object.keys(paymentsByCRM).map(crmId => ({
            crmId,
            amount: paymentsByCRM[crmId].amount,
            count: paymentsByCRM[crmId].count
        }));
    }

    static getFilteredCampaignData(callingDateFilter) {
        let filteredData = AppState.filteredData;
        
        if (callingDateFilter) {
            filteredData = filteredData.filter(row => row['Calling Date'] === callingDateFilter);
        }
        
        // Aggregate by Campaign
        const paymentsByCampaign = {};
        filteredData.forEach(row => {
            const amount = parseFloat(row['Amount']);
            if (isNaN(amount)) return;
            
            const campaign = row['Campaign'];
            if (!paymentsByCampaign[campaign]) paymentsByCampaign[campaign] = { count: 0, amount: 0 };
            paymentsByCampaign[campaign].amount += amount;
            paymentsByCampaign[campaign].count++;
        });
        
        return Object.keys(paymentsByCampaign).map(campaign => ({
            campaign,
            amount: paymentsByCampaign[campaign].amount,
            count: paymentsByCampaign[campaign].count
        }));
    }

    static copyRowData(button) {
        const row = button.closest('tr');
        const cells = row.querySelectorAll('td');
        
        const data = {
            loanId: cells[1].textContent,
            paymentDate: cells[4].textContent,
            amount: cells[5].textContent,
            mode: cells[6].textContent,
            campaign: cells[7].textContent,
            agentName: cells[0].textContent
        };
        
        const copyText = `Loan ID - ${data.loanId}
Payment date - ${data.paymentDate}
Amount - ${data.amount}
Mode - ${data.mode}
Campaign - ${data.campaign}
Agent Name - ${data.agentName}`;
        
        navigator.clipboard.writeText(copyText).then(() => {
            // Show success feedback
            const icon = button.querySelector('i');
            icon.className = 'fas fa-check';
            button.style.color = '#10b981';
            setTimeout(() => {
                icon.className = 'fas fa-copy';
                button.style.color = '';
            }, 2000);
        }).catch(() => {
            alert('Failed to copy to clipboard');
        });
    }
}