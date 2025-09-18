<script lang="ts">
  import { onMount } from "svelte";
  import FlightCardList from "$lib/FlightCardList.svelte";
  import ErrorOverlay from "$lib/ErrorOverlay.svelte";
  import ThemeToggle from "$lib/ThemeToggle.svelte";

  import { searchFlightData } from "$lib/stores/searchFlightData";
  import { departDate } from "$lib/stores/departureDate";
  import { passengerCount } from "$lib/stores/passengerCount";
  import { passengerId } from "$lib/stores/passengerId";
  import { paymentResponse } from "$lib/stores/paymentResponse";
  import { theme } from "$lib/stores/theme";
  import { goto } from "$app/navigation";
  import { tick } from "svelte";


  let showError = false;
  let errorMessage = "";

  let source = "";
  let destination = "";

  let flights: any[] = [];
  let currentPage = 0;
  let size = 5;
  let totalPages = 0;
  let totalElements = 0;
  let loading = false;
  let hasSearched = false;
  let canLoadMore = true;

  let today = new Date().toISOString().split('T')[0];
  let departureDate = today;

  $: {
    console.log("Dashboard - Passenger ID:", $passengerId);
    console.log("Dashboard - Is logged in:", !!$passengerId);
  }

  async function fetchFlights(isNewSearch = false) {
    if (loading) return;

    if (!isNewSearch && !canLoadMore) {
      console.log("Cannot load more flights");
      return;
    }

    loading = true;
    
    const pageToFetch = isNewSearch ? 0 : currentPage + 1;
    console.log(`Fetching page ${pageToFetch}`);

    try {
      const encodedSource = encodeURIComponent(source.trim());
      const encodedDestination = encodeURIComponent(destination.trim());
      const encodedDate = encodeURIComponent(departureDate);

      const res = await fetch(
        `http://localhost:11110/api/flights/search?source=${encodedSource}&destination=${encodedDestination}&date=${encodedDate}&page=${pageToFetch}&size=${size}`
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log("API Response:", data);

      let newFlights: any[] = [];

      if (data.flights && Array.isArray(data.flights)) {
        newFlights = data.flights;
        totalPages = data.totalPages ?? Math.ceil((data.totalElements ?? data.flights.length) / size);
        totalElements = data.totalElements ?? data.flights.length;
      } else if (data.content && Array.isArray(data.content)) {
        newFlights = data.content;
        totalPages = data.totalPages ?? Math.ceil(data.totalElements / size);
        totalElements = data.totalElements ?? 0;
      } else if (Array.isArray(data)) {
        newFlights = data;
        totalPages = Math.ceil(data.length / size);
        totalElements = data.length;
      } else {
        console.warn("Unexpected API response structure:", data);
        newFlights = [];
        totalPages = 1;
        totalElements = 0;
      }

      if (isNewSearch) {
        flights = newFlights;
        currentPage = 0;
      } else {
        flights = [...flights, ...newFlights];
        currentPage = pageToFetch;
      }

      canLoadMore = currentPage < totalPages && newFlights.length > 0;
      
      console.log(`Current page: ${currentPage}, Total pages: ${totalPages}, Can load more: ${canLoadMore}`);

      //here
      await tick();
      autoFillFlights();

    } catch (err: any) {
      console.error("Error fetching flights:", err);
      errorMessage = err.message || "Something went wrong, please try again later.";
      showError = true;
      
      if (isNewSearch) {
        flights = [];
        currentPage = 0;
        totalPages = 0;
        totalElements = 0;
        canLoadMore = false;
      }
    } finally {
      loading = false;
    }
  }

 function autoFillFlights() {
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;

  if (!loading && canLoadMore && scrollHeight <= clientHeight) {
    console.log("Content too short, auto-fetching more flights...");
    fetchFlights();
  }
}
  async function handleSubmit(event: Event) {
    event.preventDefault();
    $departDate = departureDate;

    if (!source.trim() || !destination.trim() || !departureDate) {
      alert("Please fill in all fields");
      return;
    }

    flights = [];
    currentPage = 0;
    totalPages = 0;
    totalElements = 0;
    hasSearched = true;
    canLoadMore = true;

    console.log("Starting new search:", {
      source,
      destination,
      departureDate,
      passengers: $passengerCount
    });

    await fetchFlights(true);
  }

  function handleScroll() {
    if (loading || !hasSearched || !canLoadMore) {
      return;
    }

    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    const scrolledPercent = (scrollTop / (scrollHeight - clientHeight));

    if (scrolledPercent >= 0.8) {
      console.log("Scroll threshold reached, loading more flights...");
      fetchFlights();
    }
  }

  let isThrottled = false;
  function throttledHandleScroll() {
    if (isThrottled) return;
    
    isThrottled = true;
    requestAnimationFrame(() => {
      handleScroll();
      setTimeout(() => {
        isThrottled = false;
      }, 100);
    });
  }

  onMount(() => {
    theme.subscribe(value => {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', value);
      }
    });
    
    window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  });
</script>

<h1>Welcome to Interstellar</h1>

<ThemeToggle />

<!-- <div class="user-status">
  {#if $passengerId}
    <span class="login-status logged-in">✅ Logged In</span>
    <button on:click={() => { passengerId.set(null); goto('/login'); }} class="logout-btn">Logout</button>
    <button on:click={() => {
      // Test order page with sample data
      paymentResponse.set({
        paymentStatus: 'COMPLETED',
        orderId: 'TEST-ORDER-123',
        sourceName: 'Earth',
        destinationName: 'Mars',
        price: 50000,
        departureTime: '10:00',
        arrivalTime: '14:00',
        flightName: 'Test Flight',
        seatType: 'Standard'
      });
      goto('/order');
    }} class="test-btn">Test Order</button>
  {:else}
    <span class="login-status not-logged">❌ Not Logged In</span>
    <button on:click={() => goto('/login')} class="login-btn">Login</button>
  {/if}
</div> -->

<main>
  <div class="search-section">
    <form on:submit={handleSubmit} class="search-form">
      <div class="form-group">
        <label for="source">Departure Location</label>
        <input
          id="source"
          type="text"
          placeholder="Earth, Mars, Europa..."
          bind:value={source}
          required
        />
      </div>
      <div class="form-group">
        <label for="destination">Destination</label>
        <input
          id="destination"
          type="text"
          placeholder="Cooper Station, Proxima B..."
          bind:value={destination}
          required
        />
      </div>
      <div class="form-group">
        <label for="date">Departure Date</label>
        <input id="date" type="date" bind:value={departureDate} min={today} required />
      </div>
      <div class="form-group">
        <label for="passengers">Passengers</label>
        <input
          id="passengers"
          type="number"
          min="1"
          max="10"
          placeholder="1"
          bind:value={$passengerCount}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading && currentPage <= 1 ? "🚀 Searching..." : "🚀 Search Flights"}
      </button>
    </form>
  </div>

  <h2>🌌 Available Flights</h2>

  {#if !hasSearched}
    <div class="no-search">
      <p>✨ Enter your search criteria above to discover amazing space flights!</p>
    </div>
  {:else if flights.length === 0 && !loading}
    <div class="no-flights">
      <p>🔍 No flights found. Please try different search criteria.</p>
    </div>
  {:else if flights.length > 0}
    <FlightCardList {flights} />

    <div class="pagination-info">
      <p>
        ✈️ Showing {flights.length} of {totalElements} flights 
        {#if totalPages > 0}
          (Page {currentPage} of {totalPages})
        {/if}
      </p>
    </div>

    {#if loading}
      <div class="loading">
        <div class="spinner"></div>
        <p>🚀 Loading more flights...</p>
      </div>
    {/if}

    {#if !canLoadMore && !loading && flights.length > 0}
      <div class="end-message">
        <p>🎯 All flights loaded ({flights.length} total).</p>
      </div>
    {/if}
  {/if}
</main>

<ErrorOverlay
  show={showError}
  message={errorMessage}
  onClose={() => (showError = false)}
/>

<style>
  /* CSS Variables for theming */
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
  }

  :global(body) {
    background: var(--bg-body);
    color: var(--text-primary);
    min-height: 100vh;
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    transition: background 0.3s ease, color 0.3s ease;
  }

  h1 {
    text-align: center;
    margin-bottom: 3rem;
    color: var(--text-primary);  
    font-size: 3.5rem;
    font-weight: 800;
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

  .user-status {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 4rem;
    background: var(--bg-surface);
    backdrop-filter: var(--backdrop-blur);
    padding: 1.5rem 2.5rem;
    border-radius: 20px;
    border: 2px solid var(--border-color);
    box-shadow: var(--shadow-lg);
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    position: relative;
    overflow: hidden;
  }

  .user-status::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 1.5s ease;
  }

  .user-status:hover::before {
    left: 100%;
  }

  .login-status {
    font-weight: 700;
    font-size: 1.1rem;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    backdrop-filter: blur(10px);
  }

  .logged-in {
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
  }

  .not-logged {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .login-btn, .logout-btn, .test-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .login-btn {
    background: var(--bg-primary);
    color: var(--text-inverse);
  }

  .login-btn:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }

  .logout-btn {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: var(--text-inverse);
  }

  .logout-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
  }

  .test-btn {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: var(--text-inverse);
  }

  .test-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  }

  main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    position: relative;
  }

  .search-section {
    background: var(--bg-surface);
    backdrop-filter: var(--backdrop-blur);
    padding: 3rem;
    border-radius: 28px;
    margin-bottom: 4rem;
    box-shadow: var(--shadow-lg);
    border: 2px solid var(--border-color);
    position: relative;
    overflow: hidden;
  }

  .search-section::before {
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

  .search-section:hover::before {
    opacity: 0.1;
  }

  .search-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    align-items: end;
  }

  .form-group {
    position: relative;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: 700;
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .form-group input {
    width: 100%;
    padding: 1.25rem 1.5rem;
    border: 2px solid var(--border-subtle);
    border-radius: 16px;
    font-size: 1.1rem;
    background: var(--bg-surface-elevated);
    color: var(--text-primary);
    transition: all 0.3s ease;
    font-weight: 500;
  }

  .form-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
    transform: translateY(-2px);
    background: var(--bg-surface);
  }

  .form-group input::placeholder {
    color: var(--text-muted);
    font-weight: 400;
  }

  button[type="submit"] {
    padding: 1.25rem 3rem;
    background: var(--bg-primary);
    color: var(--text-inverse);
    border: none;
    border-radius: 16px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: var(--shadow-md);
    position: relative;
    overflow: hidden;
  }

  button[type="submit"]::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.5s ease;
  }

  button[type="submit"]:hover::before {
    width: 300px;
    height: 300px;
  }

  button[type="submit"]:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
  }

  button[type="submit"]:disabled {
    background: linear-gradient(135deg, var(--text-muted) 0%, var(--text-secondary) 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: var(--shadow-sm);
  }

  h2 {
    margin: 4rem 0 3rem 0;
    color: var(--text-primary);
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    text-shadow: 0 2px 4px var(--shadow-color);
    position: relative;
  }

  h2::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: var(--bg-accent);
    border-radius: 2px;
  }

  .no-search, .no-flights, .pagination-info, .loading, .end-message {
    background: var(--bg-overlay);
    backdrop-filter: var(--backdrop-blur);
    padding: 2.5rem;
    border-radius: 20px;
    text-align: center;
    margin: 2rem 0;
    border: 2px solid var(--border-color);
    box-shadow: var(--shadow-md);
  }

  .no-search p, .no-flights p {
    color: var(--text-secondary);
    font-size: 1.2rem;
    margin: 0;
    font-weight: 500;
  }

  .pagination-info {
    color: var(--text-muted);
    font-size: 1rem;
    padding: 2rem;
    font-weight: 600;
  }

  .loading {
    color: #667eea;
    font-weight: 700;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .loading p {
    margin: 0;
    font-size: 1.1rem;
  }

  .end-message {
    color: var(--text-muted);
    font-style: italic;
    padding: 2rem;
    font-weight: 500;
  }

  /* Enhanced loading spinner */
  .spinner {
    width: 32px;
    height: 32px;
    border: 4px solid var(--border-subtle);
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Flight cards container */
  :global(.flight-list) {
    background: var(--bg-overlay);
    backdrop-filter: var(--backdrop-blur);
    padding: 3rem;
    border-radius: 24px;
    box-shadow: var(--shadow-lg);
    border: 2px solid var(--border-color);
    margin-bottom: 3rem;
  }

  /* Responsive design */
  @media (max-width: 1024px) {
    main {
      padding: 1.5rem;
    }
    
    .search-section {
      padding: 2rem;
    }
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 2.5rem;
      margin-bottom: 2rem;
    }

    .user-status {
      flex-direction: column;
      gap: 1rem;
      padding: 1.5rem;
      margin-bottom: 3rem;
    }

    .search-section {
      padding: 1.5rem;
      margin-bottom: 3rem;
    }

    .search-form {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    button[type="submit"] {
      width: 100%;
      padding: 1.5rem;
    }

    h2 {
      font-size: 2rem;
    }
  }

  @media (max-width: 480px) {
    h1 {
      font-size: 2rem;
    }

    .search-section {
      border-radius: 20px;
      padding: 1rem;
    }

    .user-status {
      border-radius: 16px;
    }
  }

  /* Enhanced error overlay */
  .error-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(5px);
  }

  .error-card {
    background: var(--bg-surface);
    color: var(--text-primary);
    padding: 2.5rem;
    border-radius: 24px 24px 0 0;
    text-align: center;
    width: 100%;
    max-width: 500px;
    box-shadow: var(--shadow-lg);
    position: relative;
    animation: slideUp 0.4s ease-out;
    border: 2px solid var(--border-color);
  }

  .error-card .icon {
    font-size: 3rem;
    margin-bottom: 1.5rem;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-muted);
    transition: color 0.3s ease;
  }

  .close-btn:hover {
    color: var(--text-primary);
  }

  @keyframes slideUp {
    from { 
      transform: translateY(100%);
      opacity: 0;
    }
    to { 
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>