import path from 'path';
import fetch from 'isomorphic-unfetch';
import { JSDOM } from 'jsdom';
import writeJsonFile from 'write-json-file';

const references = [
	{
		url: 'https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix',
		transform: (document) => {
			let list = document.querySelectorAll('#css_prefixes + div li code');
			list = [...list].map((node) => node.textContent);
			return list;
		}
	},
	{
		url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions',
		transform: (document) => {
			let list = document.querySelectorAll('.main-page-content dt code');
			list = [...list]
				.map((node) => node.textContent)
				.map((name) => name.replace('()', ''));
			return list;
		}
	},
	{
		url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference',
		transform: (document) => {
			let list = document.querySelectorAll('#index + div .index li code');
			list = [...list]
				.map((node) => node.textContent)
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
	let results = [...new Set([].concat(...functions))].sort();
	results = [
		...results,
		...prefixes.map((prefix) => results.map((name) => `${prefix}${name}`))
	];
	results = [].concat(...results);
	const filename = new URL('index.json', import.meta.url).pathname;
	await writeJsonFile(filename, results);
	console.log('Done!');
}

main();
