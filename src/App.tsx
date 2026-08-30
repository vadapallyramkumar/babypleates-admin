import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import { AdminLayout } from './layouts/AdminLayout'
import { CategoriesPage } from './pages/CategoriesPage'
import { CategoryCreatePage } from './pages/CategoryCreatePage'
import { CategoryEditPage } from './pages/CategoryEditPage'
import { InventoryPage } from './pages/InventoryPage'
import { LoginPage } from './pages/LoginPage'
import { MediaPage } from './pages/MediaPage'
import { MediaUploadPage } from './pages/MediaUploadPage'
import { OverviewPage } from './pages/OverviewPage'
import { ProductCreatePage, ProductEditPage } from './pages/ProductEditPage'
import { ProductsPage } from './pages/ProductsPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

  return (
    <BrowserRouter basename={basename || undefined}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductCreatePage />} />
            <Route path="products/:id" element={<ProductEditPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="categories/new" element={<CategoryCreatePage />} />
            <Route path="categories/:id/edit" element={<CategoryEditPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="media/new" element={<MediaUploadPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
