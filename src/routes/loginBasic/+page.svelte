<script>
  import { goto } from '$app/navigation';

  let name = "";
  let phone = "";
  let email = "";
  let password = "";
  let address = "";
  let dob = "";
  let age = null;

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

  async function handleSubmit(event) {
    event.preventDefault();
    age = calculateAge(dob);

    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!phoneRegex.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const payload = { name, phone, email, password, address, age };

    try {
      const response = await fetch("http://localhost:8080/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Signup failed");

      const data = await response.json();
      alert("Signup successful! Welcome " + data.name);

      // redirect to login
      goto('/login');
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  $: age = calculateAge(dob);
</script>

<main>
  <h1>Signup</h1>
  <form on:submit={handleSubmit}>
    <label>
      Name:
      <input type="text" bind:value={name} required />
    </label>

    <label>
      Phone:
      <input type="text" bind:value={phone} required />
    </label>

    <label>
      Email:
      <input type="email" bind:value={email} required />
    </label>

    <label>
      Password:
      <input type="password" bind:value={password} required minlength="6" />
    </label>

    <label>
      Address:
      <input type="text" bind:value={address} required />
    </label>

    <label>
      Date of Birth:
      <input type="date" bind:value={dob} required />
    </label>

    {#if age !== null}
      <p>Age: {age}</p>
    {/if}

    <button type="submit"> Sign up </button>
  </form>
</main>

<style>
  main {
    max-width: 400px;
    margin: 2rem auto;
    padding: 1rem;
    font-family: sans-serif;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    font-weight: bold;
  }

  input {
    padding: 0.5rem;
    font-size: 1rem;
  }

  button {
    padding: 0.75rem;
    background: royalblue;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
</style>
