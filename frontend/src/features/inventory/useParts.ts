import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from './inventory.api';
import type { PartsQueryParams, QuantityAdjustment, Part } from '@/types';

const PARTS_QUERY_KEY = 'parts';
const PART_QUERY_KEY = 'part';
const STATS_QUERY_KEY = 'dashboard-stats';

export function useParts(params: PartsQueryParams = {}) {
  return useQuery({
    queryKey: [PARTS_QUERY_KEY, params],
    queryFn: () => inventoryApi.getParts(params),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

interface UsePartOptions {
  enabled?: boolean;
}

export function usePart(id: number, options: UsePartOptions = {}) {
  return useQuery({
    queryKey: [PART_QUERY_KEY, id],
    queryFn: () => inventoryApi.getPart(id),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: id > 0 && options.enabled !== false,
    retry: 1,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => inventoryApi.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: () => inventoryApi.getZones(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useManufacturers() {
  return useQuery({
    queryKey: ['manufacturers'],
    queryFn: () => inventoryApi.getManufacturers(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: [STATS_QUERY_KEY],
    queryFn: () => inventoryApi.getDashboardStats(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCreatePart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (part: Omit<Part, 'id' | 'created_at' | 'updated_at'>) => 
      inventoryApi.createPart(part),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PARTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [STATS_QUERY_KEY] });
    },
    retry: 0,
  });
}

export function useUpdatePart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, part }: { id: number; part: Partial<Part> }) => 
      inventoryApi.updatePart(id, part),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PARTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PART_QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [STATS_QUERY_KEY] });
    },
    retry: 0,
  });
}

export function useDeletePart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => inventoryApi.deletePart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PARTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [STATS_QUERY_KEY] });
    },
    retry: 0,
  });
}

export function useAdjustQuantity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (adjustment: QuantityAdjustment) => 
      inventoryApi.adjustQuantity(adjustment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PARTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PART_QUERY_KEY, variables.part_id] });
      queryClient.invalidateQueries({ queryKey: [STATS_QUERY_KEY] });
    },
    retry: 0,
  });
}
