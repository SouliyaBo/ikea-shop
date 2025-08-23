"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/navigation";
import Link from "next/link";

// Third Party
import axios from "axios";

// UI
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import DotSpinner from "@/components/DotSpinner";

// Icons
import { Check } from "lucide-react";

// Helpers
import { create } from "@/helpers";

export default function StoreRegisterStepThree() {
	const router = useRouter();

	const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));
	const registerData = JSON.parse(localStorage.getItem("storeRegisterStep1"));
	const ACCESS_TOKEN = USER_DATA.accessToken;

	const [formSubmitting, setFormSubmitting] = useState(false);
	const [error, setError] = useState("");

	const [termPolicies, setTermPolicies] = useState([
		{
			id: 1,
			accept: false,
			title: "ນະໂຍບາຍການສະໝັກສະມາຊິກ",
			href: "/term/register",
		},
		{
			id: 2,
			accept: false,
			title: "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວສຳລັບເວັບໄຊທ໌",
			href: "/term/privacy",
		},
		{
			id: 3,
			accept: false,
			title: "ເງື່ອນໄຂການສັ່ງຊື້ສິນຄ້າ",
			href: "/term/purchase",
		},
		{
			id: 4,
			accept: false,
			title: "ເງື່ອນໄຂການສະໝັກເປີດຮ້ານຄ້າ",
			href: "/term/store",
		},
	]);

	// Function
	const acceptAll = () => {
		if (!termPolicies.every((item) => item.accept)) {
			setTermPolicies(termPolicies.map((item) => ({ ...item, accept: true })));
		} else {
			setTermPolicies(
				termPolicies.map((item) => ({
					...item,
					accept: !item?.accept,
				})),
			);
		}
	};

	const toggleAccept = (id) => {
		setTermPolicies((prev) =>
			prev.map((item) =>
				item.id === id ? { ...item, accept: !item.accept } : item,
			),
		);
	};

	const handleCreateShop = () => {
		setError("");
		create(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/shop`,
			registerData,
			ACCESS_TOKEN,
			setFormSubmitting,
			(data) => {
				localStorage.setItem("shopData", JSON.stringify(data.data));
				router.push("/store-register/pending-review");
			},
			(error) => {
				setError("ມີບາງຢ່າງຜິດພາດ, ກະລຸນາລອງໃໝ່");
			},
		);
	};

	return (
		<main className="relative p-4 space-y-4 overflow-y-auto h-dvh">
			<div className="w-full text-center">
				<h1 className="text-2xl font-bold ">ຮ້ອງຂໍສະໝັກເປີດຮ້ານ</h1>
			</div>

			<div className="space-y-4 ">
				<section className="w-[80%] mx-auto flex-center">
					<div className="flex-col flex-center">
						<div className="w-10 h-10 font-bold text-white bg-red-400 rounded-full flex-center">
							<Check className="w-8 h-8" />
						</div>
						<p className="font-bold text-red-400">ຂໍ້ມູນຮ້ານ</p>
					</div>
					{/* <hr className="flex-1 h-2 text-gray-200 " />
					<div className="flex-col flex-center">
						<div className="w-10 h-10 font-bold text-white bg-red-400 rounded-full flex-center">
							<Check className="w-8 h-8" />
						</div>
						<p className="font-bold text-red-400">ຂໍ້ມູນສ່ວນຕົວ</p>
					</div> */}
					<hr className="flex-1 h-2 text-gray-200 " />
					<div className="flex-col flex-center">
						<div className="w-10 h-10 border border-gray-400 rounded-full flex-center">
							2
						</div>
						<p>ນະໂຍບາຍ</p>
					</div>
				</section>

				<section className="w-[80%] mx-auto space-y-4">
					<p>ກະລຸນາອ່ານ ແລະ ຍອມຮັບນະໂຍບາຍລຸ່ມນີ້ທັງໝົດ ເພື່ອດຳເນີນການເປີດຮ້ານໃຫ້ສຳເລັດ.</p>

					{termPolicies.map((item) => (
						<div key={item.id} className="flex gap-2">
							<Checkbox
								onCheckedChange={() => toggleAccept(item.id)}
								value={item.accept}
								checked={item.accept}
							/>
							<Link className="underline text-primary" href={item.href}>
								{item.title}
							</Link>
						</div>
					))}

					{!termPolicies.every((item) => item.accept) && (
						<div className="flex gap-2">
							<Checkbox
								onCheckedChange={() => acceptAll()}
								value={termPolicies.every((item) => item.accept)}
							/>
							<Label>ຍອມຮັບທັງໝົດ</Label>
						</div>
					)}
				</section>
			</div>
			<section className="absolute left-0 right-0 gap-4 w-[90%] mx-auto flex-center bottom-8">
				<Button
					type="button"
					variant="outline"
					className="w-full"
					onClick={() => router.back()}
				>
					ກັບຄືນ
				</Button>
				<Button
					type="button"
					className="w-full font-bold text-white"
					disabled={
						!termPolicies.every((item) => item.accept) || formSubmitting
					}
					onClick={handleCreateShop}
				>
					ດຳເນີນການຕໍ່ {formSubmitting && <DotSpinner />}
				</Button>
			</section>
		</main>
	);
}
