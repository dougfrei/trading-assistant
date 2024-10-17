import eslint from '@eslint/js';
import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.strict,
	...tseslint.configs.stylistic,
	reactJsxRuntime,
	reactRecommended,
	{
		rules: {
			'react/prop-types': ['off'],
			'react/react-in-jsx-scope': ['off']
		},
		ignores: ['playwright-report/', '*.config.*']
	}
);
