"use client";

import { useEffect } from "react";
import { usePathname } from "@/navigation";
import { checkAuthStatus } from "@/helpers/authHelper";
import { isProtectedRoute, isPublicRoute } from "@/config/routes";

const SessionChecker = () => {
	const pathname = usePathname();

	useEffect(() => {
		// ถ้าเป็น public route ไม่ต้องตรวจสอบ session
		if (isPublicRoute(pathname)) return;

		// ตรวจสอบ session ทุก 1 นาที (เฉพาะ protected routes)
		const interval = setInterval(() => {
			if (isProtectedRoute(pathname)) {
				checkAuthStatus();
			}
		}, 60000); // 1 นาที

		// ตรวจสอบ session เมื่อ page focus (เฉพาะ protected routes)
		const handleFocus = () => {
			if (isProtectedRoute(pathname)) {
				checkAuthStatus();
			}
		};

		// ตรวจสอบ session เมื่อ page visibility เปลี่ยน (เฉพาะ protected routes)
		const handleVisibilityChange = () => {
			if (!document.hidden && isProtectedRoute(pathname)) {
				checkAuthStatus();
			}
		};

		window.addEventListener("focus", handleFocus);
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			clearInterval(interval);
			window.removeEventListener("focus", handleFocus);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [pathname]);

	return null; // Component นี้ไม่ต้องแสดงอะไร
};

export default SessionChecker;
