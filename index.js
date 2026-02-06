// eslint-disable-next-line import/enforce-node-protocol-usage, unicorn/prefer-node-protocol
import { URL, fileURLToPath } from 'url';

/**
 * Path to CSS functions list JSON file.
 */
const location = fileURLToPath(new URL('index.json', import.meta.url));

export default location;
