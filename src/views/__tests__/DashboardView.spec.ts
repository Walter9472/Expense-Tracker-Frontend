import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import DashboardView from '../DashboardView.vue'
import { createPinia, setActivePinia } from 'pinia'
import api from '@/service/api'

// Mock API
vi.mock('@/service/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn()
    }
}))

// Mock vue-toastification
vi.mock('vue-toastification', () => ({
    useToast: () => ({
        success: vi.fn(),
        error: vi.fn()
    })
}))

// Mock useAuth composable
vi.mock('@/composables/useAuth', () => ({
    useAuth: () => ({
        checkAuthStatus: () => true
    })
}))

// Mock authService
vi.mock('@/service/authService.ts', () => ({
    getToken: () => 'mock-token'
}))

describe('DashboardView', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    it('mounts and fetches initial data', async () => {
        const mockTransactions = [
            {
                id: 1,
                title: 'Test Transaction',
                amount: 100,
                date: '2024-01-01',
                type: 'EINKOMMEN',
                category: { id: 1, name: 'Salary' }
            }
        ]
        const mockCategories = [
            { id: 1, name: 'Salary', color: '#00C853' }
        ]

        vi.mocked(api.get).mockImplementation((url: string) => {
            if (url === '/et/transactions') {
                return Promise.resolve({ data: mockTransactions })
            }
            if (url === '/et/categories') {
                return Promise.resolve({ data: mockCategories })
            }
            return Promise.reject(new Error('Unknown endpoint'))
        })

        const wrapper = mount(DashboardView, {
            global: {
                stubs: {
                    Balance: true,
                    IncomeExpense: true,
                    TransactionList: true,
                    AddTransaction: true,
                    ExpenseChart: true,
                    IncomePieChart: true,
                    FinancialTrendChart: true
                }
            }
        })

        await flushPromises()

        expect(api.get).toHaveBeenCalledWith('/et/transactions')
        expect(api.get).toHaveBeenCalledWith('/et/categories')
        expect(wrapper.exists()).toBe(true)
    })

    it('renders main dashboard sections', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: [] })

        const wrapper = mount(DashboardView, {
            global: {
                stubs: {
                    Balance: true,
                    IncomeExpense: true,
                    TransactionList: true,
                    AddTransaction: true,
                    ExpenseChart: true,
                    IncomePieChart: true,
                    FinancialTrendChart: true
                }
            }
        })

        await flushPromises()

        expect(wrapper.find('.main-dashboard').exists()).toBe(true)
        expect(wrapper.find('.actions-area').exists()).toBe(true)
        expect(wrapper.find('.export-btn').exists()).toBe(true)
    })

    it('displays export button', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: [] })

        const wrapper = mount(DashboardView, {
            global: {
                stubs: {
                    Balance: true,
                    IncomeExpense: true,
                    TransactionList: true,
                    AddTransaction: true,
                    ExpenseChart: true,
                    IncomePieChart: true,
                    FinancialTrendChart: true
                }
            }
        })

        await flushPromises()

        const exportBtn = wrapper.find('.export-btn')
        expect(exportBtn.exists()).toBe(true)
        expect(exportBtn.text()).toContain('Als CSV exportieren')
    })
})
