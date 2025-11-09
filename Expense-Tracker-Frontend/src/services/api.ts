import axios, { type AxiosRequestHeaders } from 'axios'
import { oktaAuth } from '@/plugins/okta'

export interface NewTransaction{
  title: string;
  amount: number;           // positiv; type bestimmt Ein-/Ausgabe
  date: string;             // ISO yyyy-mm-dd
  type: "INCOME" | "EXPENSE";


}

export interface Transaction extends NewTransaction{
  id:number
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080/et',
})

api.interceptors.request.use(async (config) => {
  const accessToken = await oktaAuth.getAccessToken()

  if (accessToken) {
    config.headers = {
      ...(config.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
    } as AxiosRequestHeaders
  }

  return config
})

export async function getTransactions(): Promise<Transaction[]> {
  const { data } = await api.get('/transactions')
  return data
}

export async function createTransaction(input: NewTransaction): Promise<Transaction> {
  const { data } = await api.post('/transaction', input)
  return data
}
