import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// ทำให้เป็น utility function แทน component
const SweetAlert = ({ icon, title, text }) => {
	const MySwal = withReactContent(Swal);

	return MySwal.fire({
		icon: icon || "error",
		title: title || "Oops...",
		text: text || "Something went wrong!",
	});
};

export default SweetAlert;
