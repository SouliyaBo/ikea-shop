import test from "node:test";
import assert from "node:assert/strict";
import { fetchStatus, installSuspendInterceptor, isSuspendedError } from "./systemStatus.mjs";

const respond = (status, body) => async () => new Response(body, { status });
const suspended = { response: { status: 503, data: { error: true, errorCode: "SYSTEM_SUSPENDED", data: null } } };

test("fetchStatus reads active and suspended", async () => {
	assert.equal(await fetchStatus("http://x/s", respond(200, '{"active":true}')), "active");
	assert.equal(await fetchStatus("http://x/s", respond(200, '{"active":false}')), "suspended");
});

test("fetchStatus is unknown when the API cannot say", async () => {
	for (const f of [respond(404, '{"active":false}'), respond(503, "{}"), respond(200, "<html>"), respond(200, "null"), respond(200, "{}"), respond(200, '{"active":"no"}'), async () => { throw new Error("offline"); }])
		assert.equal(await fetchStatus("http://x/s", f), "unknown");
});

test("fetchStatus gives up on a hung request", async () => {
	const hang = (url, { signal }) => new Promise((_, reject) => signal.addEventListener("abort", () => reject(signal.reason)));
	assert.equal(await fetchStatus("http://x/s", hang, 20), "unknown");
});

test("only SYSTEM_SUSPENDED counts as suspended", () => {
	assert.equal(isSuspendedError(suspended), true);
	for (const e of [undefined, null, new Error("network"), { response: { status: 503, data: { errorCode: "SYSTEM_STATUS_UNAVAILABLE" } } },
		{ response: { status: 503, data: "<html>" } }, { response: { status: 503 } }, { response: { status: 400, data: { errorCode: "SYSTEM_SUSPENDED" } } }])
		assert.equal(isSuspendedError(e), false);
});

test("the interceptor reports suspension, still rejects, and can be removed", async () => {
	let onError, ejected;
	const axios = { interceptors: { response: { use: (_, f) => { onError = f; return 7; }, eject: (id) => { ejected = id; } } } };
	let calls = 0;
	const remove = installSuspendInterceptor(axios, () => calls++);
	await assert.rejects(onError(suspended), (e) => e === suspended);
	const other = new Error("x");
	await assert.rejects(onError(other), (e) => e === other);
	assert.equal(calls, 1);
	remove();
	assert.equal(ejected, 7);
});
