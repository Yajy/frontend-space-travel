<script lang="ts">
  interface Schedule {
    scheduleId: string;
    departureTime: string;
    arrivalTime: string;
    availableSeats: number;
  }

  interface Flight {
    flightName: string;
    sourceName: string;
    destinationName: string;
    price: number;
    seatType: string;
    additionalInfo: string;
    schedules?: Schedule[];
  }

  export let flights: Flight[] = [];
  import { goto } from '$app/navigation';
  import { searchFlightData } from "$lib/stores/searchFlightData";



  function getFlightDetails(flightScheduleId: string): void {
        console.log("Navigating to flight details with ID:", flightScheduleId);
        searchFlightData.set(flightScheduleId);
        goto("/flight-details");
  }


</script>

<div class="flight-list">
  {#each flights as flight}
    <div class="flight-card">
      <div class="title">{flight.flightName}</div>
      <div class="subtitle">{flight.sourceName} → {flight.destinationName}</div>
      
      <div class="price">{flight.price}</div>
      <div class="seat-type">Seat Type: {flight.seatType}</div>

      {#if flight.schedules && flight.schedules.length > 0}
        <div class="schedule">
          <div>Departure: {flight.schedules[0].departureTime}</div>
          <div>Arrival: {flight.schedules[0].arrivalTime}</div>
          <div>Seats Available: {flight.schedules[0].availableSeats}</div>
        </div>
      {/if}

      <button 
        class="btn" 
        on:click={() => flight.schedules?.[0]?.scheduleId && getFlightDetails(flight.schedules[0].scheduleId)}
        disabled={!flight.schedules?.[0]?.scheduleId}
      >
        Book Now
      </button>
    </div>
  {/each}
</div>

<style>
  .flight-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 50%;
    margin: 0 auto;
    padding: 0;
  }

  .flight-card {
    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: hidden;
    display: flex !important;
    flex-direction: column !important;
  }

  .flight-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }

  .flight-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
    border-color: rgba(102, 126, 234, 0.3);
  }

  .title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: #1e293b;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    color: #64748b;
    margin-bottom: 1rem;
    font-size: 1rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .subtitle::before {
    content: '🚀';
    font-size: 1.2rem;
  }

  .price {
    font-weight: 800;
    font-size: 2rem;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .price::before {
    content: '₹';
    color: #059669;
  }

  .seat-type {
    color: #6b7280;
    font-size: 0.95rem;
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 12px;
    display: inline-block;
    font-weight: 500;
    border: 1px solid rgba(102, 126, 234, 0.2);
  }

  .schedule {
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
    color: #475569;
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    padding: 1.25rem;
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    position: relative;
  }

  .schedule::before {
    content: '📅';
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.25rem;
  }

  .schedule div {
    margin-bottom: 0.5rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .schedule div:last-child {
    margin-bottom: 0;
  }

  .schedule div:nth-child(1)::before { content: '🛫'; }
  .schedule div:nth-child(2)::before { content: '🛬'; }
  .schedule div:nth-child(3)::before { content: '💺'; }

  .btn {
    margin-top: auto;
    padding: 1rem 2rem;
    border-radius: 16px;
    border: none;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
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
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  .btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
  }

  .btn:hover::before {
    left: 100%;
  }

  .btn:disabled {
    background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 12px rgba(156, 163, 175, 0.2);
  }

  .btn:active:not(:disabled) {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    .flight-list {
      gap: 1rem;
    }
    
    .flight-card {
      padding: 1.5rem;
    }
    
    .title {
      font-size: 1.3rem;
    }
    
    .price {
      font-size: 1.75rem;
    }
  }
</style>