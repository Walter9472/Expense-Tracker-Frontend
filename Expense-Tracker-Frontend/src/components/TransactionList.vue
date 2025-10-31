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

interface Transaction {
    id: number
    title: string
    amount: number
    date: string
    type: string
    description: string
    category: string

}

export default {
    props: {
        transactions: {
            type: Array as () => Transaction[],
            required: true
        }
    }
}
</script>
