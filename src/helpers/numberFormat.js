export default function numberFormat(number) {
	return number !== undefined
		? number.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
		: 0;
}

export function formatNumber(num) {
	if (num >= 1e9) {
		return `${(num / 1e9).toFixed(1)}B`; // Billion
	}
	if (num >= 1e6) {
		return `${(num / 1e6).toFixed(1)}M`; // Million
	}
	if (num >= 1e3) {
		return `${(num / 1e3).toFixed(1)}K`; // Thousand
	}
	return num ? num.toString() : num; // Less than 1000
}
