import { useQuery } from '@tanstack/react-query';
import api from '@/shared/services/api';
import type { TransactionStatus } from '@/features/transactions/types';

export const statusKeys = {
  all: ['transaction-statuses'] as const,
};

const fetchStatuses = async (): Promise<TransactionStatus[]> => {
  const { data } = await api.get<TransactionStatus[]>('/status');
  return data;
};

export function useTransactionStatuses(enabled = true) {
  return useQuery({
    queryKey: statusKeys.all,
    queryFn: fetchStatuses,
    enabled,
  });
}
