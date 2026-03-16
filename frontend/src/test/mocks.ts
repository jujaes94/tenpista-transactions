// Mock data factories for testing

import type { Transaction, TransactionStatus } from '@/features/transactions/types';
import type { User, AuthUser } from '@/features/auth/types';

// Transaction factories
export function createMockTransaction(overrides?: Partial<Transaction>): Transaction {
  return {
    id: 1,
    amount: 1000,
    merchant: 'Test Merchant',
    description: 'Test description',
    userName: 'testuser',
    transactionDate: '2024-03-15T10:00:00Z',
    status: createMockStatus(),
    ...overrides,
  };
}

export function createMockStatus(overrides?: Partial<TransactionStatus>): TransactionStatus {
  return {
    id: 1,
    name: 'COMPLETED',
    description: 'Transaction completed',
    ...overrides,
  };
}

// User factories
export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 1,
    username: 'testuser',
    role: 'USER',
    ...overrides,
  };
}

export function createMockAuthUser(overrides?: Partial<AuthUser>): AuthUser {
  return {
    username: 'testuser',
    role: 'USER',
    token: 'test-token-123',
    ...overrides,
  };
}

// Array factories
export function createMockTransactions(count: number = 3): Transaction[] {
  return Array.from({ length: count }, (_, i) =>
    createMockTransaction({
      id: i + 1,
      merchant: `Merchant ${i + 1}`,
      amount: (i + 1) * 1000,
      userName: `user${i + 1}`,
    })
  );
}

export function createMockUsers(count: number = 3): ReturnType<typeof createMockUser>[] {
  return Array.from({ length: count }, (_, i) =>
    createMockUser({
      id: i + 1,
      username: `user${i + 1}`,
    })
  );
}

export function createMockStatuses(): TransactionStatus[] {
  return [
    { id: 1, name: 'PENDING', description: 'Pending' },
    { id: 2, name: 'COMPLETED', description: 'Completed' },
    { id: 3, name: 'CANCELLED', description: 'Cancelled' },
    { id: 4, name: 'FAILED', description: 'Failed' },
  ];
}