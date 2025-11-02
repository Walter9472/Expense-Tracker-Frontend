
<template>
  <h3>Neue Transaktion Einfügen</h3>
  <form id="form" @submit.prevent="onSubmit">

    <div class="form-control">
      <label for="title">Bezeichnung</label>
      <input type="text" id="title" v-model="title" placeholder="Text Einfügen...">
    </div>

    <div class="form-control">
      <label for="amount">Betrag</label>
      <input type="text" id="amount" v-model="amount" placeholder="Text Einfügen...">
    </div>

    <div class="form-control">
      <label for="type">Typ</label>
      <select id="type" v-model="type" required>
        <option disabled value="">-- Bitte auswählen --</option>
        <option v-for="option in transactionTypes" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
    </div>
    <button type="submit">Hinzufügen</button>
  </form>
</template>
<script setup lang="ts">

import { ref } from 'vue';
import { useToast } from 'vue-toastification';

const title = ref(null);
const amount = ref('')
const type = ref('');
const date = ref('');

const emit = defineEmits(['transactionSubmitted'])

const toast = useToast();

const transactionTypes = ['EINKOMMEN', 'AUSGABEN'];

const onSubmit = () => {
  if(!title.value || !amount.value || !type.value){
    toast.error('Alle Felder Müssen Ausgefüllt sein')
    return;
  }
  const newTransaction = {
    title: title.value,
    amount: parseFloat(amount.value),
    type: type.value,
    date: new Date().toISOString().split('T')[0],

  }

  emit('transactionSubmitted',newTransaction)

  // Reset des Formulars
  title.value = '';
  amount.value = null;
  type.value = '';

  console.log('Neue Transaktion:', newTransaction);

}

</script>

<style scoped></style>
