<script lang="ts">
    import { paymentResponse } from "$lib/stores/paymentResponse";
    import { onMount } from "svelte";
    import { departDate } from "$lib/stores/departureDate";
    import { theme } from "$lib/stores/theme";
    import { goto } from "$app/navigation";
    import ThemeToggle from "$lib/ThemeToggle.svelte";

    let orderData: any = null;
    let isLoading = true;

    onMount(() => {
        console.log("Order page mounted, checking payment response...");
        
        // Initialize theme from localStorage
        theme.subscribe(value => {
            if (typeof document !== 'undefined') {
                document.documentElement.setAttribute('data-theme', value);
            }
        });
        
        // Set a timeout to handle loading state
        const loadingTimeout = setTimeout(() => {
            if (isLoading) {
                console.log("Loading timeout - no payment data received");
                isLoading = false;
            }
        }, 3000);
        
        const unsubscribe = paymentResponse.subscribe((data) => {
            console.log("Order page - Payment response data:", data);
            orderData = data;
            isLoading = false;
            clearTimeout(loadingTimeout);
        });

        return () => {
            unsubscribe();
            clearTimeout(loadingTimeout);
        };
    });

</script>

<main>
    <ThemeToggle />
    
    <div class="order-container">
        {#if isLoading}
            <div class="loading-section">
                <div class="spinner"></div>
                <h2>Loading your order details...</h2>
            </div>
        {:else if orderData}
            {#if orderData.paymentStatus === "COMPLETED"}
                <div class="success-section">
                    <div class="success-icon">🎉</div>
                    <h1>Payment Successful!</h1>
                    <p class="success-message">Your space journey has been confirmed!</p>
                    
                    <div class="order-summary">
                        <div class="summary-header">
                            <h2>🎫 Order Summary</h2>
                            <div class="order-id">
                                <span class="id-label">Order ID:</span>
                                <span class="id-value">{orderData.orderId}</span>
                            </div>
                        </div>

                        <div class="flight-info">
                            <div class="route-display">
                                <div class="route-point">
                                    <span class="route-icon">🚀</span>
                                    <span class="route-name">{orderData.sourceName}</span>
                                </div>
                                <div class="route-arrow">✈️</div>
                                <div class="route-point">
                                    <span class="route-icon">🌍</span>
                                    <span class="route-name">{orderData.destinationName}</span>
                                </div>
                            </div>

                            <div class="flight-name">{orderData.flightName}</div>
                        </div>

                        <div class="details-grid">
                            <div class="detail-card">
                                <span class="detail-icon">📅</span>
                                <div class="detail-content">
                                    <span class="detail-label">Departure</span>
                                    <span class="detail-value">{orderData.departureDate}</span>
                                    <span class="detail-time">{orderData.departureTime}</span>
                                </div>
                            </div>

                            <div class="detail-card">
                                <span class="detail-icon">📅</span>
                                <div class="detail-content">
                                    <span class="detail-label">Arrival</span>
                                    <span class="detail-value">{orderData.arrivalDate}</span>
                                    <span class="detail-time">{orderData.arrivalTime}</span>
                                </div>
                            </div>

                            <div class="detail-card">
                                <span class="detail-icon">💺</span>
                                <div class="detail-content">
                                    <span class="detail-label">Seat Type</span>
                                    <span class="detail-value">{orderData.seatType}</span>
                                </div>
                            </div>

                            <div class="detail-card">
                                <span class="detail-icon">💰</span>
                                <div class="detail-content">
                                    <span class="detail-label">Total Price</span>
                                    <span class="detail-value">₹{orderData.price}</span>
                                </div>
                            </div>
                        </div>

                        {#if orderData.additionalInfo}
                            <div class="additional-info">
                                <h3>📝 Additional Information</h3>
                                <p>{orderData.additionalInfo}</p>
                            </div>
                        {/if}

                        <div class="status-badge success">
                            <span class="status-icon">✅</span>
                            <span>Payment Status: {orderData.paymentStatus}</span>
                        </div>
                    </div>

                    <div class="action-buttons">
                        <button on:click={() => goto('/dashboard')} class="btn btn-primary">
                            <span class="btn-icon">🏠</span>
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            {:else if orderData.paymentStatus === "CANCELLED"}
                <div class="cancelled-section">
                    <div class="cancelled-icon">❌</div>
                    <h1>Payment Cancelled</h1>
                    <p class="cancelled-message">Your payment was cancelled. No charges have been made.</p>
                    
                    <div class="order-info">
                        <p class="order-id">Order ID: <strong>{orderData.orderId}</strong></p>
                        <p class="retry-message">Don't worry, you can try booking again!</p>
                    </div>

                    <div class="action-buttons">
                        <button on:click={() => goto('/dashboard')} class="btn btn-secondary">
                            <span class="btn-icon">🔍</span>
                            Search Again
                        </button>
                    </div>
                </div>
            {:else}
                <div class="pending-section">
                    <div class="pending-icon">⏳</div>
                    <h1>Payment Processing</h1>
                    <p class="pending-message">Payment Status: {orderData.paymentStatus}</p>
                    
                    <div class="action-buttons">
                        <button on:click={() => goto('/dashboard')} class="btn btn-secondary">
                            <span class="btn-icon">🏠</span>
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            {/if}
        {:else}
            <div class="no-order-section">
                <div class="no-order-icon">🔍</div>
                <h1>No Order Found</h1>
                <p class="no-order-message">No order details available. Please complete a booking first.</p>
                
                <div class="action-buttons">
                    <button on:click={() => goto('/dashboard')} class="btn btn-primary">
                        <span class="btn-icon">🚀</span>
                        Start Booking
                    </button>
                </div>
            </div>
        {/if}
    </div>
</main>

<style>
    /* CSS Variables for theming - consistent with other pages */
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
        --warning-color: #f59e0b;
        --warning-bg: rgba(245, 158, 11, 0.1);
        --warning-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
        --warning-color: #fbbf24;
        --warning-bg: rgba(251, 191, 36, 0.1);
        --warning-gradient: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
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
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        position: relative;
    }

    .order-container {
        max-width: 900px;
        width: 100%;
    }

    .loading-section {
        text-align: center;
        background: var(--bg-surface);
        backdrop-filter: var(--backdrop-blur);
        border-radius: 28px;
        padding: 4rem 2rem;
        border: 2px solid var(--border-color);
        box-shadow: var(--shadow-lg);
    }

    .spinner {
        width: 80px;
        height: 80px;
        border: 5px solid var(--border-subtle);
        border-top: 5px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 2rem;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .loading-section h2 {
        color: var(--text-secondary);
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
    }

    .success-section, .cancelled-section, .pending-section, .no-order-section {
        background: var(--bg-surface);
        backdrop-filter: var(--backdrop-blur);
        border-radius: 28px;
        padding: 4rem 3rem;
        border: 2px solid var(--border-color);
        box-shadow: var(--shadow-lg);
        text-align: center;
        position: relative;
        overflow: hidden;
    }

    .success-section::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: var(--success-gradient);
        border-radius: 28px;
        z-index: -1;
        opacity: 0.05;
    }

    .cancelled-section::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: var(--error-gradient);
        border-radius: 28px;
        z-index: -1;
        opacity: 0.05;
    }

    .pending-section::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: var(--warning-gradient);
        border-radius: 28px;
        z-index: -1;
        opacity: 0.05;
    }

    .success-icon, .cancelled-icon, .pending-icon, .no-order-icon {
        font-size: 5rem;
        margin-bottom: 2rem;
        display: block;
        animation: bounceIn 0.8s ease-out;
    }

    @keyframes bounceIn {
        0% {
            transform: scale(0.3);
            opacity: 0;
        }
        50% {
            transform: scale(1.05);
        }
        70% {
            transform: scale(0.9);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }

    .success-icon {
        animation: bounceIn 0.8s ease-out, celebrate 2s ease-in-out 1s infinite;
    }

    @keyframes celebrate {
        0%, 100% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.1) rotate(-5deg); }
        50% { transform: scale(1.05) rotate(0deg); }
        75% { transform: scale(1.1) rotate(5deg); }
    }

    h1 {
        color: var(--text-primary);
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
        text-align: center;
        text-shadow: 0 2px 4px var(--shadow-color);
        animation: fadeInUp 0.6s ease-out 0.2s both;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    h2 {
        color: var(--text-primary);
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        position: relative;
    }

    h2::after {
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

    .success-message, .cancelled-message, .pending-message, .no-order-message {
        color: var(--text-secondary);
        font-size: 1.3rem;
        margin-bottom: 3rem;
        font-weight: 500;
        line-height: 1.6;
        animation: fadeInUp 0.6s ease-out 0.4s both;
    }

    .order-summary {
        background: var(--bg-surface-elevated);
        border-radius: 24px;
        padding: 3rem;
        margin: 3rem 0;
        border: 2px solid var(--border-color);
        box-shadow: var(--shadow-sm);
        text-align: left;
        animation: fadeInUp 0.6s ease-out 0.6s both;
    }

    .summary-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2.5rem;
        flex-wrap: wrap;
        gap: 1.5rem;
    }

    .order-id {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .id-label {
        color: var(--text-muted);
        font-weight: 500;
        font-size: 1rem;
    }

    .id-value {
        color: var(--text-primary);
        font-weight: 700;
        font-family: 'Monaco', 'Consolas', monospace;
        background: var(--bg-surface);
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        border: 2px solid var(--border-color);
        box-shadow: var(--shadow-sm);
    }

    .flight-info {
        margin-bottom: 3rem;
    }

    .route-display {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        padding: 2rem;
        background: var(--bg-surface);
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
        font-weight: 700;
        color: var(--text-primary);
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

    .flight-name {
        text-align: center;
        font-size: 1.4rem;
        font-weight: 700;
        color: #667eea;
        margin-top: 1.5rem;
        padding: 1rem;
        background: var(--bg-surface);
        border-radius: 16px;
        border: 2px solid var(--border-color);
    }

    .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
    }

    .detail-card {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 2rem;
        background: var(--bg-surface);
        border-radius: 20px;
        border: 2px solid var(--border-color);
        transition: all 0.3s ease;
        box-shadow: var(--shadow-sm);
    }

    .detail-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
    }

    .detail-icon {
        font-size: 2rem;
        width: 3rem;
        text-align: center;
        color: var(--text-secondary);
    }

    .detail-content {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex: 1;
    }

    .detail-label {
        font-size: 0.9rem;
        color: var(--text-muted);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .detail-value {
        font-size: 1.2rem;
        color: var(--text-primary);
        font-weight: 700;
    }

    .detail-time {
        font-size: 1rem;
        color: #667eea;
        font-weight: 600;
    }

    .additional-info {
        background: var(--bg-surface);
        border-radius: 20px;
        padding: 2rem;
        margin-bottom: 3rem;
        border: 2px solid var(--border-color);
        box-shadow: var(--shadow-sm);
    }

    .additional-info h3 {
        color: var(--text-primary);
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 1rem;
    }

    .additional-info p {
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.6;
        font-size: 1rem;
    }

    .status-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 1.5rem;
        border-radius: 16px;
        font-weight: 700;
        font-size: 1.2rem;
        animation: subtlePulse 2s ease-in-out infinite;
    }

    .status-badge.success {
        background: var(--success-gradient);
        color: var(--text-inverse);
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
    }

    @keyframes subtlePulse {
        0%, 100% { 
            transform: scale(1);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }
        50% { 
            transform: scale(1.02);
            box-shadow: 0 12px 35px rgba(16, 185, 129, 0.4);
        }
    }

    .status-icon {
        font-size: 1.5rem;
    }

    .cancelled-section .order-info {
        background: var(--error-bg);
        border-radius: 20px;
        padding: 2rem;
        margin: 3rem 0;
        border: 2px solid var(--error-color);
    }

    .order-info .order-id {
        color: var(--text-primary);
        font-size: 1.2rem;
        margin-bottom: 1.5rem;
        justify-content: center;
    }

    .retry-message {
        color: var(--text-secondary);
        font-style: italic;
        margin: 0;
        font-size: 1rem;
    }

    .action-buttons {
        margin-top: 3rem;
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        animation: fadeInUp 0.6s ease-out 0.8s both;
    }

    .btn {
        padding: 1.5rem 2.5rem;
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
        gap: 1rem;
        position: relative;
        overflow: hidden;
        box-shadow: var(--shadow-md);
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

    .btn:hover::before {
        left: 100%;
    }

    .btn-primary {
        background: var(--bg-primary);
        color: var(--text-inverse);
    }

    .btn-primary:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
        background: linear-gradient(135deg, var(--text-muted) 0%, var(--text-secondary) 100%);
        color: var(--text-inverse);
    }

    .btn-secondary:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 35px rgba(107, 114, 128, 0.4);
    }

    .btn-icon {
        font-size: 1.5rem;
    }

    /* Responsive design */
    @media (max-width: 1024px) {
        main {
            padding: 1.5rem;
        }

        .order-summary {
            padding: 2rem;
        }
    }

    @media (max-width: 768px) {
        main {
            padding: 1rem;
        }

        h1 {
            font-size: 2.2rem;
        }

        .success-section, .cancelled-section, .pending-section, .no-order-section {
            padding: 2.5rem 2rem;
        }

        .order-summary {
            padding: 1.5rem;
        }

        .summary-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .route-display {
            flex-direction: column;
            gap: 1.5rem;
        }

        .route-arrow {
            transform: rotate(90deg);
        }

        .details-grid {
            grid-template-columns: 1fr;
        }

        .action-buttons {
            flex-direction: column;
            align-items: center;
        }

        .btn {
            padding: 1.25rem 2rem;
            font-size: 1rem;
            width: 100%;
            max-width: 300px;
        }
    }

    @media (max-width: 480px) {
        h1 {
            font-size: 1.8rem;
        }

        .success-section, .cancelled-section, .pending-section, .no-order-section {
            padding: 2rem 1.5rem;
            border-radius: 20px;
        }

        .order-summary {
            padding: 1rem;
            border-radius: 20px;
        }

        .btn {
            padding: 1rem 1.5rem;
            font-size: 0.9rem;
        }

        .success-icon, .cancelled-icon, .pending-icon, .no-order-icon {
            font-size: 4rem;
        }
    }
</style>