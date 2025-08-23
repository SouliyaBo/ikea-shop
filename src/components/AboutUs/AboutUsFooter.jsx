import Link from "next/link";

export default function AboutUsFooter() {
	return (
		<footer className="w-full h-full border shadow-xl rounded-t-2xl text-primary-foreground flex-center">
			<div className="flex-col w-full text-sm flex-center">
				<h2 className="font-bold text-primary">ຂໍ້ມູນການຕິດຕໍ່</h2>
				<div>ເບີໂທ: +856 20 96 039 482</div>
				<Link
					className="underline text-primary"
					href="https://www.facebook.com/profile.php?id=100069284064372"
				>
					ບໍລິສັດ ຈັນທະລັກຮຸ່ງເຮືອງ ຂາເຂົ້າ-ຂາອອກ
				</Link>
				<div>ຖະໜົນເຈົ້າອານຸ, ບ້ານ ດົງປ່າແຫຼບ, ເມືອງຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ.</div>
			</div>
		</footer>
	);
}
