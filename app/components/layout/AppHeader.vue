<script setup lang="ts">
</script>

<template>
  <header role="banner">
   <img
    src="/eurowings-logo.svg"
    alt="Eurowings"
    width="160"
    height="41"
   />
    <nav>
      <span>Flight Offers</span>
    </nav>
  </header>
</template>

<style scoped>
header {
  background: var(--color-white);
  border-bottom: 1px solid var(--color-neutral-200);
  padding: var(--space-md) var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

img {
  height: 32px;
  width: auto;
  display: block;
}

nav span {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-600);
}
</style>
