// ตัวอย่างการใช้งานใน protected page (เช่น หน้า profile)
// ไฟล์นี้แสดงวิธีการดึงข้อมูลผู้ใช้ที่ต้องใช้ authentication

"use client";
import { useState, useEffect } from "react";
import { get, getUserDataFromLCStorage } from "@/helpers";
import AuthGuard from "@/components/AuthGuard";

const UserProfileExample = () => {
	const [userProfile, setUserProfile] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// ดึงข้อมูล USER_DATA จาก localStorage
		const userData = getUserDataFromLCStorage();
		
		if (userData?.accessToken && userData?.data?.id) {
			// ดึงข้อมูล profile ผู้ใช้ที่ต้องใช้ token
			// เนื่องจาก /v1/api/user/{id} เป็น protected endpoint
			get(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user/${userData.data.id}`,
				userData.accessToken, // ส่ง token
				setLoading,
				(data) => {
					console.log("User profile loaded:", data);
					setUserProfile(data?.data);
				},
				(error) => {
					console.error("Error loading user profile:", error);
					// ถ้า error 401 ระบบจะ auto logout ผ่าน interceptor
				}
			);
		}
	}, []);

	if (loading) {
		return <div>Loading profile...</div>;
	}

	if (!userProfile) {
		return <div>No profile data</div>;
	}

	return (
		<div>
			<h1>โปรไฟล์ของฉัน (ต้อง Login)</h1>
			<div className="border p-4 rounded">
				<h2>{userProfile.firstName} {userProfile.lastName}</h2>
				<p>เบอร์โทร: {userProfile.phone}</p>
				<p>อีเมล: {userProfile.email}</p>
				<p>วันที่สมัครสมาชิก: {new Date(userProfile.createdAt).toLocaleDateString('th-TH')}</p>
			</div>
		</div>
	);
};

// ห่อด้วย AuthGuard เพื่อป้องกันการเข้าถึงโดยไม่มี authentication
const ProtectedUserProfile = () => {
	return (
		<AuthGuard>
			<UserProfileExample />
		</AuthGuard>
	);
};

export default ProtectedUserProfile;
