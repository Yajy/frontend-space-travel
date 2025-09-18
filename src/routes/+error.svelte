<script>
  export let error;
  export let status;

  let showOverlay = true;

  function closeOverlay() {
    showOverlay = false;
  }
</script>

{#if showOverlay}
  <div class="error-overlay">
    <div class="error-sheet">
      <button class="close-btn" on:click={closeOverlay}>✖</button>
      <div class="error-symbol">🚀⚠️</div>
      <h2>Uh-Oh! Something went wrong</h2>
      <p>{error?.message || "Please try again after sometime."}</p>
    </div>
  </div>
{/if}

<style>
  .error-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: flex-end; /* bottom sheet style */
    justify-content: center;
    z-index: 9999;
  }

  .error-sheet {
    background: #fff;
    width: 100%;
    max-width: 500px;
    border-radius: 1rem 1rem 0 0;
    padding: 2rem;
    box-shadow: 0 -4px 12px rgba(0,0,0,0.2);
    text-align: center;
    animation: slideUp 0.3s ease;
    position: relative;
  }

  .error-symbol {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
</style>
