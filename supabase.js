// Supabase configuration
const SUPABASE_URL = https://wvvedaebslmainspcjdq.supabase.co'; // Replace with your Supabase URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2dmVkYWVic2xtYWluc3BjamRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0OTM5NTAsImV4cCI6MjA1NzA2OTk1MH0.ZtG03B-Coa2hKn_q3WkJOjOaxSiJ0jHsmFI7VARZKMw'; // Replace with your Supabase anon key

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Counter table name
const COUNTER_TABLE = 'game_counters';
const COUNTER_ID = 'oregon_fail_counter';

// Function to get the current play count
async function getPlayCount() {
    try {
        const { data, error } = await supabaseClient
            .from(COUNTER_TABLE)
            .select('count')
            .eq('id', COUNTER_ID)
            .single();
        
        if (error) {
            console.error('Error fetching play count:', error);
            return 0;
        }
        
        return data ? data.count : 0;
    } catch (err) {
        console.error('Failed to get play count:', err);
        return 0;
    }
}

// Function to increment the play count
async function incrementPlayCount() {
    try {
        // First check if the counter exists
        const { data: existingCounter } = await supabaseClient
            .from(COUNTER_TABLE)
            .select('count')
            .eq('id', COUNTER_ID)
            .single();
        
        if (existingCounter) {
            // Update existing counter
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
        return false;
    }
}

// Function to update the counter display
async function updatePlayCountDisplay() {
    const countElement = document.getElementById('play-count');
    if (!countElement) return;
    
    countElement.textContent = '...';
    
    try {
        const count = await getPlayCount();
        countElement.textContent = count.toLocaleString();
    } catch (err) {
        console.error('Error updating play count display:', err);
        countElement.textContent = 'many';
    }
}

// Function to initialize the counter
async function initializeCounter() {
    // Update the display with the current count
    await updatePlayCountDisplay();
} 