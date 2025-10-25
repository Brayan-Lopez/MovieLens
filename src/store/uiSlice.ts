import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { TMDbSearchItem } from '../types/movie';

export interface SearchState {
  query: string;
  type: 'movie' | 'tv' | 'multi' | undefined;
  page: number;
  totalResults: number;
  results: TMDbSearchItem[];
}

export interface FiltersState {
  quality: 'all' | 'high' | 'medium' | 'low';
  genreId: number | 'all';
  classification: 'all' | 'no_adult' | 'adult';
  year: number | 'all';
  language: string | 'all';
  sortBy: 'recent' | 'rating' | 'popularity' | 'title_asc';
}

interface UiState {
  search: SearchState | null;
  filters: FiltersState;
}

const initialState: UiState = {
  search: null,
  filters: {
    quality: 'all',
    genreId: 'all',
    classification: 'all',
    year: 'all',
    language: 'all',
    sortBy: 'recent',
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearchState: (state, action: PayloadAction<SearchState>) => {
      state.search = action.payload;
    },
    clearSearchState: (state) => {
      state.search = null;
    },
    setFilters: (state, action: PayloadAction<FiltersState>) => {
      state.filters = action.payload;
    },
  },
});

export const { setSearchState, clearSearchState, setFilters } = uiSlice.actions;
export default uiSlice.reducer;