'use client';

import { useState } from 'react';
import { useTransactions, useDeleteTransaction } from '../hooks/useTransactions';
import { Transaction } from '../types';

interface Props {
  onEdit: (transaction: Transaction) => void;
}

const AVATAR_COLORS = [
  '#2dd4a8', '#a78bfa', '#f472b6', '#fb923c', '#60a5fa',
  '#f87171', '#facc15', '#34d399', '#818cf8', '#fb7185',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

const STATUS_CLASSES: Record<string, string> = {
  PENDING:   'bg-yellow-400/15 text-yellow-400',
  COMPLETED: 'bg-[var(--accent-green)]/15 text-[var(--accent-green)]',
  CANCELLED: 'bg-[var(--accent-red)]/15 text-[var(--accent-red)]',
  FAILED:    'bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]',
};

const COL_GRID = 'grid grid-cols-[2fr_1fr_1fr_90px_1fr_100px]';

export default function TransactionList({ onEdit }: Props) {
  const { data: transactions, isLoading, isError, error } = useTransactions();
  const deleteMutation = useDeleteTransaction();
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  if (isLoading) {
    return <div className="py-10 text-center text-[var(--text-muted)]">Loading transactions...</div>;
  }
  if (isError) {
    return (
      <div className="py-10 text-center text-[var(--accent-red)]">
        Error loading transactions: {(error as Error)?.message}
      </div>
    );
  }
  if (!transactions || transactions.length === 0) {
    return (
      <div className="py-10 text-center text-[var(--text-muted)]">
        No transactions found. Add a new one!
      </div>
    );
  }

  const openDeleteModal  = (tx: Transaction) => setTransactionToDelete(tx);
  const closeDeleteModal = () => setTransactionToDelete(null);

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteMutation.mutate(transactionToDelete.id, { onSettled: closeDeleteModal });
    }
  };

  return (
    <div>
      {/* Table header */}
      <div className={`${COL_GRID} py-3 border-b border-[var(--border-color)] mb-1`}>
        {['Description', 'Date', 'User', 'Status', 'Amount', 'Actions'].map((h, i) => (
          <span
            key={h}
            className={`text-xs font-semibold text-[var(--text-muted)] uppercase tracking-[0.5px] ${i >= 4 ? 'text-right' : ''}`}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {transactions.map((tx) => {
        const avatarColor  = getAvatarColor(tx.merchant);
        const statusName   = tx.status?.name || 'PENDING';
        const statusClass  = STATUS_CLASSES[statusName] || STATUS_CLASSES.PENDING;

        return (
          <div
            key={tx.id}
            className={`${COL_GRID} py-3.5 px-1 items-center border-b border-[var(--border-color)]/50 rounded-lg transition-colors duration-150 cursor-pointer hover:bg-[var(--bg-card-hover)]`}
          >
            {/* Merchant + description */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-[#111119]"
                style={{ background: avatarColor }}
              >
                {getInitial(tx.merchant)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-[var(--text-primary)]">{tx.merchant}</span>
                {tx.description && (
                  <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[180px]">{tx.description}</span>
                )}
              </div>
            </div>

            {/* Date */}
            <span className="text-[13px] text-[var(--text-secondary)]">
              {new Date(tx.transactionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>

            {/* User */}
            <span className="text-[13px] text-[var(--text-secondary)]">{tx.userName}</span>

            {/* Status badge */}
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-xl inline-block text-center ${statusClass}`}>
              {statusName}
            </span>

            {/* Amount */}
            <span className="text-sm font-semibold text-[var(--text-primary)] text-right">
              ${tx.amount.toLocaleString()}
            </span>

            {/* Actions */}
            <div className="flex gap-1.5 justify-end">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(tx); }}
                className="bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] px-2.5 py-1 rounded-md text-xs cursor-pointer transition-all duration-150 hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
              >
                Edit
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); openDeleteModal(tx); }}
                disabled={deleteMutation.isPending}
                className="bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] px-2.5 py-1 rounded-md text-xs cursor-pointer transition-all duration-150 hover:border-[var(--accent-red)] hover:text-[var(--accent-red)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Del
              </button>
            </div>
          </div>
        );
      })}

      {/* Delete confirmation modal */}
      {transactionToDelete && (
        <div
          className="fixed inset-0 bg-black/55 flex items-center justify-center z-50"
          onClick={closeDeleteModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)] shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
            <h2 className="m-0 text-lg font-bold text-[var(--text-primary)]">Delete transaction?</h2>
            <p className="mt-2.5 text-[13px] text-[var(--text-secondary)]">
              You are about to delete <strong>{transactionToDelete.merchant}</strong> for{' '}
              <strong>${transactionToDelete.amount.toLocaleString()}</strong>. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5 mt-4">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteMutation.isPending}
                className="px-3.5 py-2 rounded-lg border border-[var(--border-color)] bg-transparent text-[var(--text-secondary)] text-[13px] cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-3.5 py-2 rounded-lg border border-[var(--accent-red)] bg-[var(--accent-red)] text-[#111119] text-[13px] font-semibold cursor-pointer transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
