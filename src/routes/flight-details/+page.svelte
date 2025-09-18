<script lang="ts">
    import { onMount } from "svelte";
    import { searchFlightData } from "$lib/stores/searchFlightData";
    import { departDate } from "$lib/stores/departureDate";
    import { theme } from "$lib/stores/theme";
    import FlightDetailCard from "$lib/cards/FlightDetailCard.svelte";
    import ErrorOverlay from "$lib/ErrorOverlay.svelte";
    import ThemeToggle from "$lib/ThemeToggle.svelte";


    let showError = false;
    let errorMessage = "";
    
    interface Schedule {
        scheduleId: string;
        dayOfWeek: number;
        departureTime: string;
        arrivalTime: string;
        availableSeats: number;
        availabilityStatus: string;
    }

    interface FlightDetails {
        flightId: string;
        flightName: string;
        sourceName: string;
        destinationName: string;
        price: number;
        seatType: string;
        additionalInfo: string;
        schedules?: Schedule[];
    }
    
    let departureDate: string | null;
    $: departureDate = $departDate;

    let flightScheduleId: string | null;
    $: flightScheduleId = $searchFlightData;
    console.log("Flight Schedule ID from store:", $searchFlightData);

    let detailOfFlight: FlightDetails | null = null;

    onMount(async () => {
        // Initialize theme from localStorage
        theme.subscribe(value => {
            if (typeof document !== 'undefined') {
                document.documentElement.setAttribute('data-theme', value);
            }
        });

        if (!flightScheduleId) {
            console.error("No flightScheduleId available");
            return;
        }
        try {
            const res = await fetch(`http://localhost:11110/api/flights/${flightScheduleId}`);
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }
            const data = await res.json();
            detailOfFlight = data;
            console.log("Flight Details:", detailOfFlight);
        } catch (err: any) {
            console.error("Error fetching flight details:", err);
            errorMessage = err.message || "Something went wrong during payment.";
            showError = true;
        }
    });
</script>

<main>
    <ThemeToggle />
    
    <div class="page-header">
        <h1>🚀 Flight Details</h1>
        <!-- {#if departureDate}
            <div class="departure-info">
                <span class="departure-label">Departure Date:</span>
                <span class="departure-value">{departureDate}</span>
            </div>
        {/if} -->
    </div>

    {#if detailOfFlight}
        <FlightDetailCard flightDetails={detailOfFlight} />
    {:else}
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>✨ Loading your flight details...</p>
        </div>
    {/if}
</main>
<ErrorOverlay
  show={showError}
  message={errorMessage}
  onClose={() => (showError = false)}
/>

<style>
    /* CSS Variables for theming - consistent with dashboard */
    :global(:root) {
        /* Light theme */
        --bg-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        --bg-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        --bg-accent: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        --bg-surface: rgba(255, 255, 255, 0.95);
        --bg-surface-elevated: rgba(255, 255, 255, 0.98);
        --bg-overlay: rgba(255, 255, 255, 0.9);
        --bg-body: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fff3e0 100%);
        --text-primary: #1a202c;
        --text-secondary: #4a5568;
        --text-muted: #718096;
        --text-inverse: #ffffff;
        --border-color: rgba(255, 255, 255, 0.3);
        --border-subtle: #e2e8f0;
        --shadow-sm: 0 4px 15px rgba(0, 0, 0, 0.1);
        --shadow-md: 0 8px 25px rgba(0, 0, 0, 0.15);
        --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.1);
        --shadow-color: rgba(0, 0, 0, 0.1);
        --backdrop-blur: blur(20px);
        --success-color: #10b981;
        --success-bg: rgba(16, 185, 129, 0.1);
    }

    :global([data-theme="dark"]) {
        /* Dark theme */
        --bg-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        --bg-secondary: linear-gradient(135deg, #fc466b 0%, #3f5efb 100%);
        --bg-accent: linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%);
        --bg-surface: rgba(30, 41, 59, 0.95);
        --bg-surface-elevated: rgba(51, 65, 85, 0.98);
        --bg-overlay: rgba(15, 23, 42, 0.9);
        --bg-body: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
        --text-primary: #f8fafc;
        --text-secondary: #cbd5e1;
        --text-muted: #94a3b8;
        --text-inverse: #1a202c;
        --border-color: rgba(255, 255, 255, 0.1);
        --border-subtle: #334155;
        --shadow-sm: 0 4px 15px rgba(0, 0, 0, 0.3);
        --shadow-md: 0 8px 25px rgba(0, 0, 0, 0.4);
        --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.3);
        --shadow-color: rgba(0, 0, 0, 0.4);
        --backdrop-blur: blur(20px);
        --success-color: #34d399;
        --success-bg: rgba(52, 211, 153, 0.1);
    }

    :global(body) {
        background: var(--bg-body);
        color: var(--text-primary);
        min-height: 100vh;
        margin: 0;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        transition: background 0.3s ease, color 0.3s ease;
    }

    main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        min-height: 100vh;
        position: relative;
    }

    .page-header {
        text-align: center;
        margin-bottom: 4rem;
        background: var(--bg-surface);
        backdrop-filter: var(--backdrop-blur);
        padding: 3rem 2rem;
        border-radius: 28px;
        border: 2px solid var(--border-color);
        box-shadow: var(--shadow-lg);
        position: relative;
        overflow: hidden;
    }

    .page-header::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: var(--bg-primary);
        border-radius: 28px;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .page-header:hover::before {
        opacity: 0.1;
    }

    h1 {
        color: var(--text-primary);
        font-size: 3.5rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
        text-shadow: 0 4px 8px var(--shadow-color);
        letter-spacing: -1px;
        background: var(--bg-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: titleGlow 3s ease-in-out infinite alternate;
    }

    @keyframes titleGlow {
        0% { filter: brightness(1) contrast(1); }
        100% { filter: brightness(1.1) contrast(1.1); }
    }

    .departure-info {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
        font-size: 1.2rem;
    }

    .departure-label {
        color: var(--text-muted);
        font-weight: 500;
    }

    .departure-value {
        color: var(--text-primary);
        font-weight: 700;
        background: var(--bg-surface-elevated);
        padding: 0.5rem 1rem;
        border-radius: 12px;
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-sm);
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem;
        background: var(--bg-surface);
        backdrop-filter: var(--backdrop-blur);
        border-radius: 28px;
        border: 2px solid var(--border-color);
        box-shadow: var(--shadow-lg);
        margin-top: 2rem;
    }

    .loading-container p {
        color: var(--text-secondary);
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 1.5rem;
    }

    .loading-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid var(--border-subtle);
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Responsive design */
    @media (max-width: 1024px) {
        main {
            padding: 1.5rem;
        }
        
        .page-header {
            padding: 2rem;
        }
    }

    @media (max-width: 768px) {
        main {
            padding: 1rem;
        }

        h1 {
            font-size: 2.5rem;
        }

        .page-header {
            padding: 1.5rem;
            margin-bottom: 2rem;
        }

        .departure-info {
            flex-direction: column;
            gap: 0.5rem;
            font-size: 1.1rem;
        }

        .loading-container {
            padding: 2rem;
        }
    }

    @media (max-width: 480px) {
        h1 {
            font-size: 2rem;
        }

        .page-header {
            padding: 1rem;
            border-radius: 20px;
        }
    }
</style>
