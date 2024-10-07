import { createContext, useContext, useState } from 'react';

export interface AppContext {
	riskCalculatorOpen: boolean;
	setRiskCalculatorOpen: React.Dispatch<React.SetStateAction<boolean>>;
	mobileMenuOpen: boolean;
	setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
	fullscreenLoaderActive: boolean;
	setFullscreenLoaderActive: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContext | null>(null);

export function AppContextProvider({ children }: React.PropsWithChildren) {
	const [riskCalculatorOpen, setRiskCalculatorOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [fullscreenLoaderActive, setFullscreenLoaderActive] = useState(false);

	return (
		<AppContext.Provider
			value={{
				riskCalculatorOpen,
				setRiskCalculatorOpen,
				mobileMenuOpen,
				setMobileMenuOpen,
				fullscreenLoaderActive,
				setFullscreenLoaderActive
			}}
		>
			{children}
		</AppContext.Provider>
	);
}

export function useAppContext() {
	const context = useContext(AppContext);

	if (!context) {
		throw new Error('useAppContext must be used within an AppContextProvider');
	}

	return context;
}
