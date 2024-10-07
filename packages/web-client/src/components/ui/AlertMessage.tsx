import { Alert, AlertProps, DefaultMantineColor } from '@mantine/core';

const AlertMessage: React.FC<
	React.PropsWithChildren<{ type: 'warning' | 'error' }> & AlertProps
> = ({ children, type, ...props }) => {
	const color: DefaultMantineColor = type === 'error' ? 'red' : 'yellow';
	const title = props.title ?? (type === 'error' ? 'Error' : '');

	return (
		<Alert color={color} title={title} {...props}>
			{children}
		</Alert>
	);
};

export default AlertMessage;
