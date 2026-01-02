import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5_000,
            cacheTime: 1000 * 60 * 5,
            retry: 1,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 0,
        },
    },
});

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>
);
