// Chart Renderer - Handles all chart rendering
class ChartRenderer {
    static renderDashboard() {
        const { paymentsByPaymentDate, paymentsByCallingDate, paymentsByMode } = DataProcessor.aggregateData();

        // Destroy existing charts
        Object.values(AppState.charts).forEach(chart => chart?.destroy());

        this.renderPaymentDateChart(paymentsByPaymentDate);
        this.renderCallingDateChart(paymentsByCallingDate);
        this.renderPaymentModeChart(paymentsByMode);
        
        TableRenderer.renderCrmSummaryTable(AppState.crmSummaryData);
        TableRenderer.renderCampaignSummaryTable(AppState.campaignSummaryData);
    }

    static renderPaymentDateChart(data) {
        const labels = Object.keys(data).sort();
        const values = labels.map(date => data[date]);
        
        const ctx = document.getElementById('paymentDateChart').getContext('2d');
        AppState.charts.paymentDateChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Amount',
                    data: values,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: CONFIG.CHART_COLORS.primary,
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount (₹)',
                            font: { weight: 'bold' }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    static renderCallingDateChart(data) {
        const labels = Object.keys(data).sort();
        const values = labels.map(date => data[date]);
        
        const ctx = document.getElementById('callingDateChart').getContext('2d');
        AppState.charts.callingDateChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Amount',
                    data: values,
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: CONFIG.CHART_COLORS.success,
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount (₹)',
                            font: { weight: 'bold' }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    static renderPaymentModeChart(data) {
        const labels = Object.keys(data);
        const values = labels.map(mode => data[mode].count);
        
        const ctx = document.getElementById('paymentModeChart').getContext('2d');
        AppState.charts.paymentModeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: CONFIG.PIE_COLORS,
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverBorderWidth: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }
}