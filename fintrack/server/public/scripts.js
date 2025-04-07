document.addEventListener('DOMContentLoaded', function() {
  // Weekly Activity Chart
  const weeklyActivityCtx = document.getElementById('weeklyActivityChart').getContext('2d');
  const weeklyActivityChart = new Chart(weeklyActivityCtx, {
    type: 'bar',
    data: {
      labels: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      datasets: [
        {
          label: 'Withdraw',
          data: [450, 350, 320, 480, 150, 380, 400],
          backgroundColor: '#3a54fc',
          borderRadius: 5,
          barPercentage: 0.5,
          categoryPercentage: 0.8
        },
        {
          label: 'Deposit',
          data: [220, 130, 240, 360, 240, 220, 320],
          backgroundColor: '#02c39a',
          borderRadius: 5,
          barPercentage: 0.5,
          categoryPercentage: 0.8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            drawBorder: false
          }
        },
        x: {
          grid: {
            display: false,
            drawBorder: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });

  // Balance History Chart
  const balanceHistoryCtx = document.getElementById('balanceHistoryChart').getContext('2d');
  const balanceHistoryChart = new Chart(balanceHistoryCtx, {
    type: 'line',
    data: {
      labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
      datasets: [{
        label: 'Balance',
        data: [300, 250, 450, 750, 250, 600, 650],
        borderColor: '#3a54fc',
        backgroundColor: 'rgba(58, 84, 252, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            drawBorder: false
          }
        },
        x: {
          grid: {
            display: false,
            drawBorder: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });

  // Expense Statistics Chart
  const expenseChartCtx = document.getElementById('expenseChart').getContext('2d');
  const expenseChart = new Chart(expenseChartCtx, {
    type: 'doughnut',
    data: {
      labels: ['Entertainment', 'Bill Expense', 'Investment', 'Others'],
      datasets: [{
        data: [30, 15, 20, 35],
        backgroundColor: [
          '#3f4b8c',
          '#ff9a3d',
          '#ff3dc9',
          '#3a54fc'
        ],
        borderWidth: 0,
        cutout: '70%'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 10,
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw}%`;
            }
          }
        }
      }
    }
  });
}); 