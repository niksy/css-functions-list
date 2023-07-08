/// <reference lib="dom" />

/* globals Document */
/* eslint-disable unicorn/prefer-spread */

import path from 'path';
import { URL } from 'url';
import fetch from 'isomorphic-unfetch';
import { JSDOM } from 'jsdom';
import writeJsonFile from 'write-json-file';

const references = [
	{
		url: 'https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix',
		transform: (/** @type {Document} */ document) => {
			const list = Array.from(
				document.querySelectorAll('#css_prefixes + div li code')
			).map((node) => node.textContent || '');
			return list;
		}
	},
	{
		url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions',
		transform: (/** @type {Document} */ document) => {
			const list = Array.from(
				document.querySelectorAll('.main-page-content dt code')
			)
				.map((node) => node.textContent || '')
				.map((name) => name.replace('()', ''));

			const additional = [];
			for (const name of list) {
				if (name.endsWith('X')) {
					additional.push(name.replace(/X$/, 'x'));
				} else if (name.endsWith('Y')) {
					additional.push(name.replace(/Y$/, 'y'));
				} else if (name.endsWith('Z')) {
					additional.push(name.replace(/Z$/, 'z'));
				}
			}

			return list.concat(additional);
		}
	},
	{
		url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference',
		transform: (/** @type {Document} */ document) => {
			const list = Array.from(
				document.querySelectorAll('#index + div .index li code')
			)
				.map((node) => node.textContent || '')
				.filter((name) => /^[^:]\S+\(\)$/.test(name))
				.map((name) => name.replace('()', ''));
			return list;
		}
	}
];

async function main() {
	const responses = await Promise.all(
		references.map(({ url }) => fetch(url))
	);
	const markups = await Promise.all(
		responses.map((response) => response.text())
	);
	const [prefixes, ...functions] = markups.map((markup, index) => {
		const {
			window: { document }
		} = new JSDOM(markup);
		return references[index].transform(document);
	});

	/** @type {string[]} */
	let results = [];
	results = [...new Set(results.concat(...functions))].sort();

	const combinedResults = [
		results,
		...prefixes.map((prefix) => results.map((name) => `${prefix}${name}`))
	];

	/** @type {string[]} */
	let flattenedResults = [];
	flattenedResults = flattenedResults.concat(...combinedResults);

	const filename = new URL('index.json', import.meta.url).pathname;
	await writeJsonFile(filename, flattenedResults);
	console.log('Done!');
}

main();
