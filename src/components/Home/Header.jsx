"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "@/navigation";
import Image from "next/image";

// Third Party
import { usePathname } from "@/navigation";
import { useTranslations, useLocale } from "next-intl";

// UI
import { Search, Building2 } from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Components

export default function Header() {
	const [dataInput, setDataInput] = useState("");
	const router = useRouter();
	const t = useTranslations("");
	const locale = useLocale();
	const pathname = usePathname();

	const handleChangeLanguage = (e) => {
		// const locale = e.target.value;

		router.replace(pathname, { locale: e });
	};

	const renderFlag = () => {
		if (locale === "en") {
			return (
				<Image
					src="/images/us.png"
					fill
					className="object-cover w-full h-full"
					alt="flag"
					unoptimized
				/>
			);
		}
		if (locale === "th") {
			return (
				<Image
					src="/images/th.png"
					fill
					className="object-cover w-full h-full"
					alt="flag"
					unoptimized
				/>
			);
		}
		if (locale === "sv") {
			return (
				<Image
					src="/images/sv.png"
					fill
					className="object-cover w-full h-full"
					alt="Swedish flag"
					unoptimized
				/>
			);
		}
		if (locale === "ru") {
			return (
				<Image
					src="/images/ru.svg"
					fill
					className="object-cover w-full h-full"
					alt="Russian flag"
					unoptimized
				/>
			);
		}
		if (locale === "ja") {
			return (
				<Image
					src="/images/jp.png"
					fill
					className="object-cover w-full h-full"
					alt="Japanese flag"
					unoptimized
				/>
			);
		}
		if (locale === "zh") {
			return (
				<Image
					src="/images/ch.webp"
					fill
					className="object-cover w-full h-full"
					alt="Chinese flag"
					unoptimized
				/>
			);
		}
		return (
			<Image
				src="/images/la.png"
				fill
				className="object-cover w-full h-full"
				alt="flag"
				unoptimized
			/>
		);
	};

	return (
		<header className="flex-col w-full h-[60px] gap-4 px-4 py-2 flex-center rounded-b-2xl bg-white">
			<div className="flex items-center w-full space-x-2">
				<div className="w-[50px] h-[50px] relative overflow-hidden rounded-md ">
					<Image
						src={"/images/ikea.svg"}
						alt="banner"
						className="object-contain"
						fill
						unoptimized
					/>
				</div>
				<div className="input-search-container">
					<Search size={24} className="input-search-icon" />
					<input
						type="text"
						className="input-search"
						onChange={(event) => setDataInput(event.target.value)}
						placeholder={t("searchProduct")}
					/>
					<button
						className="btn-search"
						type="submit"
						onClick={() => router.replace(`/search-product/${dataInput}`)}
						disabled={!dataInput}
					>
						{t("search")}
					</button>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<div className="w-[30px] h-[24px] rounded-full overflow-hidden relative">
							{renderFlag()}
						</div>
					</DropdownMenuTrigger>
					<DropdownMenuContent
					// className="w-56"
					>
						<DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuRadioGroup
							value={locale}
							onValueChange={(e) => handleChangeLanguage(e)}
						>
							<DropdownMenuRadioItem value="th">🇹🇭 ไทย</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="en">🇺🇸 English</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="sv">🇸🇪 Svenska</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="ru">🇷🇺 Русский</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="ja">🇯🇵 日本語</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="zh">🇨🇳 中文</DropdownMenuRadioItem>
							{/* <DropdownMenuRadioItem value="la">🇱🇦 ລາວ</DropdownMenuRadioItem> */}
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
