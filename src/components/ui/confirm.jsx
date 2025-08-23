import Link from "next/link";
import { IconPickerItem } from "react-icons-picker";
export default function Confirm({ setDisplay }) {
	return (
		<div className="absolute inset-0 top-0 z-20 w-full h-full border shadow-xl rounded-t-2xl text-primary-foreground flex-center">
			<div className="h-[100%] flex flex-col justify-center items-center w-full bg-white ">
				<div className="bg-background rounded-full w-[100px] h-[100px] flex justify-center items-center">
					<IconPickerItem value="TbMilk" size={24} className="text-primary" />
				</div>
				<div className="mt-12 text-2xl font-bold">ລ໋ອກອິນ ເພື່ອສັ່ງຊື້ສິນຄ້າ!</div>
				<div className="mt-4">
					ຈະສັ່ງສິນຄ້າຕ້ອງມີການລ໋ອກອິນກ່ອນເພື່ອໃຫ້ເຮົາຮູ້ສິນຄ້າຖືກສັ່ງຈາກໃຜ?
				</div>
				<button
					type="button"
					className=" bg-primary w-[60%] h-10 rounded-full p-2 mt-6 text-white relative"
				>
					<Link className="absolute inset-0 flex-center" href={"/login"}>
						ລ໋ອກອິນ
					</Link>
				</button>
				<button
					type="button"
					className="bg-primary w-[60%] rounded-full p-2 mt-6 text-white"
					onClick={() => setDisplay(null)}
				>
					ກັບຄືນ
				</button>
			</div>
		</div>
	);
}
