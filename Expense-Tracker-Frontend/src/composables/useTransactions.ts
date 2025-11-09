import { ref, onMounted } from "vue";
import { getTransactions, createTransaction, type Transaction, type NewTransaction } from "@/services/api";

export function useTransactions(){
  const transactions = ref(<Transaction[]>([]))
  const loading = ref(false);
  const creating = ref(false);
  const error = ref<string | null>(null);


async function load(){
  try {
    loading.value = true;
    error.value = null;
    transactions.value = await getTransactions();
  } catch (e: any) {
    error.value = e?.message ?? "Laden fehlgeschlagen";
  } finally {
    loading.value = false;
  }
}

  async function addTransaction(input: NewTransaction) {
    try {
      creating.value = true;
      error.value = null;
      // pessimistisch: warte auf Server -> dann einfügen
      const created = await createTransaction(input);
      transactions.value.unshift(created);
      return created;
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? e?.message ?? "Erstellen fehlgeschlagen";
      throw e;
    } finally {
      creating.value = false;
    }
  }

  onMounted(load)

  return {transactions, loading, creating, error, load, addTransaction}
}
