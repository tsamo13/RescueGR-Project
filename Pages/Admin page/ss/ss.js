document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logoutButton');
    
    logoutButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent any default behavior
        
        fetch('/logout', {
            method: 'GET',
        })
        .then(response => {
            if (response.ok) {
                window.location.href = '/login'; // Redirect to the login page after logout
            } else {
                console.error('Logout failed');
            }
        })
        .catch(error => {
            console.error('Error during logout:', error);
        });
    });

    // Create the chart using Chart.js
    const ctx = document.getElementById('Chart').getContext('2d');
    let myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['New Requests', 'Completed Requests', 'New Offers', 'Completed Offers'],
            datasets: [{
                data: [0, 0, 0, 0], // Initialize with zero data
                backgroundColor: '#FF7F50',
                barPercentage: 0.5,  // Reduce the bar width to 50%
                categoryPercentage: 0.5  // Adjust the space between the bars
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false  // Remove the legend (Service Statistics label)
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 2, // Increment y-axis by 2
                        color: '#000000',  // Make the y-axis numbers bold
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false  // Remove the gridlines on the y-axis
                    }
                },
                x: {
                    ticks: {
                        color: '#000000',  // Make the x-axis labels bold
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false  // Remove the gridlines on the x-axis
                    }
                }
            }
        }
    });

    // Handle date validation and fetch data
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const form = document.getElementById('dateForm');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        if (endDate < startDate) {
            
            Swal.fire({
                icon: 'error',
                title: 'Invalid Date Range',
                text: 'The end date must be the same or after the start date.',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Fetch statistics data for the selected date range
        fetch(`/service_statistics/ss?startDate=${startDateInput.value}&endDate=${endDateInput.value}`)  // <-- Fixed the URL here
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update chart data dynamically
                    myChart.data.datasets[0].data = [
                        data.stats.newRequests,
                        data.stats.completedRequests,
                        data.stats.newOffers,
                        data.stats.completedOffers
                    ];
                    myChart.update(); // Refresh the chart with new data
                } else {
                    console.error('Failed to fetch statistics:', data.message);
                }
            })
            .catch(error => console.error('Error fetching statistics:', error));
    });

    // JavaScript to handle redirection to the admin page
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');

    if (username) {
        const mainPageLink = document.getElementById('mainPageLink');
        mainPageLink.href = `../admin_page?username=${encodeURIComponent(username)}`;
    }
});
