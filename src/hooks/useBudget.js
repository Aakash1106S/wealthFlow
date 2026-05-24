import { useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { budgetAPI } from '../services/api';

export function useBudget() {
  const { state, dispatch, loadBudgets } = useContext(AppContext);

  const addBudget = useCallback(async (data) => {
    try {
      const res = await budgetAPI.create(data);
      const budget = { ...res.data.data, id: res.data.data._id };
      dispatch({ type: 'ADD_BUDGET', payload: budget });
      dispatch({ type: 'ADD_TOAST', payload: { message: 'Budget set!', type: 'success' } });
      return { success: true, data: budget };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to set budget';
      dispatch({ type: 'ADD_TOAST', payload: { message, type: 'error' } });
      return { success: false, error: message };
    }
  }, [dispatch]);

  const editBudget = useCallback(async (id, data) => {
    try {
      const res = await budgetAPI.update(id, data);
      const budget = { ...res.data.data, id: res.data.data._id };
      dispatch({ type: 'EDIT_BUDGET', payload: budget });
      dispatch({ type: 'ADD_TOAST', payload: { message: 'Budget updated!', type: 'success' } });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update budget';
      dispatch({ type: 'ADD_TOAST', payload: { message, type: 'error' } });
      return { success: false, error: message };
    }
  }, [dispatch]);

  const deleteBudget = useCallback(async (id) => {
    try {
      await budgetAPI.delete(id);
      dispatch({ type: 'DELETE_BUDGET', payload: id });
      dispatch({ type: 'ADD_TOAST', payload: { message: 'Budget removed.', type: 'info' } });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete budget';
      dispatch({ type: 'ADD_TOAST', payload: { message, type: 'error' } });
      return { success: false, error: message };
    }
  }, [dispatch]);

  return {
    budgets: state.budgets,
    loading: state.loading.budgets,
    addBudget,
    editBudget,
    deleteBudget,
    reload: loadBudgets,
  };
}
