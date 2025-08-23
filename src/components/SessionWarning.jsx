"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/navigation";
import { checkLoginTime } from "@/helpers/authHelper";
import { isProtectedRoute, isPublicRoute } from "@/config/routes";
import { getSessionDuration, getWarningTime, getWarningUnit, getTimeUnit } from "@/config/testConfig";
import { useToast } from "@/components/ui/use-toast";


const SessionWarning = () => {
	const [showWarning, setShowWarning] = useState(false);
	const [remainingTime, setRemainingTime] = useState(0);
	const [alertShown, setAlertShown] = useState(false);
	const pathname = usePathname();
    const { toast } = useToast();
    
	// ฟังก์ชันแสดง alert แบบง่าย ๆ แทน SweetAlert2
	const showNativeAlert = (timeRemaining) => {
		const userConfirmed = confirm(
			`⚠️ แจ้งเตือนเซสชัน\n\nเซสชันของคุณจะหมดอายุใน ${timeRemaining} ${getWarningUnit()}\n\nกดตกลงเพื่อต่ออายุเซสชัน หรือ ยกเลิกเพื่อบันทึกข้อมูล`
		);
		
		if (userConfirmed) {
			extendSession();
		}
		setAlertShown(false);
	};

	const extendSession = () => {
		try {
			const userData = localStorage.getItem("USER_DATA");
			if (userData) {
				const parsedData = JSON.parse(userData);
				parsedData.loginTime = new Date().getTime();
				localStorage.setItem("USER_DATA", JSON.stringify(parsedData));
				alert("✅ ต่ออายุเซสชันสำเร็จ\n\nเซสชันของคุณได้รับการต่ออายุแล้ว");
			}
		} catch (error) {
			console.error("Error extending session:", error);
			alert("❌ เกิดข้อผิดพลาด\n\nไม่สามารถต่ออายุเซสชันได้ กรุณาเข้าสู่ระบบใหม่");
		}
	};

	useEffect(() => {
		// ถ้าเป็น public route ไม่ต้องแสดง warning
		if (isPublicRoute(pathname)) {
			setShowWarning(false);
			return;
		}

		const extendSession = () => {
			try {
				const userData = localStorage.getItem("USER_DATA");
				if (userData) {
					const parsedData = JSON.parse(userData);
					parsedData.loginTime = new Date().getTime();
					localStorage.setItem("USER_DATA", JSON.stringify(parsedData));
					alert("✅ ต่ออายุเซสชันสำเร็จ\n\nเซสชันของคุณได้รับการต่ออายุแล้ว");
				}
			} catch (error) {
				console.error("Error extending session:", error);
				alert("❌ เกิดข้อผิดพลาด\n\nไม่สามารถต่ออายุเซสชันได้ กรุณาเข้าสู่ระบบใหม่");
			}
		};

		const showSessionWarningAlert = (timeRemaining) => {
			const userConfirmed = confirm(
				`⚠️ แจ้งเตือนเซสชัน\n\nเซสชันของคุณจะหมดอายุใน ${timeRemaining} ${getWarningUnit()}\n\nกดตกลงเพื่อต่ออายุเซสชัน หรือ ยกเลิกเพื่อบันทึกข้อมูล`
			);
			
			if (userConfirmed) {
				extendSession();
			}
			setAlertShown(false);
		};

		const checkSession = () => {
			if (typeof window === "undefined") return;
			
			if (!isProtectedRoute(pathname)) {
				setShowWarning(false);
				return;
			}
			
			const userData = localStorage.getItem("USER_DATA");
			if (!userData) {
				setShowWarning(false);
				return;
			}
			
			try {
				const parsedData = JSON.parse(userData);
				const loginTime = parsedData.loginTime;
				
				if (!loginTime) {
					setShowWarning(false);
					return;
				}
				
				const currentTime = new Date().getTime();
				const sessionDuration = getSessionDuration();
				const warningTime = getWarningTime();
				const timeElapsed = currentTime - loginTime;
				const timeRemaining = sessionDuration - timeElapsed;
				
				if (timeRemaining <= warningTime && timeRemaining > 0) {
					setShowWarning(true);
					setRemainingTime(Math.ceil(timeRemaining / getTimeUnit()));
					
					if (!alertShown) {
						setAlertShown(true);
						showSessionWarningAlert(Math.ceil(timeRemaining / getTimeUnit()));
					}
				} else {
					setShowWarning(false);
					setAlertShown(false);
				}
			} catch (error) {
				console.error("Error checking session time:", error);
				setShowWarning(false);
			}
		};

		checkSession();
		
		let interval;
		if (isProtectedRoute(pathname)) {
			interval = setInterval(checkSession, 30000);
		}
		
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [pathname, alertShown]);

	return null;
};

export default SessionWarning;