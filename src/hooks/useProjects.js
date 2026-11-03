import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "../api/projects";

// query: read the list
export function useProjects() {
  return useQuery({ queryKey: ["projects"], queryFn: getProjects });
}

// query: read one project
export function useProject(id) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => getProject(id),
  });
}

// mutation: the server's answer the new project goes straight into the cache
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: (created) => {
      queryClient.setQueryData(["projects"], (old = []) => [...old, created]);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProject(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["projects"], (old = []) =>
        old.map((p) => (p.id === updated.id ? updated : p)),
      );
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (_, id) => {
      queryClient.setQueryData(["projects"], (old = []) =>
        old.filter((p) => p.id !== id),
      );
    },
  });
}
