import { Button } from "@/components/ui/button";

import { useTranslations } from "next-intl";

export default function EditProfileFooter({ handleClick }) {
	const t = useTranslations("");
	return (
		<footer className="w-full h-full border shadow-xl rounded-t-2xl text-primary-foreground flex-center">
			<div className="flex justify-around w-full ">
				<Button
					className="w-[80%] rounded-full py-8 text-white"
					onClick={() => handleClick()}
				>
					{t("editProfile")}
				</Button>
			</div>
		</footer>
	);
}
