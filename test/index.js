/* eslint-disable import/dynamic-import-chunkname */

import assert from 'assert';
import { promises as fs } from 'fs';
import function_ from '../index.js';

it('should export path to JSON file', async function () {
	assert.ok(function_.includes('index.json'));
});

it('should provide list of CSS functions', async function () {
	const result = JSON.parse(await fs.readFile(function_, 'utf8'));
	assert.ok(result.includes('translate3d'));
	assert.ok(result.includes('-webkit-rect'));
});
