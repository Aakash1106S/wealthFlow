import { useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { transactionAPI } from '../services/api';

export function useTransactions() {
  const { state, dispatch, loadTransactions } = useContext(AppContext);

  const addTransaction = useCallback(async (data) => {
    try {
      const res = await transactionAPI.create(data);
      const tx = { ...res.data.data, id: res.data.data._id, note: res.data.data.notes || '' };
      dispatch({ type: 'ADD_TRANSACTION', payload: tx });
      dispatch({ type: 'ADD_TOAST', payload: { message: 'Transaction added!', type: 'success' } });
      // Reload budgets to update spent amounts
      return { success: true, data: tx };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add transaction';
      dispatch({ type: 'ADD_TOAST', payload: { message, type: 'error' } });
      return { success: false, error: message };
    }
  }, [dispatch]);

  const editTransaction = useCallback(async (id, data) => {
    try {
      const res = await transactionAPI.update(id, data);
      const tx = { ...res.data.data, id: res.data.data._id, note: res.data.data.notes || '' };
      dispatch({ type: 'EDIT_TRANSACTION', payload: tx });
      dispatch({ type: 'ADD_TOAST', payload: { message: 'Transaction updated!', type: 'success' } });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update transaction';
      dispatch({ type: 'ADD_TOAST', payload: { message, type: 'error' } });
      return { success: false, error: message };
    }
  }, [dispatch]);

  const deleteTransaction = useCallback(async (id) => {
    try {
      await transactionAPI.delete(id);
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      dispatch({ type: 'ADD_TOAST', payload: { message: 'Transaction deleted.', type: 'info' } });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete transaction';
      dispatch({ type: 'ADD_TOAST', payload: { message, type: 'error' } });
      return { success: false, error: message };
    }
  }, [dispatch]);

  return {
    transactions: state.transactions,
    loading: state.loading.transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    reload: loadTransactions,
  };
}
