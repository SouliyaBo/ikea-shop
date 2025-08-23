/**
 * ฟังก์ชันสำหรับการทดสอบระบบ Authentication
 * เรียกใช้ใน browser console เพื่อทดสอบ
 */

// ฟังก์ชันสำหรับตรวจสอบสถานะ session ปัจจุบัน
export const checkCurrentSession = () => {
	const userData = localStorage.getItem("USER_DATA");
	if (!userData) {
		console.log("❌ ไม่พบข้อมูล session");
		return;
	}

	try {
		const parsedData = JSON.parse(userData);
		const loginTime = parsedData.loginTime;
		const currentTime = new Date().getTime();
		const timeElapsed = currentTime - loginTime;
		
		console.log("📊 ข้อมูล Session:");
		console.log("⏰ เวลา Login:", new Date(loginTime).toLocaleString('th-TH'));
		console.log("⏱ เวลาปัจจุบัน:", new Date(currentTime).toLocaleString('th-TH'));
		console.log("⏳ เวลาที่ผ่านไป:", Math.floor(timeElapsed / 1000), "วินาที");
		console.log("🎯 ระยะเวลา Session:", "60 วินาที (โหมดทดสอบ)");
		console.log("⚡ เหลือเวลา:", Math.max(0, Math.floor((60 * 1000 - timeElapsed) / 1000)), "วินาที");
	} catch (error) {
		console.error("❌ Error parsing session data:", error);
	}
};

// ฟังก์ชันสำหรับจำลองการหมดอายุของ session
export const simulateSessionExpiry = () => {
	const userData = localStorage.getItem("USER_DATA");
	if (!userData) {
		console.log("❌ ไม่พบข้อมูล session");
		return;
	}

	try {
		const parsedData = JSON.parse(userData);
		// ตั้งเวลา login ให้เป็น 2 นาทีที่แล้ว (เกินกำหนด)
		parsedData.loginTime = new Date().getTime() - (2 * 60 * 1000);
		localStorage.setItem("USER_DATA", JSON.stringify(parsedData));
		console.log("⚠️ จำลองการหมดอายุ session สำเร็จ");
		console.log("🔄 Refresh หน้าหรือเรียก API เพื่อดูผลลัพธ์");
	} catch (error) {
		console.error("❌ Error simulating session expiry:", error);
	}
};

// ฟังก์ชันสำหรับจำลองการใกล้หมดอายุ (แสดง warning)
export const simulateSessionWarning = () => {
	const userData = localStorage.getItem("USER_DATA");
	if (!userData) {
		console.log("❌ ไม่พบข้อมูล session");
		return;
	}

	try {
		const parsedData = JSON.parse(userData);
		// ตั้งเวลา login ให้เหลือ 5 วินาที
		parsedData.loginTime = new Date().getTime() - (55 * 1000);
		localStorage.setItem("USER_DATA", JSON.stringify(parsedData));
		console.log("⚠️ จำลองการใกล้หมดอายุ session สำเร็จ");
		console.log("🔔 ควรเห็น session warning ภายใน 5 วินาที");
	} catch (error) {
		console.error("❌ Error simulating session warning:", error);
	}
};

// ฟังก์ชันสำหรับรีเซ็ต session ใหม่
export const resetSession = () => {
	const userData = localStorage.getItem("USER_DATA");
	if (!userData) {
		console.log("❌ ไม่พบข้อมูล session");
		return;
	}

	try {
		const parsedData = JSON.parse(userData);
		parsedData.loginTime = new Date().getTime();
		parsedData.lastActivity = new Date().getTime();
		localStorage.setItem("USER_DATA", JSON.stringify(parsedData));
		console.log("✅ รีเซ็ต session สำเร็จ");
	} catch (error) {
		console.error("❌ Error resetting session:", error);
	}
};

// เพิ่มฟังก์ชันเหล่านี้ไป window object เพื่อเรียกใช้ใน console
if (typeof window !== "undefined") {
	window.testAuth = {
		checkCurrentSession,
		simulateSessionExpiry,
		simulateSessionWarning,
		resetSession
	};
	
	console.log("🧪 Authentication Testing Tools Loaded!");
	console.log("📖 วิธีใช้งาน:");
	console.log("   testAuth.checkCurrentSession() - ตรวจสอบสถานะ session");
	console.log("   testAuth.simulateSessionExpiry() - จำลองการหมดอายุ");
	console.log("   testAuth.simulateSessionWarning() - จำลองการใกล้หมดอายุ");
	console.log("   testAuth.resetSession() - รีเซ็ต session ใหม่");
}
