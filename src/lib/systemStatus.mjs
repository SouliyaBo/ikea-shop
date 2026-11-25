// "unknown" means the API could not tell us; callers must keep their current state.
export const fetchStatus = async (url, fetchFn = fetch, timeoutMs = 5000) => {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetchFn(url, { signal: controller.signal, cache: "no-store" });
		if (!response.ok) return "unknown";
		const body = await response.json();
		if (typeof body?.active !== "boolean") return "unknown";
		return body.active ? "active" : "suspended";
	} catch {
		return "unknown";
	} finally {
		clearTimeout(timer);
	}
};

export const isSuspendedError = (error) =>
	error?.response?.status === 503 && error.response.data?.errorCode === "SYSTEM_SUSPENDED";

export const installSuspendInterceptor = (axios, onSuspended) => {
	const id = axios.interceptors.response.use(
		(response) => response,
		(error) => {
			if (isSuspendedError(error)) onSuspended();
			return Promise.reject(error);
		},
	);
	return () => axios.interceptors.response.eject(id);
};
