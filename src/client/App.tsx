import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";

import HomePage from "@/pages/HomePage";
import AdminLoginPage from "@/pages/AdminLogin";
import DashboardPage from "@/pages/Dashboard";
import CustomersPage from "@/pages/Customers";
import CustomerDetailPage from "@/pages/CustomerDetail";
import ProductsPage from "@/pages/Products";
import CategoriesPage from "@/pages/Categories";
import GovernmentRatesPage from "@/pages/GovernmentRates";
import QuotationsPage from "@/pages/Quotations";
import QuotationBuilderPage from "@/pages/QuotationBuilder";
import MiniSprinklerQuotationBuilderPage from "@/pages/MiniSprinklerQuotationBuilder";
import QuotationDetailPage from "@/pages/QuotationDetail";
import InvoicesPage from "@/pages/Invoices";
import InvoiceBuilderPage from "@/pages/InvoiceBuilder";
import MiniSprinklerInvoiceBuilderPage from "@/pages/MiniSprinklerInvoiceBuilder";
import RegularInvoiceBuilderPage from "@/pages/RegularInvoiceBuilder";
import InvoiceDetailPage from "@/pages/InvoiceDetail";
import PaymentsPage from "@/pages/Payments";
import ReportsPage from "@/pages/Reports";
import UsersPage from "@/pages/Users";
import SettingsPage from "@/pages/Settings";

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* ── Public Routes (no auth required) ── */}
      <Route path="/" element={<HomePage />} />

      {/* ── Admin Login ── */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Legacy /login redirect → /admin/login */}
      <Route path="/login" element={<Navigate to="/admin/login" replace />} />

      {/* Legacy/Convenience redirects so nested links always route to admin */}
      <Route path="/quotations/*" element={<Navigate to="/admin/quotations" replace />} />
      <Route path="/invoices/*" element={<Navigate to="/admin/invoices" replace />} />
      <Route path="/customers/*" element={<Navigate to="/admin/customers" replace />} />

      {/* ── Protected Admin Routes ── */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="government-rates" element={<GovernmentRatesPage />} />
        <Route path="quotations" element={<QuotationsPage />} />
        <Route path="quotations/new" element={<QuotationBuilderPage />} />
        <Route path="quotations/new-mini-sprinkler" element={<MiniSprinklerQuotationBuilderPage />} />
        <Route path="quotations/:id" element={<QuotationDetailPage />} />
        <Route path="quotations/:id/edit" element={<QuotationBuilderPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/new" element={<InvoiceBuilderPage />} />
        <Route path="invoices/new-mini-sprinkler" element={<MiniSprinklerInvoiceBuilderPage />} />
        <Route path="invoices/new-regular" element={<RegularInvoiceBuilderPage />} />
        <Route path="invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="invoices/:id/edit" element={<InvoiceBuilderPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
