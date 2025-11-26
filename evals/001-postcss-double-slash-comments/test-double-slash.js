const tokenizer = require('./lib/tokenizer');
const { Input } = require('postcss');

// Test 1: Basic // comment
const css1 = `// This is a comment
.selector { color: red; }`;

const input1 = new Input(css1);
const tok1 = tokenizer(input1, {});

console.log('Test 1: Basic // comment');
const tokens1 = [];
while (!tok1.endOfFile()) {
  tokens1.push(tok1.nextToken());
}
console.log(tokens1);

// Test 2: // in URL should not be treated as comment
const css2 = `background: url(//cdn.example.com/image.png);`;
const input2 = new Input(css2);
const tok2 = tokenizer(input2, {});

console.log('\nTest 2: // in URL (should NOT be comment)');
const tokens2 = [];
while (!tok2.endOfFile()) {
  tokens2.push(tok2.nextToken());
}
console.log(tokens2);

// Test 3: // after colon (protocol)
const css3 = `http://example.com`;
const input3 = new Input(css3);
const tok3 = tokenizer(input3, {});

console.log('\nTest 3: // in protocol');
const tokens3 = [];
while (!tok3.endOfFile()) {
  tokens3.push(tok3.nextToken());
}
console.log(tokens3);
