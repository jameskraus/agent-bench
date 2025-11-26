let parse = require('../parse');

describe('double-slash comments parsing', () => {
	test('double-slash comment before declaration', () => {
		let document = parse('let Component = styled.div`\n\t// hello\n\tcolor: red;\n`;');

		expect(document.nodes).toHaveLength(1);

		let component = document.first;

		expect(component.nodes).toHaveLength(2);

		let [comment, decl] = component.nodes;

		expect(comment.type).toBe('comment');
		expect(comment.text).toBe('hello');

		expect(decl.prop).toBe('color');
		expect(decl.value).toBe('red');
	});

	test('double-slash comment after declaration', () => {
		let document = parse(
			'let Component = styled.div`color: red; // hello\nborder: blue;`;',
		);

		expect(document.nodes).toHaveLength(1);

		let component = document.first;

		expect(component.nodes).toHaveLength(3);

		let [, comment, decl] = component.nodes;

		expect(comment.type).toBe('comment');
		expect(comment.text).toBe('hello');

		expect(decl.prop).toBe('border');
		expect(decl.value).toBe('blue');
	});

	test('property value with scheme-relative url', () => {
		let document = parse(
			'let Component = styled.div`background-image: url(//cdn.example.com/image.png);`;',
		);

		expect(document.nodes).toHaveLength(1);
		expect(document.first.nodes).toHaveLength(1);

		let firstNode = document.first.first;

		expect(firstNode.prop).toBe('background-image');
		expect(firstNode.value).toBe('url(//cdn.example.com/image.png)');
	});
});
