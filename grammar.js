/**
 * @file Volt programming language syntax highlighter
 * @author Yutsuna
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "volt",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
