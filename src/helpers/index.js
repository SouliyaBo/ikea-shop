import { USER_DATA } from "@/constants";
import axios from "axios";
import { checkAuthStatus, forceLogout, updateLastActivity } from "./authHelper";
import { requiresAuth } from "@/config/routes";

// ตั้งค่า axios interceptors
axios.interceptors.request.use(
	(config) => {
		// ตรวจสอบว่า URL นี้ต้องการ authentication หรือไม่
		const needsAuth = requiresAuth(config.url);
		
		// ถ้าต้องการ auth และมี Authorization header
		if (needsAuth && config.headers.Authorization) {
			if (!checkAuthStatus()) {
				// ถ้า auth ไม่ valid ให้ cancel request
				const cancelToken = axios.CancelToken.source();
				config.cancelToken = cancelToken.token;
				cancelToken.cancel('Authentication expired');
				return config;
			}
			// อัพเดทเวลาการใช้งานล่าสุด
			updateLastActivity();
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

axios.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		// ตรวจสอบ error response สำหรับ 401 Unauthorized
		// แต่ต้องตรวจสอบว่า request นั้นต้องการ auth หรือไม่
		if (error.response && error.response.status === 401) {
			const needsAuth = requiresAuth(error.config?.url || "");
			if (needsAuth) {
				console.log("401 Unauthorized on protected endpoint - forcing logout");
				forceLogout();
			}
		}
		return Promise.reject(error);
	}
);

export const get = async (
	url,
	token,
	setLoading,
	handleSuccess,
	handleError,
) => {
	setLoading(true);

	try {
		// ตรวจสอบว่า URL นี้ต้องการ authentication หรือไม่
		const needsAuth = requiresAuth(url);
		
		// ถ้าต้องการ auth และมี token ให้ตรวจสอบ auth status
		if (needsAuth && token && !checkAuthStatus()) {
			setLoading(false);
			return;
		}

		const headers = {};
		// เพิ่ม Authorization header เฉพาะเมื่อมี token
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const response = await axios.get(url, { headers });
		handleSuccess(response.data);
	} catch (error) {
		if (axios.isCancel(error)) {
			console.log('Request canceled due to authentication expiry');
		} else {
			handleError(error);
		}
	} finally {
		setLoading(false);
	}
};

export const gets = async (
	url,
	params,
	token,
	setLoading,
	handleSuccess,
	handleError,
) => {
	setLoading(true);

	try {
		// ตรวจสอบว่า URL นี้ต้องการ authentication หรือไม่
		const needsAuth = requiresAuth(url);
		
		// ถ้าต้องการ auth และมี token ให้ตรวจสอบ auth status
		if (needsAuth && token && !checkAuthStatus()) {
			setLoading(false);
			return;
		}

		const headers = {};
		// เพิ่ม Authorization header เฉพาะเมื่อมี token
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const response = await axios.get(url, {
			params,
			headers,
		});
		handleSuccess(response.data);
	} catch (error) {
		if (axios.isCancel(error)) {
			console.log('Request canceled due to authentication expiry');
		} else {
			handleError(error);
		}
	} finally {
		setLoading(false);
	}
};

export const create = async (
	url,
	data,
	token,
	setLoading,
	handleSuccess,
	handleError,
) => {
	setLoading(true);

	try {
		// ตรวจสอบว่า URL นี้ต้องการ authentication หรือไม่
		const needsAuth = requiresAuth(url);
		
		// ถ้าต้องการ auth และมี token ให้ตรวจสอบ auth status
		if (needsAuth && token && !checkAuthStatus()) {
			setLoading(false);
			return;
		}

		const headers = {};
		// เพิ่ม Authorization header เฉพาะเมื่อมี token
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const response = await axios.post(url, data, { headers });
		handleSuccess(response.data);
	} catch (error) {
		if (axios.isCancel(error)) {
			console.log('Request canceled due to authentication expiry');
		} else {
			handleError(error);
		}
	} finally {
		setLoading(false);
	}
};

export const update = async (
	url,
	data,
	token,
	setLoading,
	handleSuccess,
	handleError,
) => {
	setLoading(true);

	try {
		// ตรวจสอบว่า URL นี้ต้องการ authentication หรือไม่
		const needsAuth = requiresAuth(url);
		
		// ถ้าต้องการ auth และมี token ให้ตรวจสอบ auth status
		if (needsAuth && token && !checkAuthStatus()) {
			setLoading(false);
			return;
		}

		const headers = {};
		// เพิ่ม Authorization header เฉพาะเมื่อมี token
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const response = await axios.put(url, data, { headers });
		handleSuccess(response.data);
	} catch (error) {
		if (axios.isCancel(error)) {
			console.log('Request canceled due to authentication expiry');
		} else {
			handleError(error);
		}
	} finally {
		setLoading(false);
	}
};

export const remove = async (
	url,
	token,
	setLoading,
	handleSuccess,
	handleError,
) => {
	setLoading(true);

	try {
		// ตรวจสอบว่า URL นี้ต้องการ authentication หรือไม่
		const needsAuth = requiresAuth(url);
		
		// ถ้าต้องการ auth และมี token ให้ตรวจสอบ auth status
		if (needsAuth && token && !checkAuthStatus()) {
			setLoading(false);
			return;
		}

		const headers = {};
		// เพิ่ม Authorization header เฉพาะเมื่อมี token
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const response = await axios.delete(url, { headers });
		handleSuccess(response.data);
	} catch (error) {
		if (axios.isCancel(error)) {
			console.log('Request canceled due to authentication expiry');
		} else {
			handleError(error);
		}
	} finally {
		setLoading(false);
	}
};

export const uploadS3File = async (event) => {
	try {
		const data = event?.target?.files[0];
		let generateName = "";
		let result = "CTLH";
		const characters = "0123456789";
		const charactersLength = characters.length;
		for (let i = 0; i < 9; i++) {
			generateName = result += characters.charAt(
				Math.floor(Math.random() * charactersLength),
			);
		}
		const parts = data?.name.split(".");
		const newImageName = `${generateName}.${parts[parts.length - 1]}`;
		const presignData = JSON.stringify({ fileName: newImageName });
		const config = {
			method: "post",
			maxBodyLength: Number.POSITIVE_INFINITY,
			// url: "https://api.ctlhgroup.com/v1/api/file/presign-url",
			// url: "https://prod-api.dee2u.com/v1/api/file/presign-url",
			url: `${process.env.NEXT_PUBLIC_API_LINK}/v1/api/file/presign-url`,
			headers: {
				"Content-Type": "application/json",
			},
			data: presignData,
		};
		const responsePresignUrl = await axios.request(config);
		await axios({
			method: "PUT",
			url: responsePresignUrl?.data?.url,
			data: data,
			headers: {
				"Content-Type": " file/*; image/*",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
				"Access-Control-Allow-Headers":
					"Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
			},
			onUploadProgress: (progressEvent) => {
				const percentCompleted = Math.round(
					(progressEvent.loaded * 100) / progressEvent.total,
				);
				console.log(`Upload Progress: ${percentCompleted}%`);
			},
		});

		return newImageName;
	} catch (error) {
		console.error("File upload error:", error);
		throw error;
	}
};

export const getUserDataFromLCStorage = () => {
	if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
		const user = JSON.parse(localStorage.getItem(USER_DATA));
		return user;
	}
	return null;
};
export const getAccessTokenFromLCStorage = () => {
	if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
		const user = JSON.parse(localStorage.getItem(USER_DATA));
		return user?.accessToken;
	}
	return null;
};

export const convertErrorCode = (value) => {
	let resp = "";
	switch (value) {
		case "PRODUCT_NOT_ENOUGH":
			resp = "ສິນຄ້າບໍ່ພຽງພໍ";
			break;
		case "DATA_NOT_FOUND":
			resp = "ບໍ່ມີຂໍ້ມູນ";
			break;
		case "INCORRECT_PHONE_NUMBER_OR_PASSWORD":
			resp = "ເບີໂທ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ";
			break;
		case "PRODUCT_ALREADY_EXIST":
			resp = "ສິນຄ້ານີ້ມີຢູ່ແລ້ວ";
			break;
		case "DATA_ALREADY_EXIST":
			resp = "ຂໍ້ມູນນີ້ມີຢູ່ແລ້ວ";
			break;
		case "PHONE_ALREADY_EXIST":
			resp = "ເບີໂທນີ້ມີຢູ່ແລ້ວ";
			break;
		case "FULL_REQUEST_FOR_DAY":
			resp = "ຄຳຂໍເຖິງຂີດຈຳກັດຕໍ່ມື້ແລ້ວ";
			break;

		default:
			resp = "ກະລຸນາລອງໃໝ່ພາຍຫຼັງ";
			break;
	}
	return resp;
};

export const convertClaimStatusToText = (value) => {
	let resp = "";
	switch (value) {
		case "REQUESTING":
			resp = "claimRequest";
			break;
		case "APPROVED":
			resp = "claimApproved";
			break;
		case "REJECTED":
			resp = "claimRejected";
			break;
		default:
			resp = "claimRequest";
			break;
	}
	return resp;
};

export const convertClaimStatusToColor = (value) => {
	let resp = "";
	switch (value) {
		case "REQUESTING":
			resp = "text-yellow-600";
			break;
		case "APPROVED":
			resp = "text-green-600";
			break;
		case "REJECTED":
			resp = "text-red-600";
			break;
		default:
			resp = "text-yellow-500";
			break;
	}
	return resp;
};
