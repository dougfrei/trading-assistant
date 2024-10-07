import styles from './FormControlsDisabledContainer.module.css';

const FormControlsDisabledContainer: React.FC<React.PropsWithChildren<{ disabled?: boolean }>> = ({
	disabled = false,
	children
}) => {
	return (
		<fieldset className={styles.fieldsetReset} disabled={disabled}>
			{children}
		</fieldset>
	);
};

export default FormControlsDisabledContainer;
