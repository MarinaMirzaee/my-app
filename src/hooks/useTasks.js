import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";

export function useTasks() {
  return useQuery({ queryKey: ["tasks"], queryFn: getTasks });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: (created) => {
      queryClient.setQueryData(["tasks"], (old = []) => [...old, created]);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateTask(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["tasks"], (old = []) =>
        old.map((t) => (t.id === updated.id ? updated : t)),
      );
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: (_, id) => {
      queryClient.setQueryData(["tasks"], (old = []) =>
        old.filter((t) => t.id !== id),
      );
    },
  });
}
