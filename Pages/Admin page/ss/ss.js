document.addEventListener('DOMContentLoaded', function() {
    // Handle the logout button click event
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
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['New Requests', 'Completed Requests', 'New Offers', 'Completed Offers'],
            datasets: [{
                data: [10, 12, 8, 14], // Sample data, adjust as needed
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
                        max: 16,
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

    // Handle date validation
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const form = document.getElementById('dateForm');

    form.addEventListener('submit', function(event) {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        if (endDate <= startDate) {
            event.preventDefault(); // Prevent form submission
            alert("The end date must be after the start date.");
        }
    });
});
