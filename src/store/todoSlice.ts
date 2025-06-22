import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {fetchTodos} from '../utils/api';
import {
  Todo,
  TodoState,
  AddTodoPayload,
  EditTodoPayload,
  FilterType,
  SortType,
  ApiTodo,
} from '../types';

// Async thunk for fetching todos from API
export const fetchTodosAsync = createAsyncThunk<
  Todo[],
  void,
  {rejectValue: string}
>('todos/fetchTodos', async (_, {rejectWithValue}) => {
  try {
    const response = await fetchTodos();
    // Transform API todos to include timestamps
    const todosWithTimestamps: Todo[] = response.map((apiTodo: ApiTodo) => ({
      ...apiTodo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    return todosWithTimestamps;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch todos',
    );
  }
});

const initialState: TodoState = {
  items: [],
  loading: false,
  error: null,
  filter: 'All',
  sortBy: 'mostRecent',
};

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // Add new todo item
    addTodo: (state, action: PayloadAction<AddTodoPayload>) => {
      const newTodo: Todo = {
        id: Date.now(), // Simple ID generation for demo
        title: action.payload.title,
        completed: false,
        userId: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      state.items.unshift(newTodo); // Add to beginning for most recent
    },

    // Toggle todo completion status
    toggleTodo: (state, action: PayloadAction<number>) => {
      const todo = state.items.find(item => item.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
        todo.updated_at = new Date().toISOString();
      }
    },

    // Delete todo item
    deleteTodo: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },

    // Edit todo item
    editTodo: (state, action: PayloadAction<EditTodoPayload>) => {
      const {id, title} = action.payload;
      const todo = state.items.find(item => item.id === id);
      if (todo) {
        todo.title = title;
        todo.updated_at = new Date().toISOString();
      }
    },

    // Set filter (All, Active, Done)
    setFilter: (state, action: PayloadAction<FilterType>) => {
      state.filter = action.payload;
    },

    // Set sort order (mostRecent, id)
    setSortBy: (state, action: PayloadAction<SortType>) => {
      state.sortBy = action.payload;
    },

    // Clear error
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTodosAsync.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodosAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTodosAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch todos';
      });
  },
});

export const {
  addTodo,
  toggleTodo,
  deleteTodo,
  editTodo,
  setFilter,
  setSortBy,
  clearError,
} = todoSlice.actions;

export default todoSlice.reducer;
