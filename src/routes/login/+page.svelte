<script>
  import { goto } from '$app/navigation';
  import { passengerId } from "$lib/stores/passengerId";
  import ErrorOverlay from "$lib/ErrorOverlay.svelte"; 
  
  let email = "";
  let password = "";
  let videoError = false;
  let isLoading = false;
  let rememberMe = false;
  let emailError = "";
  let passwordError = "";

  let showError = false;
  let errorMessage = "";

  async function handleSubmit(event) {
    event.preventDefault();
    
    
    emailError = "";
    passwordError = "";
    
  
    if (!email) {
      emailError = "Email is required";
      return;
    }
    
    if (!password) {
      passwordError = "Password is required";
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      emailError = "Please enter a valid email address";
      return;
    }

    isLoading = true;

    const payload = {
      email: email.trim(),
      password
    };

    try {
      const response = await fetch("http://localhost:11110/auth/signin", {
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
      console.log("Login response data:", data);
      if(data.success === true) {
        console.log("Setting passenger ID:", data.passengerId);
        passengerId.set(data.passengerId);
        goto('/dashboard');
      }
      else {
        errorMessage = data.message || "Invalid login credentials.";
        showError = true;
      }

    } catch (err) {
      console.error("Login error:", err);
      errorMessage = "Login failed. Please check your credentials.";
      showError = true;
    } finally {
      isLoading = false;
    }
  }

  function handleVideoError() {
    videoError = true;
    console.warn("Video failed to load, using fallback background");
  }

  function handleForgotPassword() {
    alert("Yajy Bhai ko Contact karo");
  }

  function clearEmailError() {
    emailError = "";
  }

  function clearPasswordError() {
    passwordError = "";
  }
</script>

<main>
  {#if !videoError}
    <video 
      autoplay 
      muted 
      loop 
      playsinline 
      class="bg-video"
      on:error={handleVideoError}
    >
      <source src="/videos/earth.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  {/if}

  <div class="bg-fallback"></div>

  <div class="card">
    <div class="card-content">
      <div class="welcome-section">
        <h1>Welcome Back</h1>
        <p class="subtitle">Continue your space journey</p>
      </div>
      
      <form on:submit={handleSubmit}>
        <label>
          Email
          <input 
            type="email" 
            bind:value={email} 
            required 
            placeholder="Enter your email"
            disabled={isLoading}
            class:input-error={emailError}
            on:input={clearEmailError}
          />
          {#if emailError}
            <div class="error">{emailError}</div>
          {/if}
        </label>

        <label>
          Password
          <input 
            type="password" 
            bind:value={password} 
            required 
            placeholder="Enter your password"
            disabled={isLoading}
            class:input-error={passwordError}
            on:input={clearPasswordError}
          />
          {#if passwordError}
            <div class="error">{passwordError}</div>
          {/if}
        </label>

        <div class="form-options">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              bind:checked={rememberMe}
              disabled={isLoading}
            />
            <span class="checkmark"></span>
            Remember me
          </label>
          
          <button 
            type="button" 
            class="forgot-password-btn"
            on:click={handleForgotPassword}
            disabled={isLoading}
          >
            Forgot Password?
          </button>
        </div>

        <button type="submit" class="login-btn" disabled={isLoading}>
          {#if isLoading}
            <div class="spinner"></div>
            Logging in...
          {:else}
            🚀 Launch Login
          {/if}
        </button>
        
        <p class="signup-link">
          New to space travel? <a href="/signup">Create Account</a>
        </p>
      </form>
    </div>
  </div>
</main>

<ErrorOverlay
  show={showError}
  message={errorMessage}
  onClose={() => (showError = false)}
/>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    overflow: hidden;
  }

  .bg-fallback {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    z-index: -2;
  }

  .bg-video {
    position: fixed;
    top: 0; 
    left: 0;
    width: 100%; 
    height: 100%;
    object-fit: cover;
    z-index: -1;
  }

  main {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 1rem;
    position: relative;
    overflow: hidden;
  }

  .card {
    position: relative;
    width: 100%;
    max-width: 450px;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 25px 50px rgba(0,0,0,0.4);
    color: white;
    animation: slideUp 0.6s ease-out;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(50px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .card-content {
    position: relative;
    z-index: 1;
    padding: 2.5rem;
  }

  .welcome-section {
    text-align: center;
    margin-bottom: 2.5rem;
  }

  h1 {
    margin-bottom: 0.75rem;
    color: #fff;
    font-size: 2.75rem;
    text-shadow: 0 4px 8px rgba(0,0,0,0.3);
    font-weight: 800;
    background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    color: rgba(255,255,255,0.9);
    font-size: 1.1rem;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    font-weight: 500;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  label {
    display: flex;
    flex-direction: column;
    font-size: 0.95rem;
    font-weight: 600;
    color: #fff;
    gap: 0.5rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  input[type="email"], input[type="password"] {
    padding: 1rem;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 16px;
    font-size: 1rem;
    background: rgba(255,255,255,0.1);
    color: white;
    outline: none;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    font-weight: 500;
  }

  input[type="email"]:disabled, input[type="password"]:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  input::placeholder {
    color: rgba(255,255,255,0.6);
  }

  input:focus {
    background: rgba(255,255,255,0.2);
    border-color: rgba(102, 126, 234, 0.6);
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.4);
    transform: translateY(-2px);
  }

  
  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus {
    -webkit-text-fill-color: white !important;
    -webkit-box-shadow: 0 0 0px 1000px rgba(255,255,255,0.2) inset !important;
    transition: background-color 5000s ease-in-out 0s !important;
  }

  .input-error {
    border-color: #ef4444 !important;
    background: rgba(239, 68, 68, 0.1) !important;
  }

  .error {
    color: #ef4444;
    font-size: 0.85rem;
    margin-top: 0.25rem;
    text-shadow: none;
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
    font-size: 0.85rem;
    gap: 0.5rem;
    flex-direction: row;
  }

  input[type="checkbox"] {
    appearance: none;
    width: 16px;
    height: 16px;
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 3px;
    background: rgba(255,255,255,0.2);
    cursor: pointer;
    position: relative;
    margin: 0;
    flex-shrink: 0;
  }

  input[type="checkbox"]:checked {
    background: rgba(37,117,252,0.8);
    border-color: rgba(37,117,252,1);
  }

  input[type="checkbox"]:checked::after {
    content: "✓";
    position: absolute;
    top: -2px;
    left: 2px;
    color: white;
    font-size: 12px;
    font-weight: bold;
  }

  .forgot-password-btn {
    background: none;
    border: none;
    color: #7dd3fc;
    font-size: 0.85rem;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
    transition: color 0.3s ease;
  }

  .forgot-password-btn:hover {
    color: #bae6fd;
  }

  .forgot-password-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .login-btn {
    padding: 1rem;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 700;
    transition: all 0.3s ease;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    min-height: 52px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
    position: relative;
    overflow: hidden;
  }

  .login-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  .login-btn:hover:not(:disabled)::before {
    left: 100%;
  }

  .login-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    box-shadow: 0 12px 25px rgba(16, 185, 129, 0.4);
    transform: translateY(-2px);
  }

  .login-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .login-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .signup-link {
    text-align: center;
    margin-top: 2rem;
    font-size: 1rem;
    margin-bottom: 0;
    color: rgba(255,255,255,0.9);
    font-weight: 500;
  }

  .signup-link a {
    color: #60a5fa;
    text-decoration: none;
    font-weight: 700;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .signup-link a:hover {
    text-decoration: underline;
    text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
  }

  @media (max-width: 480px) {
    .card-content {
      padding: 1.5rem;
    }
    
    h1 {
      font-size: 2rem;
    }

    .subtitle {
      font-size: 0.9rem;
    }

    input[type="email"], input[type="password"] {
      padding: 0.75rem;
      font-size: 0.95rem;
    }

    .login-btn {
      padding: 0.75rem;
      font-size: 1rem;
    }

    .form-options {
      flex-direction: column;
      gap: 0.75rem;
      align-items: flex-start;
    }
  }
</style>