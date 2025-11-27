let stringify = require('../stringify');
let parse = require('../parse');

let tests = [
	'let Component = styled.div`// hello\ncolor: red;`;',
	'let Component = styled.div`color: red; // hello\nborder: blue;`;',
	'let Component = styled.div`background-image: url(//cdn.example.com/image.png);`;',
];

/**
 * @param {string} css
 */
function run(css) {
	let root = parse(css);
	let output = '';

	stringify(root, (i) => {
		output += i;
	});

	expect(output).toBe(css);
}

describe('double-slash comments stringification', () => {
	test.each(tests)('%s', (componentCode) => {
		run(componentCode);
	});
});
