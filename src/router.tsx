import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';

const router = createBrowserRouter(
  [
    {
      path: '/*',
      element: <App />,
    },
  ],
  {
    // Las flags futuras se manejarán en la v7
    future: {}
  }
);

export const Router = () => <RouterProvider router={router} />;