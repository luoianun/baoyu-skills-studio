import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { RequireAuth, RequireAdmin } from './guards'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import CoverImagePage from '../pages/studio/CoverImagePage'
import InfographicPage from '../pages/studio/InfographicPage'
import ArticleIllustratorPage from '../pages/studio/ArticleIllustratorPage'
import ComicPage from '../pages/studio/ComicPage'
import SlideDeckPage from '../pages/studio/SlideDeckPage'
import XhsImagesPage from '../pages/studio/XhsImagesPage'
import PortfoliosPage from '../pages/portfolios/PortfoliosPage'
import PortfolioDetailPage from '../pages/portfolios/PortfolioDetailPage'
import DashboardPage from '../pages/admin/DashboardPage'
import UserListPage from '../pages/admin/UserListPage'
import UserDetailPage from '../pages/admin/UserDetailPage'
import GenerationsPage from '../pages/admin/GenerationsPage'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <RequireAuth />,
    children: [{
      element: <AppLayout />,
      children: [
        { path: '/studio', element: <Navigate to="/studio/cover-image" replace /> },
        { path: '/studio/cover-image', element: <CoverImagePage /> },
        { path: '/studio/infographic', element: <InfographicPage /> },
        { path: '/studio/article-illustrator', element: <ArticleIllustratorPage /> },
        { path: '/studio/comic', element: <ComicPage /> },
        { path: '/studio/slide-deck', element: <SlideDeckPage /> },
        { path: '/studio/xhs-images', element: <XhsImagesPage /> },
        { path: '/portfolios', element: <PortfoliosPage /> },
        { path: '/portfolios/:id', element: <PortfolioDetailPage /> },
        { path: '/admin', element: <RequireAdmin />, children: [
          { index: true, element: <DashboardPage /> },
          { path: 'users', element: <UserListPage /> },
          { path: 'users/:id', element: <UserDetailPage /> },
          { path: 'generations', element: <GenerationsPage /> },
        ]},
      ],
    }],
  },
])
