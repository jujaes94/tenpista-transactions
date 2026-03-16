import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/services/api';
import { Transaction, CreateTransactionDTO, UpdateTransactionDTO } from '../types';

// Keys for caching
export const transactionKeys = {
    all: ['transactions'] as const,
    detail: (id: number) => [...transactionKeys.all, id] as const,
};

// Fetch all transactions
const fetchTransactions = async (): Promise<Transaction[]> => {
    const { data } = await api.get<Transaction[]>('/transaction');
    return data;
};

export const useTransactions = () => {
    return useQuery({
        queryKey: transactionKeys.all,
        queryFn: fetchTransactions,
    });
};

// Fetch single transaction
const fetchTransactionById = async (id: number): Promise<Transaction> => {
    const { data } = await api.get<Transaction>(`/transaction/${id}`);
    return data;
};

export const useTransaction = (id: number) => {
    return useQuery({
        queryKey: transactionKeys.detail(id),
        queryFn: () => fetchTransactionById(id),
        enabled: !!id,
    });
};

// Create transaction
const createTransaction = async (newTx: CreateTransactionDTO): Promise<Transaction> => {
    const { data } = await api.post<Transaction>('/transaction', newTx);
    return data;
};

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.all });
        },
    });
};

// Update transaction
const updateTransaction = async ({ id, data }: { id: number; data: UpdateTransactionDTO }): Promise<Transaction> => {
    const response = await api.put<Transaction>(`/transaction/${id}`, data);
    return response.data;
};

export const useUpdateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateTransaction,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.all });
            queryClient.invalidateQueries({ queryKey: transactionKeys.detail(data.id) });
        },
    });
};

// Delete transaction
const deleteTransaction = async (id: number): Promise<void> => {
    await api.delete(`/transaction/${id}`);
};

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.all });
        },
    });
};
