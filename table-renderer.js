// Table Renderer - Handles all table rendering and interactions
class TableRenderer {
    static renderCrmSummaryTable(data) {
        const tbody = DOM.crmSummaryTableBody;
        tbody.innerHTML = '';
        
        data.sort((a, b) => b.amount - a.amount).forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.crmId}</td>
                <td>₹${item.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                <td>${item.count}</td>
            `;
            tbody.appendChild(row);
        });
    }

    static renderCampaignSummaryTable(data) {
        const tbody = DOM.campaignSummaryTableBody;
        tbody.innerHTML = '';
        
        data.sort((a, b) => b.amount - a.amount).forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.campaign}</td>
                <td>₹${item.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                <td>${item.count}</td>
            `;
            tbody.appendChild(row);
        });
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

    static filterTable(searchTerm) {
        if (!searchTerm) {
            this.renderTable(AppState.filteredData);
            return;
        }

        const filtered = AppState.filteredData.filter(row => 
            Object.values(row).some(value => 
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        this.renderTable(filtered);
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