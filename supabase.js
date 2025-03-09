// Supabase configuration
const SUPABASE_URL = 'https://wvvedaebslmainspcjdq.supabase.co'; // Replace with your Supabase URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2dmVkYWVic2xtYWluc3BjamRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0OTM5NTAsImV4cCI6MjA1NzA2OTk1MH0.ZtG03B-Coa2hKn_q3WkJOjOaxSiJ0jHsmFI7VARZKMw'; // Replace with your Supabase anon key

// Initialize Supabase client
let supabaseClient;

// Initialize the client when the script loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Initializing Supabase client...');
        
        // Check if supabase is available
        if (typeof window.supabase === 'undefined') {
            console.error('Supabase library not loaded. Make sure the CDN script is included and loaded properly.');
            const countElement = document.getElementById('play-count');
            if (countElement) {
                countElement.textContent = 'many';
            }
            return;
        }
        
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabase client initialized successfully');
        
        // Initialize the counter after client is ready
        initializeCounter();
    } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        console.error('Error details:', err.message);
        
        // Update the counter display with an error message
        const countElement = document.getElementById('play-count');
        if (countElement) {
            countElement.textContent = 'many';
        }
    }
});

// Counter table name
const COUNTER_TABLE = 'game_counters';
const COUNTER_ID = 'oregon_fail_counter';

// Function to get the current play count
async function getPlayCount() {
    console.log('Attempting to get play count from Supabase...');
    try {
        console.log('Supabase URL:', SUPABASE_URL);
        console.log('Making request to Supabase...');
        const { data, error } = await supabaseClient
            .from(COUNTER_TABLE)
            .select('count')
            .eq('id', COUNTER_ID)
            .single();
        
        if (error) {
            console.error('Error fetching play count:', error);
            return 0;
        }
        
        console.log('Play count data received:', data);
        return data ? data.count : 0;
    } catch (err) {
        console.error('Failed to get play count:', err);
        console.error('Error details:', err.message);
        return 0;
    }
}

// Function to increment the play count
async function incrementPlayCount() {
    console.log('Attempting to increment play count...');
    try {
        // First check if the counter exists
        console.log('Checking if counter exists...');
        const { data: existingCounter, error: fetchError } = await supabaseClient
            .from(COUNTER_TABLE)
            .select('count')
            .eq('id', COUNTER_ID)
            .single();
        
        if (fetchError) {
            console.error('Error checking counter existence:', fetchError);
        }
        
        console.log('Counter data:', existingCounter);
        
        if (existingCounter) {
            // Update existing counter
            console.log('Updating existing counter from', existingCounter.count, 'to', existingCounter.count + 1);
            const { error } = await supabaseClient
                .from(COUNTER_TABLE)
                .update({ count: existingCounter.count + 1 })
                .eq('id', COUNTER_ID);
            
            if (error) {
                console.error('Error incrementing play count:', error);
                return false;
            }
            
            return existingCounter.count + 1;
        } else {
            // Create new counter
            console.log('Creating new counter with initial value 1');
            const { error } = await supabaseClient
                .from(COUNTER_TABLE)
                .insert([{ id: COUNTER_ID, count: 1 }]);
            
            if (error) {
                console.error('Error creating play count:', error);
                return false;
            }
            
            return 1;
        }
    } catch (err) {
        console.error('Failed to increment play count:', err);
        console.error('Error details:', err.message);
        return false;
    }
}

// Function to update the counter display
async function updatePlayCountDisplay() {
    console.log('Updating play count display...');
    const countElement = document.getElementById('play-count');
    if (!countElement) {
        console.error('Play count element not found in DOM');
        return;
    }
    
    countElement.textContent = '...';
    
    try {
        console.log('Fetching current play count...');
        const count = await getPlayCount();
        console.log('Retrieved play count:', count);
        countElement.textContent = count.toLocaleString();
    } catch (err) {
        console.error('Error updating play count display:', err);
        console.error('Error details:', err.message);
        countElement.textContent = 'many';
    }
}

// Function to initialize the counter
async function initializeCounter() {
    console.log('Initializing counter...');
    // Update the display with the current count
    await updatePlayCountDisplay();
    console.log('Counter initialization complete');
} 