<script>
  import { goto } from '$app/navigation';
  
  let email = "";
  let password = "";
  let isLoading = false;
  let isAnimating = false;
  let rememberMe = false;

  async function handleSubmit(event) {
    event.preventDefault();
    
    // Validate required fields
    if (!email || !password) {
      alert("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Start the space journey animation
    isLoading = true;
    isAnimating = true;

    // Simulate space travel with animation delay
    setTimeout(async () => {
      const payload = {
        email,
        password
      };

      try {
        const response = await fetch("http://localhost:11110/auth/login", {
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
        
        // Store token if provided
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }

        // Complete the animation before redirecting
        setTimeout(() => {
          goto('/dashboard');
        }, 1000);

      } catch (err) {
        console.error("Login error:", err);
        alert("Error: " + err.message);
        isLoading = false;
        isAnimating = false;
      }
    }, 2000); // 2 second animation delay
  }

  function handleForgotPassword() {
    alert("Forgot password functionality coming soon!");
  }
</script>

<main class:animating={isAnimating}>
  <!-- Earth Background -->
  <div class="earth-bg"></div>
  
  <!-- Space Station (appears during animation) -->
  <div class="space-station" class:visible={isAnimating}></div>
  
  <!-- Stars background -->
  <div class="stars"></div>
  <div class="stars2"></div>
  <div class="stars3"></div>

  <!-- Animated elements during login -->
  {#if isAnimating}
    <div class="rocket">🚀</div>
    <div class="journey-text">
      <h2>Launching your space journey...</h2>
      <p>Traveling to the International Space Station</p>
    </div>
  {/if}

  <!-- Login Card -->
  <div class="card" class:hidden={isAnimating}>
    <div class="card-content">
      <div class="welcome-section">
        <h1>🌍 Mission Control</h1>
        <p class="subtitle">Prepare for your space adventure</p>
      </div>
      
      <form on:submit={handleSubmit}>
        <label>
          Astronaut ID (Email)
          <input 
            type="email" 
            bind:value={email} 
            required 
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </label>

        <label>
          Security Code (Password)
          <input 
            type="password" 
            bind:value={password} 
            required 
            placeholder="Enter your password"
            disabled={isLoading}
            minlength="6"
          />
        </label>

        <div class="form-options">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              bind:checked={rememberMe}
              disabled={isLoading}
            />
            <span class="checkmark"></span>
            Remember this mission
          </label>
          
          <button 
            type="button" 
            class="forgot-password-btn"
            on:click={handleForgotPassword}
            disabled={isLoading}
          >
            Lost Credentials?
          </button>
        </div>

        <button type="submit" class="launch-btn" disabled={isLoading}>
          {#if isLoading}
            <div class="countdown">3... 2... 1...</div>
          {:else}
            🚀 Launch Mission
          {/if}
        </button>
        
        <p class="signup-link">
          New astronaut? <a href="/signup">Join the crew</a>
        </p>
      </form>
    </div>
  </div>
</main>

<style>
  main {
    position: relative;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 1rem;
    overflow: hidden;
    transition: all 3s ease;
  }

  /* Earth Background */
  .earth-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 30% 40%, 
      #1e3c72 0%, 
      #2a5298 25%, 
      #1e3c72 50%, 
      #0f1419 100%),
      url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="30" cy="40" r="25" fill="%234a90e2" opacity="0.8"/><circle cx="32" cy="38" r="20" fill="%235ba0f2" opacity="0.6"/><path d="M15,35 Q20,30 25,35 T35,40 Q40,45 35,50 T25,45 Q20,40 15,35" fill="%2366b3ff" opacity="0.4"/></svg>') no-repeat 30% 40%/50% 50%;
    z-index: -3;
    transition: transform 3s ease, filter 3s ease;
  }

  /* Space Station Background (appears during animation) */
  .space-station {
    position: fixed;
    top: 20%;
    right: -30%;
    width: 300px;
    height: 200px;
    background: linear-gradient(45deg, #silver 0%, #b8b8b8 50%, #silver 100%);
    border-radius: 10px;
    opacity: 0;
    transform: translateX(100px) rotateY(45deg);
    transition: all 3s ease;
    z-index: -2;
  }

  .space-station::before {
    content: "";
    position: absolute;
    top: 50%;
    left: -20px;
    width: 40px;
    height: 8px;
    background: #gold;
    border-radius: 4px;
    transform: translateY(-50%);
  }

  .space-station::after {
    content: "🛰️";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2rem;
  }

  .space-station.visible {
    opacity: 1;
    right: 10%;
    transform: translateX(0) rotateY(0deg);
  }

  /* Stars Animation */
  .stars, .stars2, .stars3 {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
  }

  .stars {
    background: transparent url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="1" fill="white"/><circle cx="80" cy="10" r="0.5" fill="white"/><circle cx="60" cy="30" r="0.8" fill="white"/><circle cx="10" cy="60" r="0.6" fill="white"/><circle cx="90" cy="80" r="1" fill="white"/><circle cx="40" cy="70" r="0.4" fill="white"/></svg>') repeat;
    animation: sparkle 3s linear infinite;
  }

  .stars2 {
    background: transparent url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="30" cy="50" r="0.6" fill="white"/><circle cx="70" cy="20" r="0.8" fill="white"/><circle cx="15" cy="80" r="0.4" fill="white"/><circle cx="85" cy="60" r="0.7" fill="white"/></svg>') repeat;
    animation: sparkle 4s linear infinite reverse;
  }

  .stars3 {
    background: transparent url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="10" r="0.5" fill="white"/><circle cx="25" cy="40" r="0.6" fill="white"/><circle cx="75" cy="70" r="0.4" fill="white"/></svg>') repeat;
    animation: sparkle 5s linear infinite;
  }

  @keyframes sparkle {
    0% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
    100% { opacity: 0.3; transform: scale(1); }
  }

  /* Animation States */
  main.animating .earth-bg {
    transform: scale(0.3) translateX(-150%);
    filter: blur(2px);
  }

  /* Rocket Animation */
  .rocket {
    position: fixed;
    bottom: 20%;
    left: 20%;
    font-size: 3rem;
    z-index: 10;
    animation: rocketFly 3s ease-in-out;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
  }

  @keyframes rocketFly {
    0% { 
      bottom: 20%; 
      left: 20%; 
      transform: rotate(45deg);
    }
    50% { 
      bottom: 50%; 
      left: 50%; 
      transform: rotate(90deg) scale(1.5);
    }
    100% { 
      bottom: 70%; 
      left: 80%; 
      transform: rotate(135deg) scale(0.8);
    }
  }

  /* Journey Text */
  .journey-text {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: white;
    z-index: 10;
    animation: fadeInUp 1s ease-out 1s both;
  }

  .journey-text h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    text-shadow: 0 4px 8px rgba(0,0,0,0.5);
    background: linear-gradient(45deg, #fff, #7dd3fc, #fff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .journey-text p {
    font-size: 1.2rem;
    opacity: 0.9;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translate(-50%, -30%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }

  /* Card Styles */
  .card {
    position: relative;
    width: 100%;
    max-width: 420px;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    color: white;
    animation: slideUp 0.8s ease-out;
    transition: all 0.5s ease;
  }

  .card.hidden {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .card::before {
    content: "";
    position: absolute;
    top: 0; 
    left: 0;
    width: 100%; 
    height: 100%;
    background: rgba(20, 30, 48, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    z-index: 0;
  }

  .card-content {
    position: relative;
    z-index: 1;
    padding: 2.5rem;
  }

  .welcome-section {
    text-align: center;
    margin-bottom: 2rem;
  }

  h1 {
    margin-bottom: 0.5rem;
    color: #fff;
    font-size: 2.5rem;
    text-shadow: 0 4px 8px rgba(0,0,0,0.3);
    font-weight: 700;
  }

  .subtitle {
    color: rgba(255,255,255,0.8);
    font-size: 1.1rem;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  label {
    display: flex;
    flex-direction: column;
    font-size: 1rem;
    font-weight: 500;
    color: #fff;
    gap: 0.5rem;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }

  input[type="email"], input[type="password"] {
    padding: 1rem;
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 12px;
    font-size: 1rem;
    background: rgba(255,255,255,0.1);
    color: white;
    outline: none;
    transition: all 0.3s ease;
  }

  input[type="email"]:disabled, input[type="password"]:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  input::placeholder {
    color: rgba(255,255,255,0.5);
  }

  input:focus {
    background: rgba(255,255,255,0.2);
    border-color: rgba(125, 211, 252, 0.6);
    box-shadow: 0 0 20px rgba(125, 211, 252, 0.3);
    transform: translateY(-2px);
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: -0.5rem 0 0.5rem 0;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 0.9rem;
    gap: 0.5rem;
    flex-direction: row;
  }

  input[type="checkbox"] {
    appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255,255,255,0.4);
    border-radius: 4px;
    background: rgba(255,255,255,0.1);
    cursor: pointer;
    position: relative;
    margin: 0;
    transition: all 0.3s ease;
  }

  input[type="checkbox"]:checked {
    background: rgba(125, 211, 252, 0.8);
    border-color: rgba(125, 211, 252, 1);
    transform: scale(1.1);
  }

  input[type="checkbox"]:checked::after {
    content: "✓";
    position: absolute;
    top: -3px;
    left: 2px;
    color: white;
    font-size: 14px;
    font-weight: bold;
  }

  .forgot-password-btn {
    background: none;
    border: none;
    color: #7dd3fc;
    font-size: 0.9rem;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
    transition: all 0.3s ease;
  }

  .forgot-password-btn:hover {
    color: #bae6fd;
    transform: translateY(-1px);
  }

  .launch-btn {
    padding: 1rem;
    background: linear-gradient(135deg, rgba(125, 211, 252, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%);
    color: white;
    border: none;
    border-radius: 15px;
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: 700;
    transition: all 0.3s ease;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 56px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .launch-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(125, 211, 252, 1) 0%, rgba(59, 130, 246, 1) 100%);
    box-shadow: 0 8px 25px rgba(125, 211, 252, 0.4);
    transform: translateY(-3px);
  }

  .launch-btn:active:not(:disabled) {
    transform: translateY(-1px);
  }

  .launch-btn:disabled {
    cursor: not-allowed;
    transform: none;
  }

  .countdown {
    font-size: 1.5rem;
    font-weight: 900;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
  }

  .signup-link {
    text-align: center;
    margin-top: 2rem;
    font-size: 1rem;
    margin-bottom: 0;
    color: rgba(255,255,255,0.9);
  }

  .signup-link a {
    color: #7dd3fc;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .signup-link a:hover {
    color: #bae6fd;
    text-decoration: underline;
    text-shadow: 0 0 8px rgba(125, 211, 252, 0.6);
  }

  @media (max-width: 480px) {
    .card-content {
      padding: 2rem;
    }
    
    h1 {
      font-size: 2rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    input[type="email"], input[type="password"] {
      padding: 0.85rem;
      font-size: 0.95rem;
    }

    .launch-btn {
      padding: 0.85rem;
      font-size: 1rem;
    }

    .form-options {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .journey-text h2 {
      font-size: 1.8rem;
    }

    .journey-text p {
      font-size: 1rem;
    }
  }
</style>