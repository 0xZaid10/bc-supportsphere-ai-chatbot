import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import ChatPage from "./pages/ChatPage";
import DashboardPage from "./pages/DashboardPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <div>Oops! There was an error.</div>,
    children: [
      {
        index: true,
        element: <ChatPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;