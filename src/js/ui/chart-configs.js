let chartInstance = null;

function initChart() {
    const ctx = document.getElementById('myChart').getContext('2d');

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { // Initialize with empty data, it will be filled by updateChart.
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: {
                        color: '#b8c2d0',
                        callback: function (value) {
                            return (value * 100).toFixed(0) + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(58, 58, 106, 0.5)'
                    },
                    beginAtZero: true,
                    min: 0,
                    max: 1.0
                },
                x: {
                    ticks: {
                        color: '#b8c2d0'
                    },
                    grid: {
                        color: 'rgba(58, 58, 106, 0.5)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#f5f5f5',
                        sort: (a, b) => a.datasetIndex - b.datasetIndex
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            label += (context.parsed.y * 100).toFixed(2) + '%';
                            return label;
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function getColor(index) {
    const colors = ['#FF9800', '#9C27B0', '#E91E63', '#00BCD4'];
    return colors[index % colors.length];
}

function getBackgroundColor(index) {
    const colors = ['rgba(255, 99, 132, 0.1)', 'rgba(255, 159, 64, 0.1)',
        'rgba(255, 205, 86, 0.1)', 'rgba(75, 192, 192, 0.1)',
        'rgba(153, 102, 255, 0.1)'];
    return colors[(index - 2) % colors.length];
}

export function updateChart(newData, newLabels, newChartLabels) {
    if (!chartInstance) {
        initChart();
    }

    const totalDatasets = newData.length;
    const shiftedChartLabels = newChartLabels.slice(1);

    chartInstance.data.labels = newLabels;
    chartInstance.data.datasets = newData.map((dataset, index) => {
        const color = index === 0 ? '#2196F3' :
            index === 1 ? '#4CAF50' :
                getColor(index); // Assuming getColor exists

        return {
            label: shiftedChartLabels[index],
            data: dataset,
            borderColor: color,
            backgroundColor: index === 0 ? 'rgba(33, 150, 243, 0.1)' :
                index === 1 ? 'rgba(76, 175, 80, 0.1)' :
                    getBackgroundColor(index),
            fill: true,
            tension: 0.4,
            order: totalDatasets - index,
            borderWidth: 3,
            pointRadius: 0,
            pointHoverRadius: 5
        };
    });

    chartInstance.update();
}

export function convertToChartData(distributionArrays) {
    let distrLen = distributionArrays[0].length;
    let data = Array.from({ length: distrLen - 1 },
        () => Array.from({ length: distributionArrays.length + 1 }, () => 0)
    );
    let labels = [0];

    for (let i = 0; i < distributionArrays.length; i++) {
        let normalizationFactor = 0;
        for (const element of distributionArrays[i]) {
            normalizationFactor += element;
        }
        let probSum = 0;
        const pull = i + 1;
        labels.push(pull);

        const currentDistribution = distributionArrays[i];
        const lastDistributionIndex = currentDistribution.length - 1;

        for (let j = lastDistributionIndex; j > 0; j--) {
            probSum += currentDistribution[j];
            data[j - 1][pull] = probSum / normalizationFactor;
        }
    }

    return { data, labels };
}