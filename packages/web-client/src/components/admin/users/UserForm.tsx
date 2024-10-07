import { Button, Checkbox, Divider, Fieldset, Group, Stack, TextInput } from '@mantine/core';
import AlertMessage from '@src/components/ui/AlertMessage';
import { IGqlUser, IGqlUserRoleType } from '@src/interfaces/IGqlResponses';

export interface IUserFormSubmitValues {
	username: string;
	displayName: string;
	roles: string[];
}

const UserForm: React.FC<{
	mode: 'create' | 'edit';
	submitButtonText: string;
	userRoleTypes: IGqlUserRoleType[];
	onSubmit: (values: IUserFormSubmitValues) => void;
	onCancel: () => void;
	errorMessage?: string;
	disabled?: boolean;
	user?: IGqlUser;
}> = ({
	mode,
	submitButtonText,
	userRoleTypes,
	onSubmit,
	onCancel,
	errorMessage = '',
	disabled = false,
	user = null
}) => {
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const fd = new FormData(e.currentTarget);

		const newRoles = Array.from(fd.entries()).reduce<string[]>((acum, [fieldName, value]) => {
			if (fieldName.startsWith('role__') && value.toString().toLowerCase() === 'on') {
				acum.push(fieldName.replace('role__', ''));
			}

			return acum;
		}, []);

		onSubmit({
			username: (fd.get('username') ?? '').toString().trim(),
			displayName: (fd.get('display_name') ?? '').toString().trim(),
			roles: newRoles
		});
	};

	return (
		<form onSubmit={handleSubmit} aria-disabled={disabled}>
			{errorMessage.length > 0 && (
				<AlertMessage type="error" mb="lg">
					{errorMessage}
				</AlertMessage>
			)}
			<Fieldset legend="Account" disabled={disabled}>
				<Stack>
					<TextInput
						name="username"
						label="Email"
						type="email"
						defaultValue={user?.username ?? ''}
						disabled={mode === 'edit'}
						required={mode === 'create'}
						{...(mode === 'create' ? { 'data-autofocus': '' } : {})}
					/>
					<TextInput
						name="display_name"
						label="Display Name"
						defaultValue={user?.displayName ?? ''}
						{...(mode === 'edit' ? { 'data-autofocus': '' } : {})}
					/>
				</Stack>
			</Fieldset>
			<Fieldset legend="Roles" mt="lg" disabled={disabled}>
				<Stack>
					{userRoleTypes.map((role) => (
						<Checkbox
							key={role.name}
							name={`role__${role.name}`}
							label={role.label}
							description={role.description}
							defaultChecked={(user?.roles ?? []).includes(role.name)}
						/>
					))}
				</Stack>
			</Fieldset>
			<Divider mt="lg" />
			<Group mt="md" justify="space-between">
				<Button variant="default" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" loading={disabled}>
					{submitButtonText}
				</Button>
			</Group>
		</form>
	);
};

export default UserForm;
