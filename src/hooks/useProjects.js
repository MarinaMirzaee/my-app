import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "../api/projects";

import { useAuth } from "../context/useAuth";

export function useProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["projects", user?.id, user?.role],
    queryFn: () => getProjects(user),
    enabled: Boolean(user),
  });
}

export function useProject(id) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["projects", id, user?.id, user?.role],
    queryFn: () => getProject(id, user),
    enabled: Boolean(user && id),
  });
}

export function useCreateProject() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createProject(data, user),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
}

export function useUpdateProject() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateProject(id, data, user),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
}

export function useDeleteProject() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteProject(id, user),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });
}
