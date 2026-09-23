import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";

import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import CustomersPage from "@/pages/Customers";
import CustomerDetailPage from "@/pages/CustomerDetail";
import ProductsPage from "@/pages/Products";
import CategoriesPage from "@/pages/Categories";
import GovernmentRatesPage from "@/pages/GovernmentRates";
import QuotationsPage from "@/pages/Quotations";
import QuotationBuilderPage from "@/pages/QuotationBuilder";
import QuotationDetailPage from "@/pages/QuotationDetail";
import InvoicesPage from "@/pages/Invoices";
import InvoiceDetailPage from "@/pages/InvoiceDetail";
import PaymentsPage from "@/pages/Payments";
import ReportsPage from "@/pages/Reports";
import UsersPage from "@/pages/Users";
import SettingsPage from "@/pages/Settings";

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/government-rates" element={<GovernmentRatesPage />} />
        <Route path="/quotations" element={<QuotationsPage />} />
        <Route path="/quotations/new" element={<QuotationBuilderPage />} />
        <Route path="/quotations/:id" element={<QuotationDetailPage />} />
        <Route path="/quotations/:id/edit" element={<QuotationBuilderPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
