import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export function useTransactions() {
  const { state, dispatch } = useContext(AppContext);
  
  const addTransaction = (transaction) => {
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    dispatch({ type: 'ADD_TOAST', payload: { message: 'Transaction added successfully!', type: 'success' } });
  };

  const editTransaction = (transaction) => {
    dispatch({ type: 'EDIT_TRANSACTION', payload: transaction });
    dispatch({ type: 'ADD_TOAST', payload: { message: 'Transaction updated!', type: 'success' } });
  };

  const deleteTransaction = (id) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    dispatch({ type: 'ADD_TOAST', payload: { message: 'Transaction deleted.', type: 'info' } });
  };

  return {
    transactions: state.transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
  };
}
