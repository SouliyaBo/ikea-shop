import { USER_DATA } from "@/constants";
import { useRouter } from "@/navigation";
import { getSessionDuration } from "@/config/testConfig";

/**
 * ตรวจสอบเวลาล็อกอิน (1 ชั่วโมง)
 */
export const checkLoginTime = () => {
	if (typeof window === "undefined") return true;
	
	const userData = localStorage.getItem(USER_DATA);
	if (!userData) return false;
	
	try {
		const parsedData = JSON.parse(userData);
		const loginTime = parsedData.loginTime;
		
		if (!loginTime) {
			// ถ้าไม่มี loginTime ให้เซ็ตเวลาปัจจุบัน
			setLoginTime();
			return true;
		}
		
		const currentTime = new Date().getTime();
		const sessionDuration = getSessionDuration();
		
		if (currentTime - loginTime > sessionDuration) {
			// เกินเวลาที่กำหนดแล้ว
			return false;
		}
		
		return true;
	} catch (error) {
		console.error("Error checking login time:", error);
		return false;
	}
};

/**
 * เซ็ตเวลาล็อกอิน
 */
export const setLoginTime = () => {
	if (typeof window === "undefined") return;
	
	const userData = localStorage.getItem(USER_DATA);
	if (!userData) return;
	
	try {
		const parsedData = JSON.parse(userData);
		parsedData.loginTime = new Date().getTime();
		localStorage.setItem(USER_DATA, JSON.stringify(parsedData));
	} catch (error) {
		console.error("Error setting login time:", error);
	}
};

/**
 * ล็อกเอาท์และล้าง localStorage
 */
export const forceLogout = () => {
	if (typeof window === "undefined") return;
	
	// ล้าง localStorage ทั้งหมด
	localStorage.clear();
	
	// สร้าง custom event สำหรับแจ้งเตือนการ logout
	const logoutEvent = new CustomEvent('forceLogout', {
		detail: { reason: 'session_expired' }
	});
	window.dispatchEvent(logoutEvent);
	
	// แสดง alert และ redirect ไปหน้า login
	setTimeout(() => {
		if (window.confirm("เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่")) {
			window.location.href = "/login";
		} else {
			window.location.href = "/login";
		}
	}, 100);
};

/**
 * ตรวจสอบ token ว่าหมดอายุหรือไม่
 */
export const isTokenExpired = (token) => {
	if (!token) return true;
	
	try {
		// ถ้า token เป็น JWT ให้ decode ตรวจสอบ exp
		const base64Url = token.split('.')[1];
		if (!base64Url) return false; // ถ้าไม่ใช่ JWT ให้ server ตรวจสอบ
		
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
			return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
		}).join(''));
		
		const decoded = JSON.parse(jsonPayload);
		const currentTime = Date.now() / 1000;
		
		return decoded.exp && decoded.exp < currentTime;
	} catch (error) {
		console.error("Error checking token expiration:", error);
		return false; // ถ้า decode ไม่ได้ให้ server ตรวจสอบ
	}
};

/**
 * ตรวจสอบ authentication status
 */
export const checkAuthStatus = () => {
	if (typeof window === "undefined") return true;
	
	const userData = localStorage.getItem(USER_DATA);
	if (!userData) {
		return false;
	}
	
	try {
		const parsedData = JSON.parse(userData);
		const token = parsedData.accessToken;
		
		// ตรวจสอบ token หมดอายุ
		if (isTokenExpired(token)) {
			console.log("Token expired, forcing logout");
			forceLogout();
			return false;
		}
		
		// ตรวจสอบเวลาล็อกอิน
		if (!checkLoginTime()) {
			console.log("Login time exceeded 1 hour, forcing logout");
			forceLogout();
			return false;
		}
		
		return true;
	} catch (error) {
		console.error("Error checking auth status:", error);
		forceLogout();
		return false;
	}
};

/**
 * อัพเดทเวลาล็อกอินเมื่อมีการใช้งาน
 */
export const updateLastActivity = () => {
	if (typeof window === "undefined") return;
	
	const userData = localStorage.getItem(USER_DATA);
	if (!userData) return;
	
	try {
		const parsedData = JSON.parse(userData);
		parsedData.lastActivity = new Date().getTime();
		localStorage.setItem(USER_DATA, JSON.stringify(parsedData));
	} catch (error) {
		console.error("Error updating last activity:", error);
	}
};
