'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TransactionForm from '@/features/transactions/components/TransactionForm';
import TransactionList from '@/features/transactions/components/TransactionList';
import { Transaction } from '@/features/transactions/types';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function Home() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const { data: transactions } = useTransactions();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--text-muted)]">
        Loading...
      </div>
    );
  }

  const handleCreateNew = () => {
    setEditingTransaction(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(undefined);
  };

  const totalAmount  = transactions?.reduce((sum, tx) => sum + tx.amount, 0) ?? 0;
  const totalCount   = transactions?.length ?? 0;
  const uniqueUsers  = new Set(transactions?.map(tx => tx.userName)).size;

  return (
    <main className="min-h-screen p-10 max-w-[1200px] mx-auto">

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[32px] font-extrabold text-[var(--text-primary)] m-0">Dashboard</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Hi <strong>{user.username}</strong>, here are your financial stats
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            user.role === 'ADMIN'
              ? 'bg-[var(--accent-purple)]/15 text-[var(--accent-purple)]'
              : 'bg-[var(--accent-green)]/15 text-[var(--accent-green)]'
          }`}>
            {user.role}
          </span>
          {user.role === 'ADMIN' && (
            <button
              onClick={() => router.push('/admin')}
              className="bg-transparent border border-[var(--border-color)] text-[var(--text-primary)] px-4 py-2 rounded-lg text-[13px] cursor-pointer font-medium transition-colors hover:bg-[var(--bg-card-hover)]"
            >
              Admin
            </button>
          )}
          <button
            onClick={logout}
            className="bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] px-4 py-2 rounded-lg text-[13px] cursor-pointer font-medium transition-all hover:border-[var(--accent-red)] hover:text-[var(--accent-red)]"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {/* Total Revenue */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[var(--text-secondary)] text-[13px] m-0">Total Revenue</p>
              <p className="text-[28px] font-bold text-[var(--text-primary)] mt-2 mb-0">
                ${totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-[var(--accent-green)]/15 rounded-[10px] p-2.5 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M10 4l-4 4M10 4l4 4" stroke="var(--accent-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <p className="text-[var(--accent-green)] text-xs mt-3">Total from all transactions</p>
        </div>

        {/* Transactions count */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[var(--text-secondary)] text-[13px] m-0">Transactions</p>
              <p className="text-[28px] font-bold text-[var(--text-primary)] mt-2 mb-0">{totalCount}</p>
            </div>
            <div className="bg-[var(--accent-purple)]/15 rounded-[10px] p-2.5 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="14" height="14" rx="3" stroke="var(--accent-purple)" strokeWidth="2"/>
                <path d="M7 10h6M10 7v6" stroke="var(--accent-purple)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <p className="text-[var(--accent-purple)] text-xs mt-3">Total records</p>
        </div>

        {/* Active Users */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[var(--text-secondary)] text-[13px] m-0">Active Users</p>
              <p className="text-[28px] font-bold text-[var(--text-primary)] mt-2 mb-0">{uniqueUsers}</p>
            </div>
            <div className="bg-[var(--accent-blue)]/15 rounded-[10px] p-2.5 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="3" stroke="var(--accent-blue)" strokeWidth="2"/>
                <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <p className="text-[var(--accent-blue)] text-xs mt-3">Unique usernames</p>
        </div>
      </div>

      {/* Transactions list + optional form panel */}
      <div className={`grid gap-5 ${isFormOpen ? 'grid-cols-[1fr_400px]' : 'grid-cols-1'}`}>
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] m-0">Daily Transactions</h2>
              <p className="text-[var(--text-secondary)] text-[13px] mt-1">All transaction records</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="bg-transparent border border-[var(--border-color)] text-[var(--text-primary)] px-4 py-2 rounded-lg text-[13px] cursor-pointer font-medium transition-colors hover:bg-[var(--bg-card-hover)]"
            >
              + Add Transaction
            </button>
          </div>
          <TransactionList onEdit={handleEdit} />
        </div>

        {isFormOpen && (
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)] self-start sticky top-5">
            <TransactionForm
              initialData={editingTransaction}
              onSuccess={handleCloseForm}
              onCancel={handleCloseForm}
            />
          </div>
        )}
      </div>
    </main>
  );
}
