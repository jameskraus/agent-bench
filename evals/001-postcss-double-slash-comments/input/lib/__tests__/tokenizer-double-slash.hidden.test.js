/* eslint-disable no-useless-concat */
let tokenizer = require('../tokenizer');
let { Input } = require('postcss');

/**
 * @param {string} css
 * @param {import('../tokenizer').TokenizerOptions} [opts]
 */
function tokenize(css, opts) {
	let processor = tokenizer(new Input(css), opts);
	let tokens = [];

	while (!processor.endOfFile()) {
		tokens.push(processor.nextToken());
	}

	return tokens;
}

/**
 * @param {string} css
 * @param {Array<Array<string | number>>} tokens
 * @param {tokenizer.TokenizerOptions} [opts]
 */
function run(css, tokens, opts) {
	expect(tokenize(css, opts)).toEqual(tokens);
}

describe('double-slash comments', () => {
	test('tokenizes double-slash comment', () => {
		run('a//b\nc', [
			['word', 'a', 0, 0],
			['comment', '//b', 1, 3],
			['space', '\n'],
			['word', 'c', 5, 5],
		]);
	});

	test('tokenizes double-slash comment at end of file', () => {
		run('a//b', [
			['word', 'a', 0, 0],
			['comment', '//b', 1, 3],
		]);
	});

	test('tokenizes scheme-relative urls inside url()', () => {
		run('background: url(//cdn.example.com/image.png);', [
			['word', 'background', 0, 9],
			[':', ':', 10],
			['space', ' '],
			['word', 'url', 12, 14],
			['brackets', '(//cdn.example.com/image.png)', 15, 43],
			[';', ';', 44],
		]);
	});
});
