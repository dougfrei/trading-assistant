/**
 * Return an Intl.NumberFormat object configured to format numeric values in the
 * en-US locale with the USD currency style
 *
 * @param addOptions Optional Intl.NumberFormatOptions object
 * @returns Intl.NumberFormat object
 */
export function getCurrencyFormatter(addOptions: Intl.NumberFormatOptions = {}) {
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', ...addOptions });
}
