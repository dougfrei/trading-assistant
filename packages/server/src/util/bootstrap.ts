import { registerGraphQLEnums } from 'src/util/registerGraphQLEnums';

/**
 * Initialize bootstrap requirements for the application
 */
export async function initAppBootstrapRequirements() {
	registerGraphQLEnums();
}
