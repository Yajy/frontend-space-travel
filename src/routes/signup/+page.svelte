<script lang="ts">
  import { goto } from '$app/navigation';
  import ErrorOverlay from "$lib/ErrorOverlay.svelte";
  
  let name = "";
  let phone = "";
  let email = "";
  let password = "";
  let address = "";
  let dob = "";
  let age: number | null = null;
  let videoError = false;

  let showError = false;
  let errorMessage = "";

  let nameError = "";
  let emailError = "";
  let phoneError = "";
  let passwordError = "";

  function calculateAge(dateString) {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge;
  }

  function validateName(value: string) {
  if (!value.trim()) {
    nameError = "Name is required";
  } else if (/\d/.test(value)) {
    nameError = "Name cannot contain numbers";
  } else {
    nameError = "";
  }
}

function validateEmail(value: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value.trim()) {
    emailError = "Email is required";
  } else if (!emailRegex.test(value)) {
    emailError = "Please enter a valid email address";
  } else {
    emailError = "";
  }
}

function validatePhone(value: string) {
  const phoneRegex = /^[0-9]{10}$/; // 10 digits
  if (!value.trim()) {
    phoneError = "Phone number is required";
  } else if (!phoneRegex.test(value)) {
    phoneError = "Enter a valid 10-digit phone number";
  } else {
    phoneError = "";
  }
}

function validatePassword(value: string) {
  if (!value.trim()) {
    passwordError = "Password is required";
  } else if (value.length < 6) {
    passwordError = "Password must be at least 6 characters";
  } else {
    passwordError = "";
  }
}

  async function handleSubmit(event) {
    event.preventDefault();
    
    if (!name || !phone || !email || !password || !address || !dob) {
      alert("Please fill in all required fields.");
      return;
    }
    
    age = calculateAge(dob);

    const payload = {
      name,
      phone,
      email,
      password,
      address,
      age
    };

    try {
      const response = await fetch("http://localhost:11110/auth/signup", {
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

      //const data = await response.json();
      goto('/dashboard');

    } catch (err) {
      console.error("Signup error:", err);
      errorMessage = err.message || "Something went wrong during signup.";
      showError = true;
    }
  }

  function handleVideoError() {
    videoError = true;
    console.warn("Video failed to load, using fallback background");
  }

  $: age = calculateAge(dob);
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
        <h1>🚀 Join the Journey</h1>
        <p class="subtitle">Create your space travel account</p>
      </div>

      <form on:submit={handleSubmit}>
        <div class="form-grid">
          <label>
            Full Name
            <input type="text" bind:value={name} on:blur={(e) => validateName(e.target.value)} required placeholder="Full Name" class:error={!!nameError} />
            {#if nameError}
              <p class="error-text">{nameError}</p>
            {/if}
          </label>

          <label>
            Phone Number
            <input type="tel" bind:value={phone} on:blur={(e) => validatePhone(e.target.value)} required placeholder="1234567890" class:error={!!nameError} />
            {#if phoneError}
              <p class="error-text">{phoneError}</p>
            {/if}
          </label>
        </div>

        <label>
          Email Address
          <input type="email" bind:value={email} on:blur={(e) => validateEmail(e.target.value)} required placeholder="your@email.com" class:error={!!nameError} />
          {#if emailError}
            <p class="error-text">{emailError}</p>
          {/if}
        </label>

        <label>
          Password
          <input type="password" bind:value={password} on:blur={(e) => validatePassword(e.target.value)} required minlength="6" placeholder="Create a secure password" class:error={!!nameError} />
          {#if passwordError}
            <p class="error-text">{passwordError}</p>
          {/if}
        </label>

        <label>
          Home Address
          <input type="text" bind:value={address} required placeholder="Address" />
        </label>

        <label>
          Date of Birth
          <input type="date" bind:value={dob} required />
        </label>

        <button type="submit" class="signup-btn">
          <span class="btn-icon">🌟</span>
          Create Account
        </button>
        
        <p class="login-link">
          Already exploring space? <a href="/login">Log In</a>
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
.bg-fallback {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -2;
}

input.error {
  border-color: #ef4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
}

.error-text {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  font-weight: 500;
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
  max-width: 500px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0,0,0,0.4);
  color: white;
  animation: slideUp 0.6s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
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
  font-size: 2.5rem;
  font-weight: 800;
  text-shadow: 0 4px 8px rgba(0,0,0,0.3);
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

/* ---------- FORM LAYOUT ---------- */
form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

/* ---------- INPUTS ---------- */
input,
select,
textarea {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  display: block;
  width: 100%;
  height: 52px;
  padding: 0 1rem;
  margin: 0;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.2;
  background: rgba(255,255,255,0.1);
  color: white;
  box-sizing: border-box;
  outline: none;
  transition: all 0.3s ease;
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

input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Autofill fix */
input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus {
  -webkit-text-fill-color: white;
  -webkit-box-shadow: 0 0 0px 1000px rgba(255,255,255,0.1) inset;
  transition: background-color 5000s ease-in-out 0s;
}

/* Remove number spinners */
input[type="number"],
input[type="tel"] {
  -moz-appearance: textfield;
}
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Force date input to match others */
input[type="date"] {
  padding-right: 2.5rem;
}
input[type="date"]::-webkit-calendar-picker-indicator {
  position: absolute;
  right: 1rem;
  filter: invert(1);
  cursor: pointer;
}

/* ---------- AGE DISPLAY ---------- */
.age-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 16px;
  border: 1px solid rgba(16, 185, 129, 0.3);
  margin-top: -0.5rem;
}
.age-icon {
  font-size: 1.5rem;
}
.age-text {
  color: #d1fae5;
  font-size: 1rem;
  font-weight: 500;
}

/* ---------- SIGNUP BUTTON ---------- */
.signup-btn {
  padding: 1rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
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
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
  position: relative;
  overflow: hidden;
}

.signup-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.signup-btn:hover:not(:disabled)::before {
  left: 100%;
}

.signup-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  box-shadow: 0 12px 25px rgba(139, 92, 246, 0.4);
  transform: translateY(-2px);
}

.signup-btn:active:not(:disabled) {
  transform: translateY(0);
}

.signup-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 1.25rem;
}


.login-link {
  text-align: center;
  margin-top: 2rem;
  font-size: 1rem;
  margin-bottom: 0;
  color: rgba(255,255,255,0.9);
  font-weight: 500;
}

.login-link a {
  color: #60a5fa;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-link a:hover {
  color: #93c5fd;
  text-decoration: underline;
  text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
}

/* ---------- RESPONSIVE ---------- */
@media (max-width: 768px) {
  .card {
    max-width: 100%;
  }
  .card-content {
    padding: 2rem;
  }
  h1 {
    font-size: 2.25rem;
  }
  .subtitle {
    font-size: 1rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  input {
    font-size: 0.95rem;
  }
  .signup-btn {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .card-content {
    padding: 1.5rem;
  }
  h1 {
    font-size: 2rem;
  }
  .subtitle {
    font-size: 0.95rem;
  }
}
</style>
