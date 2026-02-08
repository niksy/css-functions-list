/// <reference lib="dom" />

/* globals Document */
/* eslint-disable unicorn/prefer-spread */

import { URL } from 'node:url';
import fetch from 'isomorphic-unfetch';
import { JSDOM } from 'jsdom';
import { writeJsonFile } from 'write-json-file';

const prefixes = ['-webkit-', '-moz-', '-o-', '-ms-'];
const excludes = ['jump-</code> keywords for <code>steps'];

/**
 * @param {object} object
 */
function getCompatFields(object) {
	const results = /** @type {{description?: string}[]}*/ ([]);

	/**
	 * @param {object} object_
	 */
	function searchForCompat(object_) {
		Object.entries(object_).forEach(([key, value]) => {
			if (key === '__compat') {
				results.push(value);
			} else if (typeof value === 'object' && value !== null) {
				searchForCompat(value);
			}
		});
	}

	searchForCompat(object);
	return results;
}

const references = [
	async () => {
		const response = await fetch(
			'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions'
		);
		const markup = await response.text();
		const {
			window: { document }
		} = new JSDOM(markup);
		const list = Array.from(document.querySelectorAll('.main-page-content dt code'))
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
	},
	async () => {
		const response = await fetch('https://developer.mozilla.org/en-US/docs/Web/CSS/Reference');
		const markup = await response.text();
		const {
			window: { document }
		} = new JSDOM(markup);
		const list = Array.from(document.querySelectorAll('#index + div .index li code'))
			.map((node) => node.textContent || '')
			.filter((name) => /^[^:]\S+\(\)$/.test(name))
			.map((name) => name.replace('()', ''));
		return list;
	},
	...[
		'-moz-image-rect.json',
		'abs.json',
		'acos.json',
		'anchor-size.json',
		'anchor.json',
		'angle-percentage.json',
		'angle.json',
		'asin.json',
		'atan.json',
		'atan2.json',
		'attr.json',
		'basic-shape.json',
		'blend-mode.json',
		'calc-keyword.json',
		'calc-size.json',
		'calc.json',
		'clamp.json',
		'color.json',
		'corner-shape-value.json',
		'cos.json',
		'counter.json',
		'counters.json',
		'dimension.json',
		'dynamic-range-limit-mix.json',
		'easing-function.json',
		'env.json',
		'exp.json',
		'filter-function.json',
		'flex.json',
		'global_keywords.json',
		'hypot.json',
		'image.json',
		'integer.json',
		'length-percentage.json',
		'length.json',
		'line-style.json',
		'log.json',
		'max.json',
		'min.json',
		'mod.json',
		'number.json',
		'overflow.json',
		'percentage.json',
		'position.json',
		'pow.json',
		'progress.json',
		'random.json',
		'ratio.json',
		'ray.json',
		'rem.json',
		'resolution.json',
		'round.json',
		'shape.json',
		'sibling-count.json',
		'sibling-index.json',
		'sign.json',
		'sin.json',
		'sqrt.json',
		'string.json',
		'superellipse.json',
		'tan.json',
		'text-edge.json',
		'time.json',
		'transform-function.json',
		'type.json',
		'url.json',
		'var.json'
	].map((compatResource) => {
		return async () => {
			const response = await fetch(
				`https://raw.githubusercontent.com/mdn/browser-compat-data/master/css/types/${compatResource}`
			);
			const json = await response.json();
			const fields = getCompatFields(json);
			const functions = /** @type {string[]} */ ([]);
			fields.forEach((field) => {
				const description = field?.description ?? '';
				const [, match] = description.match(
					new RegExp(`\`(?:${prefixes.join('|')})?([\\w\\d-]+)\\(\\)\``)
				) ?? [null, ''];
				if (match && !excludes.includes(match)) {
					functions.push(match);
				}
			});
			return functions;
		};
	}),
	// Experimental, legacy and removed functions
	() => {
		return [
			// https://www.webkit.org/blog/175/introducing-css-gradients/
			'-webkit-gradient',
			'color-stop',
			'from',
			'to',
			// https://drafts.csswg.org/css-values-5/#if-notation
			'if',
			'media',
			'style',
			'supports',
			// https://www.antenna.co.jp/AHF/help/en/ahf-css6.html#css3-functions
			'content',
			'running',
			'string',
			// https://developer.mozilla.org/en-US/docs/Web/CSS/font-palette/palette-mix
			'palette-mix',
			// https://web.archive.org/web/20221206074145/https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsla
			'hsla',
			// https://web.archive.org/web/20221222183535/https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/rgba
			'rgba',
			'annotation',
			'character-variant',
			'color-contrast',
			'conic-gradient',
			'device-cmyk',
			'fit-content',
			'format',
			'image',
			'layer',
			'leader',
			'linear-gradient',
			'local',
			'minmax',
			'ornaments',
			'radial-gradient',
			'repeat',
			'repeating-conic-gradient',
			'repeating-linear-gradient',
			'repeating-radial-gradient',
			'reversed',
			'rotatex',
			'rotatey',
			'rotatez',
			'scalex',
			'scaley',
			'scalez',
			'scroll',
			'selector',
			'skewx',
			'skewy',
			'styleset',
			'stylistic',
			'swash',
			'symbols',
			'target-counter',
			'target-counters',
			'target-text',
			'translatex',
			'translatey',
			'translatez',
			'view'
		].map((value) => value.replace(new RegExp(prefixes.join('|')), ''));
	}
];

async function main() {
	const functions = await Promise.all(references.map((reference) => reference()));

	/** @type {string[]} */
	let results = [];
	results = [...new Set(results.concat(...functions))].sort().filter((result) => {
		return !['<url>'].includes(result);
	});

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
