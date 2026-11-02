<template>
  <div class="auth">
    <div class="auth__intro">
      <span class="wordmark">Haushaltsbuch</span>
      <div>
        <p class="auth__claim">Wissen, wohin dein Geld geht.</p>
        <p class="auth__claim-sub">
          Trag Einnahmen und Ausgaben ein und sieh jeden Monat auf einen Blick, wo du stehst.
        </p>
      </div>
      <span class="muted">Projekt im Modul Webtechnologien, HTW Berlin</span>
    </div>
    <main class="auth__form">
      <slot />
    </main>
  </div>
</template>
