export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
  created_at: string;
  updated_at: string;
}

export interface TodoState {
  items: Todo[];
  loading: boolean;
  error: string | null;
  filter: FilterType;
  sortBy: SortType;
}

export type FilterType = 'All' | 'Active' | 'Done';
export type SortType = 'mostRecent' | 'id';

export interface AddTodoPayload {
  title: string;
}

export interface EditTodoPayload {
  id: number;
  title: string;
}

// Navigation types
export type RootStackParamList = {
  MainScreen: undefined;
  AddTodoScreen: undefined;
};

// Component props types
export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number, title: string) => void;
}

export interface FilterButtonsProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export interface SortButtonsProps {
  currentSort: SortType;
  onSortChange: (sort: SortType) => void;
}

export interface ApiTodo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}
