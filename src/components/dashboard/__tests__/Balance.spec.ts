import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Balance from '../Balance.vue'

describe('Balance', () => {
    it('renders balance label', () => {
        const wrapper = mount(Balance, {
            props: {
                total: 1000
            }
        })

        expect(wrapper.find('.balance-label').text()).toBe('Aktueller Saldo')
    })

    it('displays formatted total with two decimal places', () => {
        const wrapper = mount(Balance, {
            props: {
                total: 1234.5
            }
        })

        expect(wrapper.find('.balance-amount').text()).toBe('1234.50€')
    })

    it('handles negative balance correctly', () => {
        const wrapper = mount(Balance, {
            props: {
                total: -500.75
            }
        })

        expect(wrapper.find('.balance-amount').text()).toBe('-500.75€')
    })

    it('handles zero balance', () => {
        const wrapper = mount(Balance, {
            props: {
                total: 0
            }
        })

        expect(wrapper.find('.balance-amount').text()).toBe('0.00€')
    })

    it('formats large numbers correctly', () => {
        const wrapper = mount(Balance, {
            props: {
                total: 123456.789
            }
        })

        expect(wrapper.find('.balance-amount').text()).toBe('123456.79€')
    })

    it('handles undefined total gracefully', () => {
        const wrapper = mount(Balance, {
            props: {
                total: undefined as any
            }
        })

        expect(wrapper.find('.balance-amount').text()).toBe('0.00€')
    })

    it('applies correct CSS classes', () => {
        const wrapper = mount(Balance, {
            props: {
                total: 1000
            }
        })

        expect(wrapper.find('.balance-section').exists()).toBe(true)
        expect(wrapper.find('.balance-label').exists()).toBe(true)
        expect(wrapper.find('.balance-amount').exists()).toBe(true)
    })
})
