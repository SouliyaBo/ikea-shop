import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

export default function SideModal({ side, component, title, children }) {
	return (
		<Sheet>
			<SheetTrigger>{component}</SheetTrigger>
			<SheetContent side={side}>
				<SheetHeader>
					<SheetTitle>{title}</SheetTitle>
					<SheetDescription>{children}</SheetDescription>
				</SheetHeader>
			</SheetContent>
		</Sheet>
	);
}
