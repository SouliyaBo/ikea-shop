"use client";
import { useState } from "react";
import { useRouter } from "@/navigation";

// Third Party
import { Formik } from "formik";

// UI
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";

// Icons
import { Check } from "lucide-react";

export default function StoreRegisterStepTwo() {
	const router = useRouter();
	const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));
	const userData = USER_DATA?.data;

	// Function
	const handleSubmit = (values) => {
		localStorage.setItem("storeRegisterStep2", JSON.stringify({ ...values }));

		// router.push("/store-register/pending-review");
		router.push("/store-register/step-three");
	};

	return (
		<main className="p-4 space-y-4 overflow-y-auto h-dvh">
			<div className="w-full text-center">
				<h1 className="text-2xl font-bold ">ຮ້ອງຂໍສະໝັກເປີດຮ້ານ</h1>
			</div>

			<Formik
				initialValues={{
					shopOwnerName: `${userData?.firstName} ${userData?.lastName}`,
					shopOwnerPhone: userData?.phone,
				}}
				onSubmit={(values) => handleSubmit(values)}
			>
				{({ handleChange, handleSubmit, values, errors }) => (
					<form className="space-y-4" onSubmit={handleSubmit}>
						<section className="w-[80%] mx-auto flex-center">
							<div className="flex-col flex-center">
								<div className="w-10 h-10 font-bold text-white bg-red-400 rounded-full flex-center">
									<Check className="w-8 h-8" />
								</div>
								<p className="font-bold text-red-400">ຂໍ້ມູນຮ້ານ</p>
							</div>
							<hr className="flex-1 h-2 text-gray-200 " />
							<div className="flex-col flex-center">
								<div className="w-10 h-10 font-bold text-white bg-red-400 rounded-full flex-center">
									2
								</div>
								<p className="font-bold text-red-400">ຂໍ້ມູນສ່ວນຕົວ</p>
							</div>
							<hr className="flex-1 h-2 text-gray-200 " />
							<div className="flex-col flex-center">
								<div className="w-10 h-10 border border-gray-400 rounded-full flex-center">
									3
								</div>
								<p>ນະໂຍບາຍ</p>
							</div>
						</section>

						<section className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="shopOwnerName">ຊື່ເຈົ້າຂອງຮ້ານ</Label>
								<Input
									id="shopOwnerName"
									name="shopOwnerName"
									type="text"
									onChange={handleChange}
									value={values.shopOwnerName}
									placeholder="ຊື່ເຈົ້າຂອງຮ້ານ..."
								/>
								{errors.shopOwnerName && <p>{errors.shopOwnerName}</p>}
							</div>
							<div className="space-y-2">
								<Label htmlFor="shopOwnerPhone">ເບີໂທເຈົ້າຂອງຮ້ານ</Label>
								<Input
									id="shopOwnerPhone"
									name="shopOwnerPhone"
									type="number"
									onChange={handleChange}
									value={values.shopOwnerPhone}
									placeholder="ເບີໂທເຈົ້າຂອງຮ້ານ..."
								/>
								{errors.shopOwnerPhone && <p>{errors.shopOwnerPhone}</p>}
							</div>
							{/* <div className="space-y-2">
								<Label htmlFor="storePhone">ລາຍລະອຽດຮ້ານ</Label>
								<Textarea
									id="storeDescription"
									name="storeDescription"
									type="number"
									onChange={handleChange}
									value={values.storeDescription}
									placeholder="ລາຍລະອຽດຮ້ານ..."
								/>
								{errors.storeDescription && <p>{errors.storeDescription}</p>}
							</div> */}
						</section>

						<section className="w-full gap-4 flex-center ">
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={() => router.back()}
							>
								ກັບຄືນ
							</Button>
							<Button type="submit" className="w-full font-bold text-white">
								ດຳເນີນການຕໍ່
							</Button>
						</section>
					</form>
				)}
			</Formik>
		</main>
	);
}
