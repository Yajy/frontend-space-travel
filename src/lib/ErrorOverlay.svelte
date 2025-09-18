<script lang="ts">
  export let show = false;      // controls visibility
  export let message = "";      // dynamic error message
  export let onClose = () => {}; // callback for closing
</script>

{#if show}
  <div class="error-overlay">
    <div class="error-card">
      <button class="close-btn" on:click={onClose}>✖</button>
      <div class="icon">🚨</div>
      <h2>Vola!</h2>
      <!--<p>Looks Like Services are on flight to HyperSpace!, please try again later.</p>-->
      <p>{message}</p>
    </div>
  </div>
{/if}

<style>
  .error-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 9999;
  }

  .error-card {
    background: white;
    padding: 2rem;
    border-radius: 20px 20px 0 0;
    text-align: center;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 -4px 16px rgba(0,0,0,0.2);
    position: relative;
    animation: slideUp 0.3s ease-out;
  }

  .error-card .icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
</style>
