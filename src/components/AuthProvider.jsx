"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const AuthContext = createContext(null);

export const useAuthContext = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const auth = useAuth();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// ป้องกัน hydration mismatch
	if (!mounted) {
		return children;
	}

	return (
		<AuthContext.Provider value={auth}>
			{children}
		</AuthContext.Provider>
	);
};
