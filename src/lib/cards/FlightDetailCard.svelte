<script lang="ts">
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

    export let flightDetails: FlightDetails | null = null;
    import { goto } from '$app/navigation';
    import { searchFlightData } from "$lib/stores/searchFlightData";
    import { departDate } from "$lib/stores/departureDate";
    import { passengerId } from "$lib/stores/passengerId";
    import { passengerCount } from "$lib/stores/passengerCount";
    import { bookingResponse } from "$lib/stores/bookingResponse";

    let numberOfSeats = 1;
    let isLoading = false;

    $: if ($passengerCount && $passengerCount !== numberOfSeats) {
        numberOfSeats = $passengerCount;
    }

    // Debug passenger ID
    $: {
        console.log("FlightDetailCard - Passenger ID:", $passengerId);
        console.log("FlightDetailCard - Is logged in:", !!$passengerId);
    }

    async function proceedToPay(): Promise<void> {
        if (!flightDetails?.flightId || !flightDetails?.schedules?.[0]?.scheduleId) {
            alert("Flight information is incomplete");
            return;
        }

        if (!$passengerId) {
            alert("Please login first to proceed with booking");
            return;
        }

        // if (numberOfSeats < 1) {
        //     alert("Please select at least 1 seat");
        //     return;
        // }

        isLoading = true;

        console.log("Proceed API - numberOfSeats:", numberOfSeats);
        console.log("Proceed API - $passengerCount:", $passengerCount);

        const payload = {
            flightId: flightDetails.flightId,
            scheduleId: flightDetails.schedules[0].scheduleId,
            passengerId: $passengerId,
            numberOfSeats: numberOfSeats,
            departureDate: $departDate 
        };

        console.log("Proceed API payload:", payload);

        try {
            const response = await fetch("http://localhost:11110/api/orders/proceed", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Proceed API response:", data);
            
            if (data.success === true) {
                bookingResponse.set(data);
                goto('/payment');
                
            } else {
                alert("Error in Booking: " + (data.message || "Unknown error"));
            }

        } catch (err: any) {
            console.error("Proceed API error:", err);
            alert("Error: " + err.message);
        } finally {
            isLoading = false;
        }
    }
</script>

{#if flightDetails}
<div class="flightDetailCard">
  <div class="flight-card">
    <!-- <div class="departureDate">
      {#if $departDate}
        Departure Date: {$departDate}
      {/if}
    </div> -->

    <div class="title">{flightDetails.flightName}</div>
    <div class="subtitle">{flightDetails.sourceName} → {flightDetails.destinationName}</div>

    <div class="price">₹{flightDetails.price}</div>
    <div class="seat-type">Seat Type: {flightDetails.seatType}</div>
    <div class="additional-info">Itinerary Info: {flightDetails.additionalInfo}</div>

    {#if flightDetails.schedules && flightDetails.schedules.length > 0}
      <div class="schedule">
        <div>Departure: {$departDate} | Time: {flightDetails.schedules[0].departureTime}</div>
        <div>Arrival: {$departDate} | Time: {flightDetails.schedules[0].arrivalTime}</div>
        <div>Seats Available: {flightDetails.schedules[0].availableSeats}</div>
        <div>Status: {flightDetails.schedules[0].availabilityStatus}</div>
      </div>

      <!-- <div class="seat-selection">
        <label for="numberOfSeats">Number of Seats:</label>
        <input 
          id="numberOfSeats"
          type="number" 
          bind:value={numberOfSeats} 
          on:input={() => passengerCount.set(numberOfSeats)}
          min="1" 
          max={flightDetails.schedules[0].availableSeats}
          class="seat-input"
        />
      </div> -->

      <button
        class="btn"
        on:click={proceedToPay}
        disabled={isLoading || !$passengerId}
      >
        {#if isLoading}
          Processing...
        {:else if !$passengerId}
          Please Login First
        {:else}
          Proceed to Pay Per Person({flightDetails.price})
        {/if}
      </button>
    {:else}
      <div class="no-schedule">No schedules available for this flight.</div>
    {/if}
  </div>
</div>
{:else}
  <p>No flight details to show.</p>
{/if}

<style>
    /* CSS Variables inherited from parent theming system */
    .flight-card {
        background: var(--bg-surface);
        border: 2px solid var(--border-color);
        border-radius: 28px;
        padding: 3rem;
        box-shadow: var(--shadow-lg);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        overflow: hidden;
        max-width: 90%;
        margin: 0 auto;
        backdrop-filter: var(--backdrop-blur);
    }

    .flight-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 8px;
        background: var(--bg-primary);
        border-radius: 28px 28px 0 0;
    }

    .flight-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 25px 50px rgba(102, 126, 234, 0.25);
    }

    .departureDate {
        background: var(--bg-surface-elevated);
        color: var(--text-primary);
        padding: 1rem 1.5rem;
        border-radius: 16px;
        font-weight: 700;
        text-align: center;
        margin-bottom: 2rem;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.75rem;
        border: 2px solid var(--border-color);
        box-shadow: var(--shadow-sm);
        font-size: 1.1rem;
    }

    .departureDate::before {
        content: '✈️';
        font-size: 1.5rem;
    }

    .title {
        font-size: 2.8rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
        background: var(--bg-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-align: center;
        letter-spacing: -1px;
    }

    .subtitle {
        color: var(--text-secondary);
        margin-bottom: 2.5rem;
        font-size: 1.4rem;
        font-weight: 600;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
    }

    .subtitle::before {
        content: '🚀';
        font-size: 1.8rem;
    }

    .subtitle::after {
        content: '🌟';
        font-size: 1.8rem;
    }

    .price {
        font-weight: 900;
        font-size: 3.5rem;
        background: linear-gradient(135deg, var(--success-color) 0%, #22c55e 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 2rem;
        text-align: center;
        text-shadow: 0 2px 4px var(--shadow-color);
    }

    .seat-type, .additional-info {
        background: var(--bg-surface-elevated);
        border: 2px solid var(--border-color);
        color: var(--text-primary);
        border-radius: 16px;
        margin-bottom: 1.5rem;
        padding: 1rem 1.5rem;
        text-align: center;
        font-weight: 600;
        transition: all 0.3s ease;
    }

    .seat-type:hover, .additional-info:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-sm);
    }

    .schedule {
        background: var(--bg-surface-elevated);
        border: 2px solid var(--border-color);
        border-radius: 20px;
        padding: 2rem;
        margin-bottom: 2.5rem;
        position: relative;
        backdrop-filter: var(--backdrop-blur);
    }

    .schedule::before {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        font-size: 2.5rem;
        opacity: 0.7;
    }

    .schedule div {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-bottom: 1rem;
        gap: 0.5rem;
        padding: 0.75rem;
        border-radius: 12px;
        transition: all 0.3s ease;
        font-weight: 600;
        color: var(--text-primary);
    }

    .schedule div:hover {
        background: var(--bg-surface);
        transform: translateX(4px);
    }

    .schedule div:last-child {
        background: var(--success-bg);
        color: var(--success-color);
        font-weight: 700;
        border: 2px solid var(--success-color);
        margin-bottom: 0;
    }

    .schedule div:nth-child(1) { 
        background: rgba(59, 130, 246, 0.1);
        border-left: 4px solid #3b82f6;
    }
    .schedule div:nth-child(1)::before { 
        content:  '🛫';
        font-size: 1.5rem; 
        margin-right: 0.5rem;
    }

    .schedule div:nth-child(2) { 
        background: rgba(168, 85, 247, 0.1);
        border-left: 4px solid #a855f7;
    }
    .schedule div:nth-child(2)::before { 
        content: '🛬'; 
        font-size: 1.5rem; 
        margin-right: 0.5rem;
    }

    .schedule div:nth-child(3) { 
        background: rgba(245, 158, 11, 0.1);
        border-left: 4px solid #f59e0b;
    }
    .schedule div:nth-child(3)::before { 
        content: '💺'; 
        font-size: 1.5rem; 
        margin-right: 0.5rem;
    }

    .schedule div:nth-child(4)::before { 
        content: '✅'; 
        font-size: 1.5rem; 
        margin-right: 0.5rem;
    }

    .btn {
        width: 100%;
        padding: 1.5rem 2rem;
        background: var(--bg-primary);
        color: var(--text-inverse);
        border: none;
        border-radius: 16px;
        font-size: 1.2rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
        box-shadow: var(--shadow-md);
        position: relative;
        overflow: hidden;
    }

    .btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s ease;
    }

    .btn:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
    }

    .btn:hover::before {
        left: 100%;
    }

    .btn:disabled {
        background: linear-gradient(135deg, var(--text-muted) 0%, var(--text-secondary) 100%);
        color: var(--text-inverse);
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
        box-shadow: var(--shadow-sm);
    }

    .btn:active:not(:disabled) {
        transform: translateY(-1px);
    }

    .no-schedule {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
        border: 2px solid rgba(239, 68, 68, 0.3);
        border-radius: 16px;
        padding: 2rem;
        text-align: center;
        font-weight: 600;
        font-size: 1.1rem;
    }

    /* Responsive design */
    @media (max-width: 1024px) {
        .flight-card {
            max-width: 95%;
            padding: 2.5rem;
        }
    }

    @media (max-width: 768px) {
        .flight-card {
            padding: 2rem;
            margin: 1rem;
            max-width: calc(100% - 2rem);
        }

        .title {
            font-size: 2.2rem;
        }

        .price {
            font-size: 2.8rem;
        }

        .schedule {
            padding: 1.5rem;
        }

        .schedule::before {
            font-size: 2rem;
            top: 1rem;
            right: 1rem;
        }

        .btn {
            padding: 1.25rem;
            font-size: 1.1rem;
        }

        .subtitle {
            font-size: 1.2rem;
            gap: 0.5rem;
        }
    }

    @media (max-width: 480px) {
        .flight-card {
            padding: 1.5rem;
            border-radius: 20px;
        }

        .title {
            font-size: 1.8rem;
        }

        .price {
            font-size: 2.5rem;
        }

        .schedule div {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
        }

        .departureDate {
            font-size: 1rem;
            padding: 0.75rem 1rem;
        }
    }
</style>
