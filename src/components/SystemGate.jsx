"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";

import { fetchStatus, installSuspendInterceptor } from "@/lib/systemStatus.mjs";

const SYSTEM_STATUS_URL = `${process.env.NEXT_PUBLIC_API_LINK}/v1/api/system-status`;
const RECHECK_MS = 60 * 1000;
// useLayoutEffect warns during server rendering
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// The API enforces the lock; this only shows why nothing works. The session is left untouched.
const SystemGate = ({ children }) => {
	const t = useTranslations();
	const [suspended, setSuspended] = useState(false);

	const check = useCallback(async () => {
		const status = await fetchStatus(SYSTEM_STATUS_URL);
		if (status !== "unknown") setSuspended(status === "suspended");
	}, []);

	// A layout effect, because pages send their first requests from effects that run before a parent's useEffect
	useIsomorphicLayoutEffect(() => installSuspendInterceptor(axios, () => setSuspended(true)), []);

	useEffect(() => {
		check();
	}, [check]);

	useEffect(() => {
		if (!suspended) return undefined;
		const timer = setInterval(check, RECHECK_MS);
		return () => clearInterval(timer);
	}, [suspended, check]);

	if (!suspended) return children;

	return (
		<main className="flex flex-col items-center justify-center gap-3 h-dvh px-6 text-center" role="alert">
			<h1 className="text-xl font-semibold">{t("systemSuspendedTitle")}</h1>
			<p className="text-gray-500">{t("systemSuspendedBody")}</p>
			<button type="button" onClick={check} className="px-5 py-2 mt-3 border rounded-md">
				{t("systemSuspendedRetry")}
			</button>
		</main>
	);
};

export default SystemGate;
