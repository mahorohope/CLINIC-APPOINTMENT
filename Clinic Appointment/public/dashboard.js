document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href = 'index.html';

    // Decode JWT for user identification
    const payload = JSON.parse(atob(token.split('.')[1]));
    document.getElementById('user-welcome').innerText = `Hello, ${payload.name || 'User'}`;

    // Switch views based on Role
    if (payload.role === 'staff') {
        document.getElementById('staff-view').classList.remove('hidden');
        loadStaffData();
    } else {
        document.getElementById('patient-view').classList.remove('hidden');
        handleBooking();
    }
});

function handleBooking() {
    const form = document.getElementById('booking-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const date = document.getElementById('appointment-date').value;

        // The URL must include /api/ to match the backend routes
        const res = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ date })
        });

        const data = await res.json();
        if (res.ok) {
            // FIX: Using queue_number (underscore) to match the model
            alert(`Success! Your Queue Number is #${data.queue_number}.`);
            location.reload(); 
        } else {
            alert("Error: " + data.error);
        }
    };
}

async function loadStaffData() {
    try {
        const res = await fetch('/api/appointments', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        // If the server sends HTML instead of JSON, this will fail safely
        const appointments = await res.json();
        if (!res.ok) throw new Error(appointments.error || "Server Error");

        const tbody = document.getElementById('appointments-table-body');
        
        tbody.innerHTML = appointments.map(app => `
            <tr>
                <td>#${app.queue_number}</td>
                <td>${app.patient ? app.patient.name : 'Unknown'}</td>
                <td>${app.status}</td>
                <td>
                    ${app.status === 'pending' 
                        ? `<button onclick="updateStatus(${app.id}, 'served')">Serve</button>` 
                        : 'Completed'}
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Fetch Error:", err);
        document.getElementById('appointments-table-body').innerHTML = 
            `<tr><td colspan="4" style="color:red">Error: ${err.message}. Ensure server is running.</td></tr>`;
    }
}

async function updateStatus(id, newStatus) {
    const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) loadStaffData();
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}