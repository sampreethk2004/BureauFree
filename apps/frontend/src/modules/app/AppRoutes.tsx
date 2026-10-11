import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '../dashboard/DashboardPage';
import { LandingPage } from '../landing/LandingPage';
import { setInitialized } from '../../store/slices/baseSlice';
import { useAppDispatch } from './hooks';

export const AppRoutes = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setInitialized(true));
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
