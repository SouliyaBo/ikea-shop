/**
 * การตั้งค่าสำหรับการทดสอบระบบ Authentication
 * เปลี่ยนค่าเหล่านี้เพื่อทดสอบหรือใช้ใน production
 */

// โหมดการทดสอบ - เปลี่ยนเป็น false สำหรับ production
export const IS_TESTING_MODE = false;

// การตั้งค่าเวลาสำหรับการทดสอบ
export const TEST_SESSION_DURATION = 1 * 60 * 1000; // 1 นาที
export const TEST_WARNING_TIME = 10 * 1000; // 10 วินาที
export const TEST_WARNING_UNIT = "วินาที";

// การตั้งค่าเวลาสำหรับ production
export const PROD_SESSION_DURATION = 30 * 60 * 1000; // 1 ชั่วโมง
export const PROD_WARNING_TIME = 5 * 60 * 1000; // 5 นาที
export const PROD_WARNING_UNIT = "นาที";

// ฟังก์ชันสำหรับดึงค่าตามโหมด
export const getSessionDuration = () => {
	return IS_TESTING_MODE ? TEST_SESSION_DURATION : PROD_SESSION_DURATION;
};

export const getWarningTime = () => {
	return IS_TESTING_MODE ? TEST_WARNING_TIME : PROD_WARNING_TIME;
};

export const getWarningUnit = () => {
	return IS_TESTING_MODE ? TEST_WARNING_UNIT : PROD_WARNING_UNIT;
};

export const getTimeUnit = () => {
	return IS_TESTING_MODE ? 1000 : 60000; // วินาที vs นาที
};
