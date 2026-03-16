import { useQuery } from '@tanstack/react-query';
import api from '@/shared/services/api';
import type { User } from '@/features/auth/types';

export const userKeys = {
  all: ['users'] as const,
};

const fetchUsers = async (): Promise<User[]> => {
  const { data } = await api.get<User[]>('/users');
  return data;
};

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: fetchUsers,
    enabled,
  });
}
