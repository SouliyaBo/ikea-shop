"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "@/navigation";

// Third Party
import { useTranslations } from "next-intl";

// Icons
import { ChevronLeft } from "lucide-react";

// UI
import { Button } from "@/components/ui/button";
import AlertSuccess from "@/components/ui/alertSuccess";
import DotSpinner from "@/components/DotSpinner";

// Constants and Helpers
import { DATA_REGISTER } from "@/constants";
import { create } from "@/helpers";

function VerifyOtp() {
	const router = useRouter();
	const t = useTranslations("");
	const [dataRegister, setDataRegister] = useState({});
	const [phone, setPhone] = useState("");
	const [code, setCode] = useState("");
	const [success, setSuccess] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const dataLocal = JSON.parse(localStorage.getItem(DATA_REGISTER));
		if (dataLocal) {
			setDataRegister(dataLocal);
			setPhone(dataLocal?.phone);
		}
	}, []);

	const handleGoBack = () => {
		router.back();
	};

	const handleRegister = (registerCode) => {
		create(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/auth/register`,
			{
				...dataRegister,
				registerCode: registerCode,
			},
			"",
			() => {},
			(data) => {
				localStorage.removeItem(DATA_REGISTER);
				router.push("/login");
			},
			(error) => {
				console.log("error:: ", error?.response?.data?.message);
			},
		);
	};

	const verifyOTP = () => {
		create(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/auth/verify-otp`,
			{
				phone: phone,
				code: code,
			},
			"",
			setLoading,
			(data) => {
				if (data?.error === false) {
					handleRegister(data?.data?.registerCode);
				}
			},
			(error) => {
				console.log("error:: ", error?.response?.data?.data?.message);
				if (error?.response?.data?.data?.message === "failed") {
					setErrorMessage("ລະຫັດຢືນຢັນບໍ່ຖືກຕ້ອງ");
				}
			},
		);
	};

	return (
		<div className="relative w-full h-screen p-6">
			{success === true ? <AlertSuccess /> : ""}
			<Button
				onClick={() => handleGoBack()}
				className=" w-[50px] h-[50px] rounded-full flex-center absolute text-white left-4 top-4"
			>
				<ChevronLeft size={38} />
			</Button>
			<div className="flex-center">
				<h1 className="text-xl font-semibold mt-[60px]">{t("verifyOtp")}</h1>
			</div>
			<div className="my-4">
				<input
					type="phone"
					onChange={(e) => setCode(e.target.value)}
					className={
						"appearance-none block w-full text-gray-700 border border-gray-300  rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
					}
					placeholder="XXXXXX"
					name="code"
				/>
			</div>

			{errorMessage && errorMessage !== "" ? (
				<p className="text-red-500">{errorMessage}</p>
			) : (
				""
			)}
			<br />
			<button
				onClick={() => verifyOTP()}
				className="w-full h-12 gap-4 px-6 font-semibold text-white rounded-md flex-center bg-primary disabled:bg-neutral-600"
				type="button"
				disabled={loading}
			>
				{t("continue")}
				{loading ? <DotSpinner /> : ""}
			</button>
		</div>
	);
}

export default VerifyOtp;
