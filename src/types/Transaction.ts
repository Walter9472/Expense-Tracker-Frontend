export interface Category {
    id: number | null
    name: string
    description?: string
    color?: string
}

export interface Transaction {
    id: number
    title: string
    amount: number
    date: string
    type: string
    description?: string
    category?: Category | null
}
