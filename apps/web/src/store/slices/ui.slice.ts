// src/store/slices/ui.slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { sidebarOpen: true, activeFilters: {} as Record<string, unknown> },
  reducers: {
    toggleSidebar: (s) => { s.sidebarOpen = !s.sidebarOpen; },
    setSidebarOpen: (s, { payload }: PayloadAction<boolean>) => { s.sidebarOpen = payload; },
    setFilters: (s, { payload }: PayloadAction<Record<string, unknown>>) => { s.activeFilters = { ...s.activeFilters, ...payload }; },
    clearFilters: (s) => { s.activeFilters = {}; },
  },
});

export const { toggleSidebar, setSidebarOpen, setFilters, clearFilters } = uiSlice.actions;
export default uiSlice.reducer;
