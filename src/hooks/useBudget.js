import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { v4 as uuidv4 } from 'uuid';

export function useBudget() {
  const { state, dispatch } = useContext(AppContext);

  const addBudget = (budget) => {
    const newBudget = { ...budget, id: uuidv4() };
    dispatch({ type: 'ADD_BUDGET', payload: newBudget });
    dispatch({ type: 'ADD_TOAST', payload: { message: 'Budget set successfully!', type: 'success' } });
  };

  const editBudget = (budget) => {
    dispatch({ type: 'EDIT_BUDGET', payload: budget });
    dispatch({ type: 'ADD_TOAST', payload: { message: 'Budget updated!', type: 'success' } });
  };

  const deleteBudget = (id) => {
    dispatch({ type: 'DELETE_BUDGET', payload: id });
    dispatch({ type: 'ADD_TOAST', payload: { message: 'Budget removed.', type: 'info' } });
  };

  return {
    budgets: state.budgets,
    addBudget,
    editBudget,
    deleteBudget,
  };
}
