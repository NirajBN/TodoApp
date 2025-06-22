import {ApiTodo} from '../types';

// API utility functions for fetching data
export const fetchTodos = async (): Promise<ApiTodo[]> => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiTodo[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch todos',
    );
  }
};
