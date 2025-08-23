"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "@/navigation";
import { checkAuthStatus, forceLogout, updateLastActivity } from "@/helpers/authHelper";
import { getUserDataFromLCStorage } from "@/helpers";
import { isProtectedRoute, isPublicRoute } from "@/config/routes";

export const useAuth = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const pathname = usePathname();

	// ตรวจสอบ authentication status
	const checkAuth = useCallback(() => {
		try {
			// ถ้าเป็น public route ไม่ต้องตรวจสอบ auth
			if (isPublicRoute(pathname)) {
				setIsAuthenticated(true);
				setUser(getUserDataFromLCStorage());
				return true;
			}

			const userData = getUserDataFromLCStorage();
			
			if (!userData) {
				setIsAuthenticated(false);
				setUser(null);
				return false;
			}

			const authStatus = checkAuthStatus();
			
			if (authStatus) {
				setIsAuthenticated(true);
				setUser(userData);
				updateLastActivity();
				return true;
			} else {
				setIsAuthenticated(false);
				setUser(null);
				return false;
			}
		} catch (error) {
			console.error("Error checking auth:", error);
			setIsAuthenticated(false);
			setUser(null);
			return false;
		}
	}, [pathname]);

	// ล็อกเอาท์
	const logout = useCallback(() => {
		forceLogout();
		setIsAuthenticated(false);
		setUser(null);
		router.push("/login");
	}, [router]);

	// ตรวจสอบ auth เมื่อ component mount หรือ pathname เปลี่ยน
	useEffect(() => {
		const isAuth = checkAuth();
		setIsLoading(false);
	}, [checkAuth, pathname]);

	// ตั้งค่า interval สำหรับตรวจสอบ auth status (เฉพาะ protected routes)
	useEffect(() => {
		// ถ้าเป็น public route หรือไม่ authenticated ไม่ต้องตั้ง interval
		if (isPublicRoute(pathname) || !isAuthenticated) return;

		const interval = setInterval(() => {
			const authStatus = checkAuthStatus();
			if (!authStatus && isProtectedRoute(pathname)) {
				logout();
			}
		}, 30000); // ตรวจสอบทุก 30 วินาที

		return () => clearInterval(interval);
	}, [isAuthenticated, logout, pathname]);

	// Event listener สำหรับ mouse move และ keyboard activity (เฉพาะ protected routes)
	useEffect(() => {
		// ถ้าเป็น public route หรือไม่ authenticated ไม่ต้องตั้ง listeners
		if (isPublicRoute(pathname) || !isAuthenticated) return;

		const handleActivity = () => {
			updateLastActivity();
		};

		// เพิ่ม event listeners
		window.addEventListener("mousemove", handleActivity);
		window.addEventListener("keypress", handleActivity);
		window.addEventListener("click", handleActivity);
		window.addEventListener("scroll", handleActivity);

		return () => {
			window.removeEventListener("mousemove", handleActivity);
			window.removeEventListener("keypress", handleActivity);
			window.removeEventListener("click", handleActivity);
			window.removeEventListener("scroll", handleActivity);
		};
	}, [isAuthenticated, pathname]);

	return {
		isAuthenticated,
		user,
		isLoading,
		checkAuth,
		logout,
		refreshAuth: checkAuth,
		isProtectedRoute: isProtectedRoute(pathname),
		isPublicRoute: isPublicRoute(pathname)
	};
};
