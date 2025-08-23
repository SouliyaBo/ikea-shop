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
import { DATA_BANK_UPDATE, PHONE } from "@/constants";
import { create, update } from "@/helpers";

function VerifyOtp() {
	const router = useRouter();
	const t = useTranslations("");
	const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));

	const [dataLocal, setDataLocal] = useState({});
	const [dataUpdateBank, setDataUpdateBank] = useState({});
	const [phone, setPhone] = useState("");
	const [code, setCode] = useState("");
	const [success, setSuccess] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const dataLocal = JSON.parse(localStorage.getItem(DATA_BANK_UPDATE));
		const phoneLocal = localStorage.getItem(PHONE);
		if (dataLocal) {
			setDataLocal(dataLocal);
			setDataUpdateBank(dataLocal?.data);
			setPhone(phoneLocal);
		}
	}, []);

	const handleGoBack = () => {
		router.back();
	};

	const handleConfirm = async (verifyCode) => {
		await update(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user-bank/${dataLocal?.userBankId}`,
			{
				...dataUpdateBank,
				verifyCode: verifyCode,
			},
			USER_DATA.accessToken,
			setLoading,
			(data) => {
				localStorage.removeItem(DATA_BANK_UPDATE);
				localStorage.removeItem(PHONE);
				// customizeToast("success", "ແກ້ໄຂຂໍ້ມູນສຳເລັດ");
				router.push(`/profile/${dataLocal?.userId}`);
			},
			(error) => {
				console.log("error:", error);
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
					handleConfirm(data?.data?.registerCode);
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
			<div className="flex-center">
				<p className="text-md mt-[30px]">
					{t("sendingMessageTo")}: {phone}
				</p>
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
				{loading ? <DotSpinner /> : ""}
				{t("continue")}
			</button>
		</div>
	);
}

export default VerifyOtp;
