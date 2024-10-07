import { TRestApiUser, getCurrentUser, loginUser, logoutUser } from '@src/util/auth';
import { createContext, useCallback, useEffect, useState } from 'react';

export interface AuthContext {
	isInitialAuthCheck: boolean;
	isAuthenticated: boolean;
	login: (username: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	clearUserState: () => void;
	updateUser: (newValues: Partial<TRestApiUser>) => void;
	user: TRestApiUser | null;
}

export const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
	const [isInitialAuthCheck, setIsInitialAuthCheck] = useState(true);
	const [user, setUser] = useState<TRestApiUser | null>(null);
	const isAuthenticated = user !== null;

	const login = useCallback(async (username: string, password: string) => {
		const responseUser = await loginUser(username, password);

		setUser(responseUser);
	}, []);

	const logout = useCallback(async () => {
		await logoutUser();

		setUser(null);
	}, []);

	const clearUserState = useCallback(() => {
		setUser(null);
	}, []);

	const updateUser = useCallback((newValues: Partial<TRestApiUser>) => {
		setUser((curUser) => (curUser ? { ...curUser, ...newValues } : null));
	}, []);

	useEffect(() => {
		const checkCurrentUser = async () => {
			const curUser = await getCurrentUser();

			setIsInitialAuthCheck(false);
			setUser(curUser);
		};

		checkCurrentUser();
	}, []);

	return (
		<AuthContext.Provider
			value={{
				isInitialAuthCheck,
				isAuthenticated,
				user,
				login,
				logout,
				clearUserState,
				updateUser
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
