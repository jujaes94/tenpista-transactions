import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/services/api';
import type { Transaction } from '@/features/transactions/types';
import { transactionKeys } from '@/features/transactions/hooks/useTransactions';

export const adminTransactionKeys = {
  byUser: (userId: number) => ['transactions', 'byUser', userId] as const,
};

const fetchTransactionsByUserId = async (userId: number): Promise<Transaction[]> => {
  const { data } = await api.get<Transaction[]>(`/transaction/user/${userId}`);
  return data;
};

export function useTransactionsByUserId(userId: number | null, enabled = true) {
  return useQuery({
    queryKey: userId == null ? ['transactions', 'byUser', 'none'] : adminTransactionKeys.byUser(userId),
    queryFn: () => fetchTransactionsByUserId(userId as number),
    enabled: enabled && userId != null,
  });
}

type UpdateStatusVars = { id: number; statusId: number };

const updateTransactionStatus = async ({ id, statusId }: UpdateStatusVars): Promise<Transaction> => {
  const { data } = await api.patch<Transaction>(`/transaction/${id}/status`, { statusId });
  return data;
};

export function useUpdateTransactionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTransactionStatus,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'transactions' });
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(updated.id) });
    },
  });
}
