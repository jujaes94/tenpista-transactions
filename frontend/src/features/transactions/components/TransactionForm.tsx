'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateTransaction, useUpdateTransaction } from '../hooks/useTransactions';
import { Transaction, CreateTransactionDTO } from '../types';
import { useEffect } from 'react';
import { AxiosError } from 'axios';

const formSchema = z.object({
  amount: z.number()
    .min(1, 'Amount must be a positive number')
    .int('Amount must be an integer'),
  merchant: z.string().min(1, 'Merchant is required'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  initialData?: Transaction;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const inputClass =
  'w-full mt-1.5 px-3 py-2.5 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-green)]';

const labelClass = 'block text-[13px] font-medium text-[var(--text-secondary)]';

export default function TransactionForm({ initialData, onSuccess, onCancel }: Props) {
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: initialData?.amount || 0,
      merchant: initialData?.merchant || '',
      description: initialData?.description || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      setValue('amount', initialData.amount);
      setValue('merchant', initialData.merchant);
      setValue('description', initialData.description || '');
    }
  }, [initialData, setValue]);

  const onSubmit = (data: FormValues) => {
    const formattedData: CreateTransactionDTO = { ...data };

    if (initialData) {
      updateMutation.mutate({ id: initialData.id, data: formattedData }, {
        onSuccess: () => { reset(); onSuccess?.(); },
      });
    } else {
      createMutation.mutate(formattedData, {
        onSuccess: () => { reset(); onSuccess?.(); },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isError = createMutation.isError || updateMutation.isError;

  const getErrorMessage = (): string => {
    const err = createMutation.error || updateMutation.error;
    if (err && err instanceof AxiosError && err.response?.data) {
      const data = err.response.data as Record<string, unknown>;
      return (data.message as string) || 'An error occurred';
    }
    return 'An error occurred';
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-lg font-bold text-[var(--text-primary)] mb-5">
        {initialData ? 'Edit Transaction' : 'New Transaction'}
      </h2>

      {isError && (
        <div className="bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/30 text-[var(--accent-red)] px-3.5 py-2.5 rounded-lg text-[13px] mb-4">
          {getErrorMessage()}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="amount" className={labelClass}>Amount (Pesos)</label>
          <input id="amount" type="number" {...register('amount', { valueAsNumber: true })} className={inputClass} />
          {errors.amount && (
            <p className="text-[var(--accent-red)] text-xs mt-1">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="merchant" className={labelClass}>Merchant</label>
          <input id="merchant" type="text" {...register('merchant')} className={inputClass} />
          {errors.merchant && (
            <p className="text-[var(--accent-red)] text-xs mt-1">{errors.merchant.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>Description <span className="text-[var(--text-muted)] font-normal">(optional)</span></label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Add a note about this transaction..."
          />
          {errors.description && (
            <p className="text-[var(--accent-red)] text-xs mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="flex gap-2.5 mt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg text-sm font-medium cursor-pointer hover:border-[var(--text-secondary)] transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-2.5 bg-[var(--accent-green)] text-[#111119] rounded-lg text-sm font-semibold cursor-pointer transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
}
