"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "@/navigation";
import { checkAuthStatus } from "@/helpers/authHelper";
import { isProtectedRoute, isPublicRoute } from "@/config/routes";

const AuthGuard = ({ children, requireAuth = null }) => {
	const router = useRouter();
	const pathname = usePathname();
	const [isChecking, setIsChecking] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const checkAuth = () => {
			// ตรวจสอบว่า route ปัจจุบันต้องการ authentication หรือไม่
			const needsAuth = requireAuth !== null 
				? requireAuth 
				: isProtectedRoute(pathname);
			
			// ถ้าเป็น public route หรือไม่ต้องการ auth
			if (!needsAuth || isPublicRoute(pathname)) {
				setIsAuthenticated(true);
				setIsChecking(false);
				return;
			}

			// ตรวจสอบ authentication status
			const authStatus = checkAuthStatus();
			setIsAuthenticated(authStatus);
			
			if (!authStatus) {
				// ถ้าไม่ authenticated และต้องการ auth ให้ redirect ไป login
				console.log(`Protected route ${pathname} requires authentication, redirecting to login`);
				router.push("/login");
				return;
			}
			
			setIsChecking(false);
		};

		checkAuth();

		// ตั้งค่า interval เพื่อตรวจสอบ auth status ทุก 30 วินาที (เฉพาะ protected routes)
		const needsAuth = requireAuth !== null 
			? requireAuth 
			: isProtectedRoute(pathname);
			
		let interval;
		if (needsAuth && !isPublicRoute(pathname)) {
			interval = setInterval(() => {
				const authStatus = checkAuthStatus();
				if (!authStatus) {
					setIsAuthenticated(false);
				}
			}, 30000); // 30 วินาที
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [requireAuth, pathname, router]);

	// แสดง loading ขณะตรวจสอบ
	if (isChecking) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	// ถ้าไม่ authenticated และต้องการ auth ให้แสดงหน้าว่าง
	const needsAuth = requireAuth !== null 
		? requireAuth 
		: isProtectedRoute(pathname);
		
	if (needsAuth && !isPublicRoute(pathname) && !isAuthenticated) {
		return null;
	}

	return children;
};

export default AuthGuard;
