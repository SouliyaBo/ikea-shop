import moment from "moment";

export default function DisplayDate(date) {
	return moment(date).format("DD/MM/YYYY HH:mm");
}
