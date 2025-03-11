// Supabase configuration
const SUPABASE_URL = 'https://wvvedaebslmainspcjdq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2dmVkYWVic2xtYWluc3BjamRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0OTM5NTAsImV4cCI6MjA1NzA2OTk1MH0.ZtG03B-Coa2hKn_q3WkJOjOaxSiJ0jHsmFI7VARZKMw';

// Initialize the counter display
document.addEventListener('DOMContentLoaded', async () => {
    // Get the counter element
    const countElement = document.getElementById('play-count');
    if (!countElement) return;

    try {
        // Fetch the current count from Supabase
        const response = await fetch(`${SUPABASE_URL}/rest/v1/game-counters?id=eq.1&select=count`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch counter data: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.length > 0) {
            // Display the count
            countElement.textContent = data[0].count;
        } else {
            console.log('No counter record found. Creating a new one...');
            
            // Create a new record with count = 0
            const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/game-counters`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ id: 1, count: 0 })
            });
            
            if (!createResponse.ok) {
                throw new Error(`Failed to create counter: ${createResponse.status}`);
            }
            
            countElement.textContent = '0';
        }
    } catch (error) {
        console.error('Error initializing counter:', error);
        countElement.textContent = '...';
    }
});

// Function to increment the play count
async function incrementPlayCount() {
    try {
        // First, get the current count
        const getResponse = await fetch(`${SUPABASE_URL}/rest/v1/game-counters?id=eq.1&select=count`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!getResponse.ok) {
            throw new Error(`Failed to fetch counter data: ${getResponse.status}`);
        }

        const data = await getResponse.json();
        
        let newCount = 1; // Default to 1 if no record exists
        
        if (data && data.length > 0) {
            // Record exists, increment the count
            const currentCount = data[0].count;
            newCount = currentCount + 1;
        }
        
        // Use UPSERT operation (POST with Prefer: resolution=merge-duplicates)
        // This will create the record if it doesn't exist, or update it if it does
        const upsertResponse = await fetch(`${SUPABASE_URL}/rest/v1/game-counters`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({ id: 1, count: newCount })
        });
        
        if (!upsertResponse.ok) {
            throw new Error(`Failed to update counter: ${upsertResponse.status}`);
        }
        
        // Update the display
        const countElement = document.getElementById('play-count');
        if (countElement) {
            countElement.textContent = newCount;
        }
        
        return newCount;
    } catch (error) {
        console.error('Error incrementing counter:', error);
        return null;
    }
} 