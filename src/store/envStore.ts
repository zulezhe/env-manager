import { create } from 'zustand';
import { EnvironmentVariable } from '../utils/types';
import { invoke } from '@tauri-apps/api/core';

interface EnvState {
  variables: EnvironmentVariable[];
  filteredVariables: (EnvironmentVariable & { parentName?: string; isPathParent?: boolean })[];
  isLoading: boolean;
  isValidating: boolean;
  editingVariable: EnvironmentVariable | null;
  isEditDialogOpen: boolean;
  expandedSections: Set<string>;
  expandedPathVariables: Set<string>;
  invalidVariables: EnvironmentVariable[];
  showInvalidDialog: boolean;
  deleteId: string | null;

  // Actions
  loadEnvironmentVariables: () => Promise<void>;
  setVariables: (vars: EnvironmentVariable[]) => void;
  setFilteredVariables: (vars: (EnvironmentVariable & { parentName?: string; isPathParent?: boolean })[]) => void;
  setIsLoading: (loading: boolean) => void;
  setIsValidating: (validating: boolean) => void;
  setEditingVariable: (variable: EnvironmentVariable | null) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setExpandedSections: (sections: Set<string>) => void;
  setExpandedPathVariables: (variables: Set<string>) => void;
  setInvalidVariables: (vars: EnvironmentVariable[]) => void;
  setShowInvalidDialog: (show: boolean) => void;
  setDeleteId: (id: string | null) => void;
  toggleSection: (section: string) => void;
  togglePathVariable: (variableId: string) => void;
}

export const useEnvStore = create<EnvState>((set, get) => ({
  variables: [],
  filteredVariables: [],
  isLoading: false,
  isValidating: false,
  editingVariable: null,
  isEditDialogOpen: false,
  expandedSections: new Set(['user', 'system']),
  expandedPathVariables: new Set(),
  invalidVariables: [],
  showInvalidDialog: false,
  deleteId: null,

  loadEnvironmentVariables: async () => {
    set({ isLoading: true });
    try {
      const result = await invoke<EnvironmentVariable[]>('get_environment_variables');
      set({ variables: result });
    } catch (error) {
      console.error('Failed to load environment variables:', error);
      // 这里可以触发一个全局的错误提示，或者在组件中处理
    } finally {
      set({ isLoading: false });
    }
  },

  setVariables: (vars) => set({ variables: vars }),
  setFilteredVariables: (vars) => set({ filteredVariables: vars }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsValidating: (validating) => set({ isValidating: validating }),
  setEditingVariable: (variable) => set({ editingVariable: variable }),
  setIsEditDialogOpen: (open) => set({ isEditDialogOpen: open }),
  setExpandedSections: (sections) => set({ expandedSections: sections }),
  setExpandedPathVariables: (variables) => set({ expandedPathVariables: variables }),
  setInvalidVariables: (vars) => set({ invalidVariables: vars }),
  setShowInvalidDialog: (show) => set({ showInvalidDialog: show }),
  setDeleteId: (id) => set({ deleteId: id }),

  toggleSection: (section) => {
    const current = get().expandedSections;
    const newSet = new Set(current);
    if (newSet.has(section)) {
      newSet.delete(section);
    } else {
      newSet.add(section);
    }
    set({ expandedSections: newSet });
  },

  togglePathVariable: (variableId) => {
    const current = get().expandedPathVariables;
    const newSet = new Set(current);
    if (newSet.has(variableId)) {
      newSet.delete(variableId);
    } else {
      newSet.add(variableId);
    }
    set({ expandedPathVariables: newSet });
  },
}));