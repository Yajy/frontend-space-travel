<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { bookingResponse } from "$lib/stores/bookingResponse";
    import { departDate } from "$lib/stores/departureDate";
    import { paymentResponse } from "$lib/stores/paymentResponse";
    import { theme } from "$lib/stores/theme";
    import ErrorOverlay from "$lib/ErrorOverlay.svelte";
    import ThemeToggle from "$lib/ThemeToggle.svelte";


    interface BookingData {
        orderId: string;
        flightId: string;
        scheduleId: string;
        passengerId: string;
        totalAmount: number;
        success: boolean;
        sourceName: string;
        destinationName: string;
        message: string;
        departureTime: string;
        arrivalTime: string;
        numberOfSeats: number;
    }

    let bookingData: BookingData | null = null;
    let isLoading = false;
    let showError = false;
    let errorMessage = "";

    let selectedMethod: string | null = null;


    onMount(() => {
        // Initialize theme from localStorage
        theme.subscribe(value => {
            if (typeof document !== 'undefined') {
                document.documentElement.setAttribute('data-theme', value);
            }
        });

        const unsubscribe = bookingResponse.subscribe((data) => {
            bookingData = data;
            console.log("Payment page - received booking data:", bookingData);
        });

        return () => {
            unsubscribe();
        };
    });

    /**
     {
    "orderId": "042bebce-9c7b-45fc-8d08-6eca9ec3a580",
    "flightId": "5f365719-ff64-4761-b3c4-f89923ab5488",
    "scheduleId": "a3da6677-dca4-4dd0-bcc3-86c1d8061a57",
    "passengerId": "ffb90b82-ceb8-4563-a139-bba9c42cb4f8",
    "paymentMethod": "PAID"
    }
     */

    async function Pay(status: string) {
        if (!bookingData) {
            alert("No booking data available");
            return;
        }

        isLoading = true;
        
        let paymentMethod = status;

        const payload = {
            orderId: bookingData.orderId,
            flightId: bookingData.flightId,
            scheduleId: bookingData.scheduleId,
            passengerId: bookingData.passengerId,
            paymentMethod: paymentMethod
        };

        try {
            const response = await fetch("http://localhost:11110/api/orders/payment", {
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
            console.log("Payment API response:", data);
            
            // Merge payment response with booking data for order page
            const orderData = {
                ...data,
                // Add booking details that order page needs
                sourceName: bookingData.sourceName,
                destinationName: bookingData.destinationName,
                departureTime: bookingData.departureTime,
                arrivalTime: bookingData.arrivalTime,
                price: bookingData.totalAmount,
                // Add more fields from booking data as needed
                flightName: bookingData.flightId, // or get actual flight name if available
                seatType: "Standard", // default or get from booking
                additionalInfo: bookingData.message || "",
                departureDate: $departDate,
                arrivalDate: $departDate, // same day for now
            };
            
            if (data.paymentStatus === "COMPLETED") {
                paymentResponse.set(orderData);
                console.log("Payment successful, navigating to order page with data:", orderData);
                goto('/order');
            } else if (data.paymentStatus === "CANCELLED") {
                paymentResponse.set(orderData);
                console.log("Payment cancelled, navigating to order page with data:", orderData);
                goto('/order');
            } else {
                console.error("Payment failed with status:", data.paymentStatus);
                errorMessage = data.message || "Payment failed with unknown status.";
                showError = true;
            }

        } catch (err: any) {
            console.error("Payment API error:", err);
            errorMessage = err.message || "Network error during payment.";
            showError = true;
        } finally {
            isLoading = false;
        }
    }
</script>

<main>
    <ThemeToggle />
    
    {#if bookingData}
        <!-- <div class="payment-header">
            <h1>💳 Complete Your Payment</h1>
            <div class="booking-reference">
                <span class="ref-label">Booking Reference:</span>
                <span class="ref-value">{bookingData.orderId}</span>
            </div>
        </div> -->

        <div class="payment-container">
            <div class="flight-summary">
                <div class="summary-header">
                    <h2>🎫 Flight Summary</h2>
                </div>
                
                <div class="flight-route">
                    <div class="route-point">
                        <span class="route-icon">🛫</span>
                        <span class="route-name">{bookingData.sourceName}</span>
                    </div>
                    <div class="route-arrow">✈️</div>
                    <div class="route-point">
                        <span class="route-icon">🛬</span>
                        <span class="route-name">{bookingData.destinationName}</span>
                    </div>
                </div>

                <div class="flight-details">
                    <div class="detail-item">
                        <span class="detail-icon"></span>
                        <div>
                            <span class="detail-label">Departure At</span>
                            <span class="detail-value">📅 {$departDate} </span>
                            <span class="detail-value">🕐 {bookingData.departureTime}</span>
                        </div>
                    </div>
                    
                    <!-- <div class="detail-item">
                        <span class="detail-icon">🕐</span>
                        <div>
                            <span class="detail-label">Departure Time</span>
                            <span class="detail-value">{bookingData.departureTime}</span>
                        </div>
                    </div> -->
                    
                    <div class="detail-item">
                        <span class="detail-icon"></span>
                        <div>
                            <span class="detail-label">Arrival At</span>
                            <span class="detail-value">📅 {$departDate} </span>
                            <span class="detail-value">🕑 {bookingData.arrivalTime}</span>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-icon"></span>
                        <div>
                            <span class="detail-label">Passengers</span>
                            <span class="detail-value"> 👥 {bookingData.numberOfSeats}</span>
                        </div>
                    </div>
                </div>

                <div class="total-amount">
                    <span class="amount-label">Total Amount</span>
                    <span class="amount-value">{bookingData.totalAmount}</span>
                </div>
            </div>

            <div class="payment-actions">
                <div class="payment-methods">
                    <h3>💰 Choose Payment Method</h3>
                    <div class="method-options">
                        <div class="method-option {selectedMethod === 'CARD' ? 'selected' : ''}" on:click={() => selectedMethod = 'CARD'}>
                            <span class="method-icon">💳</span>
                            <span>Credit/Debit Card</span>
                        </div>
                        <div class="method-option {selectedMethod === 'NET_BANKING' ? 'selected' : ''}" on:click={() => selectedMethod = 'NET_BANKING'}>
                            <span class="method-icon">🏦</span>
                            <span>Net Banking</span>
                        </div>
                        <div class="method-option {selectedMethod === 'DIGITAL_WALLET' ? 'selected' : ''}" on:click={() => selectedMethod = 'DIGITAL_WALLET'}>
                            <span class="method-icon">📱</span>
                            <span>Digital Wallet</span>
                        </div>
                    </div>
                </div>

                <div class="action-buttons">
                    <button 
                        on:click={() => Pay("PAID")}
                        disabled={isLoading || !selectedMethod}
                        class="btn btn-primary"
                    >
                        {#if isLoading}
                            <span class="spinner"></span>
                            Processing Payment...
                        {:else}
                            <span class="btn-icon">🚀</span>
                            Complete Payment
                        {/if}
                    </button>
                    
                    <button 
                        on:click={() => Pay("CANCELLED")}
                        disabled={isLoading || !selectedMethod}
                        class="btn btn-secondary"
                    >
                        {#if isLoading}
                            <span class="spinner"></span>
                            Cancelling...
                        {:else}
                            <span class="btn-icon">❌</span>
                            Cancel Booking
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    {:else}
        <div class="no-booking">
            <div class="no-booking-icon">🔍</div>
            <h2>No Booking Found</h2>
            <p>Please complete a booking first to proceed with payment.</p>
            <a href="/dashboard" class="back-link">← Return to Dashboard</a>
        </div>
    {/if}
</main>

<ErrorOverlay
  show={showError}
  message={errorMessage}
  onClose={() => (showError = false)}
/>

<style>
    /* CSS Variables for theming - consistent with dashboard and flight-details */
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
        --success-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
        --error-color: #ef4444;
        --error-bg: rgba(239, 68, 68, 0.1);
        --error-gradient: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
        --success-gradient: linear-gradient(135deg, #34d399 0%, #10b981 100%);
        --error-color: #f87171;
        --error-bg: rgba(248, 113, 113, 0.1);
        --error-gradient: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
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
    
    .method-option.selected {
    border: 2px solid var(--success-color);
    background: var(--bg-primary);
    color: var(--text-inverse);
    }

    .payment-header {
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
        animation: floatHeader 6s ease-in-out infinite;
    }

    .payment-header::before {
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

    .payment-header:hover::before {
        opacity: 0.1;
    }

    @keyframes floatHeader {
        0%, 100% { 
            transform: translateY(0px);
        }
        50% { 
            transform: translateY(-8px);
        }
    }

    h1 {
        color: var(--text-primary);
        font-size: 3.5rem;
        font-weight: 800;
        margin-bottom: 2rem;
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

    .booking-reference {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.5rem;
        font-size: 1.2rem;
        margin-top: 1rem;
    }

    .ref-label {
        color: var(--text-muted);
        font-weight: 500;
    }

    .ref-value {
        background: var(--bg-surface-elevated);
        border: 2px solid var(--border-color);
        color: var(--text-primary);
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        font-weight: 700;
        font-family: 'Monaco', 'Consolas', monospace;
        box-shadow: var(--shadow-sm);
    }

    .payment-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        margin-bottom: 3rem;
    }

    .flight-summary, .payment-actions {
        background: var(--bg-surface);
        backdrop-filter: var(--backdrop-blur);
        border-radius: 28px;
        padding: 3rem;
        border: 2px solid var(--border-color);
        box-shadow: var(--shadow-lg);
        position: relative;
        overflow: hidden;
    }

    .flight-summary::before, .payment-actions::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: var(--bg-accent);
        border-radius: 28px;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .flight-summary:hover::before, .payment-actions:hover::before {
        opacity: 0.05;
    }

    .summary-header h2, .payment-methods h3 {
        color: var(--text-primary);
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 2rem;
        text-align: center;
        position: relative;
    }

    .summary-header h2::after, .payment-methods h3::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 3px;
        background: var(--bg-accent);
        border-radius: 2px;
    }

    .flight-route {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 3rem;
        padding: 2rem;
        background: var(--bg-surface-elevated);
        border-radius: 20px;
        border: 2px solid var(--border-color);
        box-shadow: var(--shadow-sm);
    }

    .route-point {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
    }

    .route-icon {
        font-size: 2.5rem;
    }

    .route-name {
        color: var(--text-primary);
        font-weight: 700;
        font-size: 1.2rem;
    }

    .route-arrow {
        font-size: 2.5rem;
        animation: fly 2s ease-in-out infinite;
        color: var(--text-secondary);
    }

    @keyframes fly {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(15px); }
    }

    .flight-details {
        margin-bottom: 3rem;
    }

    .detail-item {
        background: var(--bg-surface-elevated);
        border: 2px solid var(--border-color);
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        transition: all 0.3s ease;
    }

    .detail-item:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-sm);
    }

    .detail-icon {
        font-size: 1.8rem;
        width: 2.5rem;
        text-align: center;
    }

    .detail-item div {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex: 1;
    }

    .detail-label {
        color: var(--text-muted);
        font-size: 0.9rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .detail-value {
        color: var(--text-primary);
        font-size: 1.2rem;
        font-weight: 700;
    }

    .total-amount {
        background: var(--success-gradient);
        color: var(--text-inverse);
        padding: 2rem;
        border-radius: 20px;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        animation: subtlePulse 3s ease-in-out infinite;
        position: relative;
        overflow: hidden;
    }

    .total-amount::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
    }

    @keyframes subtlePulse {
        0%, 100% { 
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
            transform: scale(1);
        }
        50% { 
            box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4);
            transform: scale(1.02);
        }
    }

    .amount-label {
        font-size: 1.4rem;
        font-weight: 600;
        opacity: 0.9;
    }

    .amount-value {
        font-size: 2.5rem;
        font-weight: 900;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .payment-actions {
        display: flex;
        flex-direction: column;
        gap: 3rem;
    }

    .method-options {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .method-option {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 1.5rem;
        background: var(--bg-surface-elevated);
        border-radius: 16px;
        border: 2px solid var(--border-color);
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
        color: var(--text-primary);
    }

    .method-option:hover {
        background: var(--bg-primary);
        color: var(--text-inverse);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }

    .method-icon {
        font-size: 1.8rem;
        width: 2.5rem;
        text-align: center;
    }

    .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .btn {
        padding: 1.5rem 2rem;
        border: none;
        border-radius: 16px;
        font-size: 1.2rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
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
        transition: left 0.5s ease;
    }

    .btn:hover:not(:disabled)::before {
        left: 100%;
    }

    .btn:disabled {
        background: linear-gradient(135deg, var(--text-muted) 0%, var(--text-secondary) 100%);
        color: var(--text-inverse);
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
    }

    .btn-primary {
        background: var(--success-gradient);
        color: var(--text-inverse);
        box-shadow: var(--shadow-md);
    }

    .btn-primary:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 15px 35px rgba(16, 185, 129, 0.4);
    }

    .btn-secondary {
        background: var(--error-gradient);
        color: var(--text-inverse);
        box-shadow: var(--shadow-md);
    }

    .btn-secondary:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 15px 35px rgba(239, 68, 68, 0.4);
    }

    .btn-icon {
        font-size: 1.4rem;
    }

    .spinner {
        width: 24px;
        height: 24px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top: 3px solid var(--text-inverse);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .no-booking {
        text-align: center;
        background: var(--bg-surface);
        backdrop-filter: var(--backdrop-blur);
        border-radius: 28px;
        padding: 4rem 2rem;
        border: 2px solid var(--border-color);
        box-shadow: var(--shadow-lg);
    }

    .no-booking-icon {
        font-size: 5rem;
        margin-bottom: 2rem;
        opacity: 0.7;
    }

    .no-booking h2 {
        color: var(--text-primary);
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
    }

    .no-booking p {
        color: var(--text-secondary);
        font-size: 1.2rem;
        margin-bottom: 3rem;
        line-height: 1.6;
    }

    .back-link {
        display: inline-block;
        padding: 1.25rem 2.5rem;
        background: var(--bg-primary);
        color: var(--text-inverse);
        text-decoration: none;
        border-radius: 16px;
        font-weight: 700;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .back-link:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 25px rgba(102, 126, 234, 0.3);
    }

    /* Responsive design */
    @media (max-width: 1024px) {
        main {
            padding: 1.5rem;
        }

        .payment-container {
            gap: 2rem;
        }

        .flight-summary, .payment-actions {
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

        .payment-container {
            grid-template-columns: 1fr;
            gap: 2rem;
        }

        .payment-header {
            padding: 2rem 1.5rem;
            margin-bottom: 3rem;
        }

        .flight-summary, .payment-actions {
            padding: 1.5rem;
        }

        .booking-reference {
            flex-direction: column;
            gap: 1rem;
        }

        .flight-route {
            flex-direction: column;
            gap: 1.5rem;
        }

        .route-arrow {
            transform: rotate(90deg);
        }

        .amount-value {
            font-size: 2rem;
        }
    }

    @media (max-width: 480px) {
        h1 {
            font-size: 2rem;
        }

        .payment-header {
            padding: 1.5rem 1rem;
            border-radius: 20px;
        }

        .flight-summary, .payment-actions {
            padding: 1rem;
            border-radius: 20px;
        }

        .btn {
            padding: 1.25rem;
            font-size: 1rem;
        }

        .detail-item {
            padding: 1rem;
        }
    }
</style>