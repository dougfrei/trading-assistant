import React from 'react';
import styles from './ChartLegend.module.css';

const ChartLegend: React.FC<{
	label: string;
	children?: React.ReactNode;
}> = ({ label, children }) => {
	return (
		<div className={styles.chartLegend}>
			{label}
			{children}
		</div>
	);
};

export default ChartLegend;
