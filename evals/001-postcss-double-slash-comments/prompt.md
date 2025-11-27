Add support for double-slash (`//`) comments to the postcss-styled-syntax parser.

Currently, the parser only supports standard CSS block comments (`/* */`). You need to add support for single-line `//` comments that are commonly used in CSS-in-JS codebases.

## Requirements

1. The tokenizer should recognize `//` as the start of a comment that continues until the end of the line
2. The parser should handle these inline comments and create proper Comment nodes
3. The stringifier should output inline comments using `//` syntax (not wrapping them in `/* */`)
4. Important: `//` in scheme-relative URLs like `url(//cdn.example.com/image.png)` should NOT be treated as comments
