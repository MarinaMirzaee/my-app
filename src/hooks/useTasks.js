import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";

import { useAuth } from "../context/useAuth";

export function useTasks(projectIds) {
  return useQuery({
    queryKey: ["tasks", projectIds],
    queryFn: () => getTasks(projectIds),
    enabled: Array.isArray(projectIds),
  });
}

export function useCreateTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createTask(data, user),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });
}

export function useUpdateTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateTask(id, data, user),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });
}

export function useDeleteTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteTask(id, user),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });
}
