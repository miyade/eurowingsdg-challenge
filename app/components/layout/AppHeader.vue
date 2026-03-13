<script setup lang="ts">
</script>

<template>
  <header class="header" role="banner">
    <div class="header__logo">
      <img
        src="/eurowings-logo.svg"
        alt="Eurowings"
        width="160"
        height="41"
      />
    </div>
    <nav class="header__nav">
      <span class="header__title">Flight Offers</span>
    </nav>
  </header>
</template>

<style scoped>
.header {
  background: linear-gradient(135deg, #E4003A 0%, #B8002E 100%);
  padding: var(--space-sm) var(--space-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header__logo img {
  display: block;
  height: 32px;
  width: auto;
  filter: brightness(0) invert(1);
}

.header__title {
  display: none;
}

@media (min-width: 640px) {
  .header {
    padding: var(--space-md) var(--space-xl);
  }

  .header__logo img {
    height: 41px;
  }

  .header__title {
    display: block;
    color: var(--color-white);
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    letter-spacing: 0.01em;
  }
}
</style>
