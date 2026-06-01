<script setup>
// Login view — form logic to be added
</script>

<template>
  <div class="login">
    <h2>Login</h2>

    <form @submit.prevent>

      <!-- Email field -->
      <div class="field">
        <label for="email">Email</label>
        <input id="email" type="email" placeholder="you@example.com" />
      </div>

      <!-- Password field -->
      <div class="field">
        <label for="password">Password</label>
        <input id="password" type="password" placeholder="••••••••" />
      </div>

      <!-- Submit -->
      <button type="submit">Log in</button>

    </form>
  </div>
</template>
