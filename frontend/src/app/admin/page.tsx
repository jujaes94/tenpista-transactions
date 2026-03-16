'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useUsers } from '@/features/admin/hooks/useUsers';
import { useTransactionStatuses } from '@/features/admin/hooks/useTransactionStatuses';
import { useTransactionsByUserId, useUpdateTransactionStatus } from '@/features/admin/hooks/useAdminTransactions';

const selectClass =
  'w-full px-3 py-2.5 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-[10px] text-[var(--text-primary)] outline-none';

const thClass =
  'text-left px-3 py-2.5 text-xs text-[var(--text-secondary)] border-b border-[var(--border-color)] font-semibold';

const tdClass =
  'px-3 py-3 border-b border-[var(--border-color)] text-[var(--text-primary)] text-[13px]';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const isReady = !authLoading && user?.role === 'ADMIN';

  const usersQuery    = useUsers(isReady);
  const statusesQuery = useTransactionStatuses(isReady);
  const txQuery       = useTransactionsByUserId(selectedUserId, isReady);
  const updateStatus  = useUpdateTransactionStatus();

  const users        = usersQuery.data ?? [];
  const statuses     = statusesQuery.data ?? [];
  const transactions = txQuery.data ?? [];

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--text-muted)]">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen p-10 max-w-[1200px] mx-auto">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold text-[var(--text-primary)] m-0">Admin Dashboard</h1>
          <p className="text-[var(--text-secondary)] mt-1.5 text-sm">
            View users, their transactions, and update transaction status.
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] px-4 py-2 rounded-lg text-[13px] cursor-pointer font-medium transition-colors hover:bg-[var(--bg-card-hover)]"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-[360px_1fr] gap-5">

        {/* Users panel */}
        <section className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-color)]">
          <h2 className="text-base font-bold text-[var(--text-primary)] m-0">Users</h2>
          <p className="text-[var(--text-secondary)] text-[13px] mt-1.5">
            Select a user to view their transactions.
          </p>
          <div className="mt-3.5">
            <select
              value={selectedUserId ?? ''}
              onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
              className={selectClass}
            >
              <option value="">Select user…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.role})
                </option>
              ))}
            </select>
            {usersQuery.isError && (
              <p className="mt-2.5 text-[var(--accent-red)] text-[13px]">Failed to load users.</p>
            )}
          </div>
        </section>

        {/* Transactions panel */}
        <section className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-color)]">
          <div className="flex justify-between items-baseline gap-3">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)] m-0">
                Transactions{selectedUser ? ` — ${selectedUser.username}` : ''}
              </h2>
              <p className="text-[var(--text-secondary)] text-[13px] mt-1.5">
                {selectedUser ? 'Update status per transaction.' : 'Pick a user to see transactions.'}
              </p>
            </div>
            {txQuery.isFetching && (
              <span className="text-[var(--text-secondary)] text-xs">Loading…</span>
            )}
          </div>

          {statusesQuery.isError && (
            <p className="mt-3 text-[var(--accent-red)] text-[13px]">Failed to load statuses.</p>
          )}

          {selectedUserId == null ? (
            <div className="mt-4 text-[var(--text-secondary)] text-[13px]">No user selected.</div>
          ) : txQuery.isError ? (
            <p className="mt-3 text-[var(--accent-red)] text-[13px]">
              Failed to load transactions for this user.
            </p>
          ) : transactions.length === 0 ? (
            <div className="mt-4 text-[var(--text-secondary)] text-[13px]">No transactions found.</div>
          ) : (
            <div className="mt-3.5 overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    {['ID', 'Merchant', 'Amount', 'Date', 'Status'].map((h) => (
                      <th key={h} className={thClass}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className={tdClass}>{tx.id}</td>
                      <td className={tdClass}>{tx.merchant}</td>
                      <td className={tdClass}>{tx.amount.toLocaleString()}</td>
                      <td className={`${tdClass} text-[var(--text-secondary)]`}>
                        {new Date(tx.transactionDate).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 border-b border-[var(--border-color)]">
                        <select
                          value={tx.status?.id ?? ''}
                          disabled={updateStatus.isPending || statuses.length === 0}
                          onChange={(e) => {
                            const statusId = Number(e.target.value);
                            if (!statusId) return;
                            updateStatus.mutate({ id: tx.id, statusId });
                          }}
                          className="w-full max-w-[220px] px-2.5 py-2 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-[10px] text-[var(--text-primary)] outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="">No status</option>
                          {statuses.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {updateStatus.isError && (
                <p className="mt-3 text-[var(--accent-red)] text-[13px]">Failed to update status.</p>
              )}
              {updateStatus.isSuccess && (
                <p className="mt-3 text-[var(--accent-green)] text-[13px]">Status updated.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
