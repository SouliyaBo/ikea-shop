import PropTypes from "prop-types";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const AlertModal = ({
	triggerText,
	title,
	desc,
	confirmText,
	confirmFunction,
	component,
	open,
	defaultOpen = false,
	footer = true,
	disableConfirm = false,
}) => {
	return (
		<AlertDialog defaultOpen={defaultOpen} open={open}>
			{defaultOpen ? null : (
				<AlertDialogTrigger asChild>
					{!component ? (
						<Button variant="outline">{triggerText}</Button>
					) : (
						component
					)}
				</AlertDialogTrigger>
			)}
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{desc}</AlertDialogDescription>
				</AlertDialogHeader>
				{footer ? (
					<AlertDialogFooter>
						<AlertDialogCancel>ยกเลิก</AlertDialogCancel>
						<AlertDialogAction
							disabled={disableConfirm}
							onClick={confirmFunction}
							className="text-white"
						>
							{confirmText}
						</AlertDialogAction>
					</AlertDialogFooter>
				) : null}
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default AlertModal;

AlertModal.propTypes = {
	triggerText: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	desc: PropTypes.string.isRequired,
	component: PropTypes.node,
	confirmText: PropTypes.string.isRequired,
	confirmFunction: PropTypes.func.isRequired,
};
