// Routes ที่ต้องการ authentication
export const PROTECTED_ROUTES = [
	"/profile",
	"/my-store",
	"/order-history",
	"/cart",
	"/claim-history",
	"/money-user-history",
	"/withdraw-profit",
	"/user-network",
	"/store-register",
	"/new-request-store"
];

// Routes ที่ไม่ต้องการ authentication (public routes)
export const PUBLIC_ROUTES = [
	"/",
	"/login",
	"/register",
	"/logout",
	"/categories",
	"/product",
	"/search-product",
	"/featured-product",
	"/request-otp",
	"/forget-password",
	"/term",
	"/partnership"
];

/**
 * ตรวจสอบว่า route ปัจจุบันต้องการ authentication หรือไม่
 */
export const isProtectedRoute = (pathname) => {
	if (!pathname) return false;
	
	// ตรวจสอบ exact match
	if (PROTECTED_ROUTES.includes(pathname)) {
		return true;
	}
	
	// ตรวจสอบ pattern match (เช่น /profile/123, /my-store/456)
	return PROTECTED_ROUTES.some(route => {
		if (route.includes("[") || pathname.startsWith(route + "/")) {
			return true;
		}
		return false;
	});
};

/**
 * ตรวจสอบว่า route ปัจจุบันเป็น public route หรือไม่
 */
export const isPublicRoute = (pathname) => {
	if (!pathname) return true;
	
	// ตรวจสอบ exact match
	if (PUBLIC_ROUTES.includes(pathname)) {
		return true;
	}
	
	// ตรวจสอบ pattern match
	return PUBLIC_ROUTES.some(route => {
		return pathname.startsWith(route + "/") || pathname === route;
	});
};

/**
 * ตรวจสอบว่า API endpoint ต้องการ token หรือไม่
 */
export const requiresAuth = (url) => {
	const authRequiredEndpoints = [
		"/v1/api/user",
		"/v1/api/money-user",
		"/v1/api/shop",
		"/v1/api/order",
		"/v1/api/cart",
		"/v1/api/user-bank",
		"/v1/api/shop-bank",
		"/v1/api/claim",
		"/v1/api/withdraw"
	];
	
	const publicEndpoints = [
		"/v1/api/auth/login",
		"/v1/api/auth/register",
		"/v1/api/auth/request-otp",
		"/v1/api/auth/verify-otp",
		"/v1/api/auth/forget-password",
		"/v1/api/product",
		"/v1/api/category",
		"/v1/api/file/presign-url"
	];
	
	// ตรวจสอบ public endpoints ก่อน
	if (publicEndpoints.some(endpoint => url.includes(endpoint))) {
		return false;
	}
	
	// ตรวจสอบ auth required endpoints
	return authRequiredEndpoints.some(endpoint => url.includes(endpoint));
};
