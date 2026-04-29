document.addEventListener('DOMContentLoaded', () => {
    // 1. Get User Data from localStorage
    const userData = localStorage.getItem('user');
    
    if (!userData) {
        console.warn("No session found. Redirecting to login...");
        window.location.href = 'index.html'; // Points to your login page
        return;
    }

    const user = JSON.parse(userData);

    // 2. Display Welcome Message
    const welcomeEl = document.getElementById('user-welcome');
    if (welcomeEl) {
        welcomeEl.innerText = `Welcome, ${user.name}`;
    }

    // 3. Flexible Role Check (Fixes the "Staff" vs "staff" issue)
    // We convert the role to lowercase to catch all variations
    const role = user.role ? user.role.toLowerCase() : '';

    if (role.includes('staff') || role.includes('admin')) {
        console.log("Authorized as Staff/Admin");
        document.getElementById('staff-view')?.classList.remove('hidden');
        loadAppointments(); // Fetch the queue only for staff
    } else {
        console.log("Authorized as Patient");
        document.getElementById('patient-view')?.classList.remove('hidden');
    }

    // 4. Handle Patient Booking Form
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const dateInput = document.getElementById('appointment-date').value;

            try {
                const response = await fetch('/api/book-appointment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        date: dateInput, 
                        patientName: user.name 
                    })
                });

                const data = await response.json();
                if (response.ok) {
                    alert(`Success! Your Queue Number is: ${data.queueNumber}`);
                    bookingForm.reset();
                } else {
                    alert(`Error: ${data.error}`);
                }
            } catch (err) {
                console.error("Booking connection error:", err);
            }
        });
    }
});

// 5. Populate Staff Queue Table
async function loadAppointments() {
    const tableBody = document.getElementById('appointments-table-body');
    if (!tableBody) return;

    try {
        const response = await fetch('/api/appointments');
        const appointments = await response.json();

        tableBody.innerHTML = appointments.map(app => `
            <tr>
                <td>#${app.id}</td>
                <td>${app.patient_name}</td>
                <td><strong>${app.status}</strong></td>
                <td>
                    <button onclick="updateStatus(${app.id}, 'Completed')" style="background:#28a745; padding:5px 10px;">Complete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Failed to load appointments:", err);
    }
}

// 6. Logout and Clear Storage
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}