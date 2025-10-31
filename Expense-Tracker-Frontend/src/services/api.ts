import axios from 'axios';

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
  baseURL: import.meta.env.VITE.API.BASE || "http://localhost:8080/et"
});

export async function getTransactions(): Promise<Transaction[]>{
  const { data } = await api.get("/transactions")
  return data;
}

export async function createTransaction(input: NewTransaction): Promise<Transaction>{
  const { data } = await api.post("/transaction", input);
  return data;
}
