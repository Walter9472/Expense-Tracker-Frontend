<template>
    <div>
        <h2>Übersicht</h2>
        <ul>
            <li v-for="transaction in transactions" :key="transaction.id">
                {{ transaction.amount }} € - {{ transaction.type }} - {{ transaction.date }}
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { Transaction } from '@/services/api'

export default {
    props: {
        transactions: {
            type: Array as PropType<Transaction[]>,
            required: true
        }
    }
}
</script>
