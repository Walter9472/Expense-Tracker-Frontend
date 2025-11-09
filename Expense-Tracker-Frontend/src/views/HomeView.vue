<!-- src/views/HomeView.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { useTransactions } from "@/composables/useTransactions";
import TransactionList from "@/components/TransactionList.vue";
import type { NewTransaction } from "@/services/api";

const { transactions, loading, creating, error, addTransaction } = useTransactions();

// Lokaler Formular-State, den wir dem Kind als v-model geben könnten.
// Hier zeige ich dir den direkten Handler-Ansatz:
const draft = ref<NewTransaction>({
  title: "",
  amount: 0,
  date: new Date().toISOString().slice(0, 10),
  type: "EXPENSE",
});

async function handleCreate() {
  await addTransaction({ ...draft.value });
  // Formular zurücksetzen
  draft.value = {
    title: "",
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    type: "EXPENSE",
  };
}
</script>

<template>
  <section class="container">
    <h1>Meine Transaktionen</h1>

    <div class="card">
      <h2>Neue Transaktion</h2>
      <!-- Einfachheitshalber binden wir Inputs direkt hier statt per props:
           du kannst NewTransactionForm auch so umbauen, dass es das Composable selbst nutzt -->
      <form @submit.prevent="handleCreate" class="space-y-3">
        <input v-model="draft.title" placeholder="Titel" class="input" />
        <input v-model.number="draft.amount" type="number" step="0.01" min="0.01" class="input" />
        <input v-model="draft.date" type="date" class="input" />
        <select v-model="draft.type" class="input">
          <option value="EXPENSE">Ausgabe</option>
          <option value="INCOME">Einnahme</option>
        </select>
        <button :disabled="creating" class="btn">{{ creating ? "Speichere…" : "Anlegen" }}</button>
      </form>
      <p v-if="error" class="text-red-600 mt-2">{{ error }}</p>
    </div>

    <div class="card mt-6">
      <h2>Übersicht</h2>
      <p v-if="loading">Lade…</p>
      <TransactionList v-else :transactions="transactions" />
    </div>
  </section>
</template>

<style scoped>
.container { max-width: 700px; margin: 2rem auto; padding: 0 1rem; }
.card { padding: 1rem; border: 1px solid #eee; border-radius: .8rem; }
.input { display:block; width:100%; padding:.5rem; border:1px solid #ddd; border-radius:.5rem; margin-bottom:.5rem; }
.btn { padding:.6rem 1rem; border-radius:.6rem; border:1px solid #ccc; }
</style>
