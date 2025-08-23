export default function currencyDisplay(price) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(price);
}

export function formatToCurrencyTHB(amount) {
	// Create a new Intl.NumberFormat object for USD currency formatting
	const formatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2, // Ensure 2 decimal places for cents
		maximumFractionDigits: 2,
	});

	// Format the number and return the formatted string
	return formatter.format(amount);
}
