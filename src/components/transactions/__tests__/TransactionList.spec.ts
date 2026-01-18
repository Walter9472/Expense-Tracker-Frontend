import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TransactionList from '../TransactionList.vue'

describe('TransactionList', () => {
    const mockCategories = [
        { id: 1, name: 'Salary', color: '#00C853' },
        { id: 2, name: 'Food', color: '#FF5722' }
    ]

    it('renders empty state when no transactions', () => {
        const wrapper = mount(TransactionList, {
            props: {
                transactions: [],
                categories: mockCategories
            }
        })

        expect(wrapper.find('.empty-state').exists()).toBe(true)
        expect(wrapper.text()).toContain('Es wurden noch keine Transaktionen erfasst')
    })

    it('renders transaction list with transactions', () => {
        const mockTransactions = [
            {
                id: 1,
                title: 'Salary',
                amount: 2000,
                date: '2024-01-15',
                type: 'EINKOMMEN',
                category: { id: 1, name: 'Salary', color: '#00C853' }
            },
            {
                id: 2,
                title: 'Groceries',
                amount: 50,
                date: '2024-01-14',
                type: 'AUSGABEN',
                category: { id: 2, name: 'Food', color: '#FF5722' }
            }
        ]

        const wrapper = mount(TransactionList, {
            props: {
                transactions: mockTransactions,
                categories: mockCategories
            }
        })

        const items = wrapper.findAll('.transaction-item')
        expect(items.length).toBe(2)
        expect(wrapper.text()).toContain('Salary')
        expect(wrapper.text()).toContain('Groceries')
    })

    it('displays correct amount formatting with sign', () => {
        const mockTransactions = [
            {
                id: 1,
                title: 'Income',
                amount: 100,
                date: '2024-01-15',
                type: 'EINKOMMEN',
                category: null
            },
            {
                id: 2,
                title: 'Expense',
                amount: 50,
                date: '2024-01-14',
                type: 'AUSGABEN',
                category: null
            }
        ]

        const wrapper = mount(TransactionList, {
            props: {
                transactions: mockTransactions,
                categories: mockCategories
            }
        })

        expect(wrapper.text()).toContain('+100.00€')
        expect(wrapper.text()).toContain('-50.00€')
    })

    it('applies correct CSS class based on transaction type', () => {
        const mockTransactions = [
            {
                id: 1,
                title: 'Income',
                amount: 100,
                date: '2024-01-15',
                type: 'EINKOMMEN',
                category: null
            },
            {
                id: 2,
                title: 'Expense',
                amount: 50,
                date: '2024-01-14',
                type: 'AUSGABEN',
                category: null
            }
        ]

        const wrapper = mount(TransactionList, {
            props: {
                transactions: mockTransactions,
                categories: mockCategories
            }
        })

        const items = wrapper.findAll('.transaction-item')
        expect(items[0]!.classes()).toContain('plus')
        expect(items[1]!.classes()).toContain('minus')
    })

    it('emits transactionDeleted event when delete button is clicked', async () => {
        const mockTransactions = [
            {
                id: 1,
                title: 'Test',
                amount: 100,
                date: '2024-01-15',
                type: 'EINKOMMEN',
                category: null
            }
        ]

        const wrapper = mount(TransactionList, {
            props: {
                transactions: mockTransactions,
                categories: mockCategories
            }
        })

        await wrapper.find('.delete-btn').trigger('click')

        expect(wrapper.emitted('transactionDeleted')).toBeTruthy()
        expect(wrapper.emitted('transactionDeleted')?.[0]).toEqual([1])
    })
})
