<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTransactions } from '@/composables/useTransactions'
import TrendChart from '@/components/charts/TrendChart.vue'
import CategoryBreakdown from '@/components/charts/CategoryBreakdown.vue'
import TransactionRow from '@/components/transactions/TransactionRow.vue'
import { formatCurrency } from '@/utils/format'

const { transactions, balance, fetchTransactions, fetchBalance } = useTransactions()

const ready = ref(false)

onMounted(async () => {
  await Promise.all([fetchTransactions(), fetchBalance()])
  ready.value = true
})

const now = new Date()
const monthName = new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(now)

const thisMonth = computed(() => {
  let income = 0
  let expense = 0
  for (const tx of transactions.value) {
    const d = new Date(tx.date)
    if (d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth()) continue
    if (tx.type === 'EINKOMMEN') income += tx.amount
    else expense += tx.amount
  }
  return { income, expense }
})

const incomeShare = computed(() => {
  const { income, expense } = thisMonth.value
  return (income / (income + expense)) * 100
})

const recent = computed(() => transactions.value.slice(0, 5))
</script>

<template>
  <section class="statement" aria-labelledby="balance-label">
    <p id="balance-label" class="statement__label">Kontostand</p>
    <p class="statement__balance" :class="{ soll: balance < 0, 'is-pending': !ready }">
      {{ ready ? formatCurrency(balance) : '…' }}
    </p>

    <p v-if="ready" class="statement__summary">
      <template v-if="!thisMonth.income && !thisMonth.expense">
        Im {{ monthName }} hast du noch nichts gebucht.
      </template>
      <template v-else-if="!thisMonth.income">
        Im {{ monthName }} hast du <strong>{{ formatCurrency(thisMonth.expense) }}</strong> ausgegeben
        und noch nichts eingenommen.
      </template>
      <template v-else-if="!thisMonth.expense">
        Im {{ monthName }} hast du <strong>{{ formatCurrency(thisMonth.income) }}</strong> eingenommen
        und noch nichts ausgegeben.
      </template>
      <template v-else>
        Im {{ monthName }} hast du <strong>{{ formatCurrency(thisMonth.income) }}</strong> eingenommen
        und <strong>{{ formatCurrency(thisMonth.expense) }}</strong> ausgegeben.
      </template>
    </p>

    <div
      v-if="ready && (thisMonth.income || thisMonth.expense)"
      class="ratio"
      role="img"
      :aria-label="`${monthName}: ${formatCurrency(thisMonth.income)} Einnahmen, ${formatCurrency(thisMonth.expense)} Ausgaben`"
    >
      <div class="ratio__bar">
        <span class="ratio__part ratio__part--haben" :style="{ width: `${incomeShare}%` }" />
        <span class="ratio__part ratio__part--soll" :style="{ width: `${100 - incomeShare}%` }" />
      </div>
      <div class="ratio__legend">
        <span><span class="swatch" style="background: var(--haben)" /> Eingenommen</span>
        <span>Ausgegeben <span class="swatch" style="background: var(--soll)" /></span>
      </div>
    </div>
  </section>

  <div class="dash-grid">
    <section class="panel">
      <div class="panel__head">
        <h2>Monatsverlauf</h2>
        <span class="muted">letzte 6 Monate</span>
      </div>
      <div class="panel__body">
        <TrendChart v-if="ready" :transactions="transactions" />
        <p v-else class="muted">Wird geladen …</p>
      </div>
    </section>

    <section class="panel">
      <div class="panel__head">
        <h2>Wohin das Geld geht</h2>
      </div>
      <div class="panel__body">
        <CategoryBreakdown v-if="ready" :transactions="transactions" />
        <p v-else class="muted">Wird geladen …</p>
      </div>
    </section>
  </div>

  <section class="panel">
    <div class="panel__head">
      <h2>Letzte Buchungen</h2>
      <RouterLink to="/transactions" class="text-btn">Alle Buchungen</RouterLink>
    </div>
    <p v-if="!ready" class="empty">Buchungen werden geladen …</p>
    <div v-else-if="!recent.length" class="empty">
      Noch keine Buchungen.
      <RouterLink to="/transactions" class="text-btn">Erste Buchung eintragen</RouterLink>
    </div>
    <ul v-else class="ledger">
      <TransactionRow v-for="tx in recent" :key="tx.id" :transaction="tx" />
    </ul>
  </section>
</template>

<style scoped>
.statement {
  margin-bottom: 2.5rem;
  max-width: 720px;
}

.statement__label {
  font-weight: 600;
  color: var(--ink-soft);
}

.statement__balance {
  font-size: var(--t-hero);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.035em;
  margin: 0.35rem 0 1rem;
}

.statement__balance.is-pending {
  color: var(--rule);
}

.statement__summary {
  font-size: var(--t-lg);
  color: var(--ink-soft);
  max-width: 46ch;
}

.statement__summary strong {
  color: var(--ink);
  font-weight: 700;
}

.ratio {
  margin-top: 1.5rem;
}

.ratio__bar {
  display: flex;
  gap: 2px;
  height: 12px;
}

.ratio__part {
  display: block;
  height: 100%;
}

.ratio__part--haben {
  background: var(--haben);
  border-radius: 3px 0 0 3px;
}

.ratio__part--soll {
  background: var(--soll);
  border-radius: 0 3px 3px 0;
}

.ratio__legend {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: var(--t-sm);
  color: var(--ink-soft);
}

.ratio__legend > span {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.dash-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 900px) {
  .dash-grid {
    grid-template-columns: 1fr;
  }
}
</style>
