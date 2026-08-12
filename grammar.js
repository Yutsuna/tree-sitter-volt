/**
 * @file Volt programming language syntax definition for tree-sitter
 * @author Yutsuna
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  ASSIGNMENT: 10,
  FAT_ARROW: 12,
  TERNARY: 15,
  RANGE: 20,
  OR: 30,
  AND: 35,
  EQUALITY: 40,
  PIPELINE: 45,
  RELATIONAL: 50,
  BITWISE_OR: 55,
  BITWISE_XOR: 56,
  BITWISE_AND: 57,
  SHIFT: 60,
  ADDITIVE: 70,
  MULTIPLICATIVE: 80,
  EXPONENTIAL: 90,
  UNARY: 100,
  POSTFIX: 110,
};

const commaSep = (rule) => seq(rule, repeat(seq(",", rule)));
const commaSep1 = (rule) => seq(rule, repeat(seq(",", rule)));

export default grammar({
  name: "volt",

  extras: ($) => [/[ \t]+/, $.comment, $.block_comment, $.doc_comment],

  conflicts: ($) => [
    [$._simple_expression, $.enum_variant_pattern],
    [$.enum_variant_pattern, $.call_expression],
    [$._type, $.generic_type],
    [$.hash_literal, $.block_expression],
    [$.method_declaration],
    [$._type, $.qualified_type],
    [$.enum_entry, $._simple_expression],
    [$.field_declaration, $._simple_expression],
    [$.field_declaration, $.variable_declaration],
    [$.section_expression],
    [$.parameter, $._simple_expression],
    [$.parameter, $.section_expression],
    [$.parenthesized_expression, $.section_expression],
    [$._type, $._simple_expression],
    [$.qualified_type, $._simple_expression],
    [$.generic_type, $._simple_expression],
    [$._type, $.self_expression],
    [$._type, $.parameter, $._simple_expression],
    [$.case_expression],
  ],

  rules: {
    source_file: ($) => repeat(choice($._statement, $._terminator)),

    _terminator: ($) => choice("\n", ";", "\r\n"),

    comment: ($) => /#[^\n]*/,
    block_comment: ($) => token(seq("#{", repeat(choice(/[^#]/, seq("#", /[^}]/))), "#}")),
    doc_comment: ($) => /##.*/,

    // Identifiers & Words
    _identifier_word: ($) => /[a-z_][a-zA-Z0-9_]*/,
    identifier: ($) => /[a-z_][a-zA-Z0-9_]*[!?!]?/,
    type_identifier: ($) => /[A-Z][a-zA-Z0-9_]*/,
    instance_variable: ($) => /@[a-z_][a-zA-Z0-9_]*/,

    symbol_literal: ($) => /:[a-zA-Z_][a-zA-Z0-9_]*[?!]?/,

    // Literals
    integer_literal: ($) =>
      choice(
        /0x[0-9a-fA-F_]+(_?[a-zA-Z0-9]+)?/,
        /0b[01_]+(_?[a-zA-Z0-9]+)?/,
        /0o[0-7_]+(_?[a-zA-Z0-9]+)?/,
        /[0-9][0-9_]*(_?[a-zA-Z0-9]+)?/,
      ),

    float_literal: ($) => /[0-9][0-9_]*\.[0-9][0-9_]*([eE][+-]?[0-9_]+)?/,
    boolean_literal: ($) => choice("true", "false"),
    nil_literal: ($) => "nil",

    string_literal: ($) =>
      token(
        seq(
          '"',
          repeat(
            choice(
              /[^"\\#]+/,
              /#+[^{"\\#]/,
              /\\./,
              seq("#{", /[^}\n]+/, "}"),
            ),
          ),
          '"',
        ),
      ),

    char_literal: ($) => /'([^'\\]|\\.)'/,

    macro_interpolation: ($) => seq("#{", $.expression, "}"),

    // Types
    _type: ($) =>
      choice(
        $.type_identifier,
        $.identifier,
        $.qualified_type,
        $.generic_type,
        $.pointer_type,
        $.nilable_type,
        $.fixed_array_type,
        $.function_type,
        $.parenthesized_type,
        "self",
      ),

    qualified_type: ($) =>
      seq(field("namespace", $.type_identifier), "::", field("name", $.type_identifier)),

    generic_type: ($) =>
      seq(
        field("name", choice($.type_identifier, $.qualified_type)),
        "<",
        commaSep1($._type),
        ">",
      ),

    pointer_type: ($) => prec.left(PREC.UNARY, seq($._type, "*")),
    nilable_type: ($) => prec.left(PREC.UNARY, seq($._type, "?")),
    fixed_array_type: ($) =>
      prec.left(PREC.POSTFIX, seq($._type, "[", $.expression, "]")),

    function_type: ($) =>
      prec.right(
        PREC.UNARY,
        seq(
          choice(
            seq("(", optional(commaSep($._type)), ")"),
            $._type,
          ),
          "->",
          field("return_type", $._type),
        ),
      ),

    parenthesized_type: ($) => seq("(", $._type, ")"),

    // Declarations
    _declaration: ($) =>
      choice(
        $.module_declaration,
        $.class_declaration,
        $.struct_declaration,
        $.enum_declaration,
        $.mixin_declaration,
        $.method_declaration,
        $.field_declaration,
        $.macro_declaration,
        $.include_declaration,
        $.component_declaration,
        $.circuit_declaration,
        $.annotation,
      ),

    generic_parameters: ($) => seq("<", commaSep1(choice($.type_identifier, $.identifier)), ">"),

    module_declaration: ($) =>
      seq(
        "module",
        field("name", $.type_identifier),
        $._terminator,
        repeat(seq(optional($._statement), $._terminator)),
        "end",
      ),

    class_declaration: ($) =>
      seq(
        "class",
        field("name", $.type_identifier),
        optional($.generic_parameters),
        optional(seq("<", field("superclass", $._type))),
        $._terminator,
        repeat(seq(optional($._statement), $._terminator)),
        "end",
      ),

    struct_declaration: ($) =>
      seq(
        "struct",
        field("name", $.type_identifier),
        optional($.generic_parameters),
        $._terminator,
        repeat(seq(optional($._statement), $._terminator)),
        "end",
      ),

    enum_declaration: ($) =>
      seq(
        "enum",
        field("name", $.type_identifier),
        optional($.generic_parameters),
        optional(seq(":", field("underlying", $._type))),
        $._terminator,
        repeat(seq(optional(choice($.enum_entry, $._statement)), $._terminator)),
        "end",
      ),

    enum_entry: ($) =>
      seq(
        field("name", $.type_identifier),
        optional(seq("(", optional($.parameter_list), ")")),
        optional(seq("=", field("value", $.expression))),
      ),

    mixin_declaration: ($) =>
      seq(
        "mixin",
        field("name", $.type_identifier),
        optional($.generic_parameters),
        $._terminator,
        repeat(seq(optional($._statement), $._terminator)),
        "end",
      ),

    operator_name: ($) =>
      choice(
        "[]", "[]=", "<=>", "!", "+", "-", "*", "/", "%", "===", "==", "!=",
        "<", ">", "<=", ">=", "<<", ">>", "&", "|", "^", "~", "and", "or", "not",
      ),

    method_declaration: ($) =>
      seq(
        optional(choice("abstract", "external")),
        "def",
        optional("self."),
        field("name", choice($.identifier, $.type_identifier, $.operator_name, seq($.identifier, "="))),
        optional($.generic_parameters),
        optional(
          choice(
            seq("(", optional($.parameter_list), ")"),
            $.parameter_list,
          ),
        ),
        optional(seq("->", field("return_type", $._type))),
        optional(
          seq(
            $._terminator,
            repeat(seq(optional($._statement), $._terminator)),
            repeat($.rescue_clause),
            optional($.ensure_clause),
            "end",
          ),
        ),
      ),

    field_declaration: ($) =>
      seq(
        optional(choice("getter", "property", "setter")),
        field("name", $.identifier),
        optional(seq(":", field("type", $._type))),
        optional(seq("=", field("value", $.expression))),
      ),

    macro_declaration: ($) =>
      seq(
        "macro",
        "def",
        field("name", $.identifier),
        optional(seq("(", optional($.parameter_list), ")")),
        $._terminator,
        repeat(choice(/.[^\n]*/, $._terminator)),
        "end",
      ),

    include_declaration: ($) => seq("include", $._type),

    component_declaration: ($) =>
      seq(
        "component",
        field("name", $.type_identifier),
        $._terminator,
        repeat(seq(optional($._statement), $._terminator)),
        "end",
      ),

    circuit_declaration: ($) =>
      seq(
        "circuit",
        field("name", $.string_literal),
        "{",
        repeat(
          seq(
            choice(
              $._statement,
              seq("runtime", $.string_literal),
              seq("entrypoint", $.string_literal),
              seq("modules", "(", optional(commaSep(seq($.string_literal, "=>", $.string_literal))), ")"),
            ),
            $._terminator,
          ),
        ),
        "}",
      ),

    annotation: ($) =>
      seq(
        "@[",
        commaSep1(
          seq(
            field("name", choice($.identifier, $.type_identifier)),
            optional(seq("(", optional(commaSep($.expression)), ")")),
          ),
        ),
        "]",
      ),

    parameter_list: ($) => commaSep1($.parameter),

    parameter: ($) =>
      seq(
        optional("&"),
        field("name", choice($.identifier, $.type_identifier, $.instance_variable)),
        optional(seq(":", field("type", $._type))),
        optional(seq("=", field("default", $.expression))),
      ),

    // Statements
    _statement: ($) =>
      choice(
        $._declaration,
        $.variable_declaration,
        $.conditional_statement,
        $.while_statement,
        $.until_statement,
        $.for_statement,
        $.return_statement,
        $.break_statement,
        $.next_statement,
        $.expression_statement,
      ),

    expression_statement: ($) => $.expression,

    variable_declaration: ($) =>
      seq(
        field("name", $.identifier),
        ":",
        field("type", $._type),
        optional(seq("=", field("value", $.expression))),
      ),

    inline_modifier: ($) =>
      seq(choice("if", "unless", "until"), field("condition", $.expression)),

    return_statement: ($) =>
      prec.left(seq("return", optional($.expression), optional($.inline_modifier))),

    break_statement: ($) =>
      prec.left(seq("break", optional($.expression), optional($.inline_modifier))),

    next_statement: ($) =>
      prec.left(seq("next", optional($.expression), optional($.inline_modifier))),

    conditional_statement: ($) =>
      seq(
        choice("if", "unless"),
        field("condition", $.expression),
        $._terminator,
        repeat(seq(optional($._statement), $._terminator)),
        repeat($.elsif_clause),
        optional($.else_clause),
        "end",
      ),

    elsif_clause: ($) =>
      seq(
        "elsif",
        field("condition", $.expression),
        $._terminator,
        repeat(seq(optional($._statement), $._terminator)),
      ),

    else_clause: ($) =>
      seq("else", $._terminator, repeat(seq(optional($._statement), $._terminator))),

    while_statement: ($) =>
      seq(
        "while",
        field("condition", $.expression),
        $._terminator,
        repeat(seq(optional($._statement), $._terminator)),
        "end",
      ),

    until_statement: ($) =>
      seq(
        "until",
        field("condition", $.expression),
        $._terminator,
        repeat(seq(optional($._statement), $._terminator)),
        "end",
      ),

    for_statement: ($) =>
      seq(
        "for",
        commaSep1($.identifier),
        "in",
        field("iterable", $.expression),
        $._terminator,
        repeat(seq(optional($._statement), $._terminator)),
        "end",
      ),

    // Expressions
    expression: ($) => $._simple_expression,

    _simple_expression: ($) =>
      choice(
        $.identifier,
        $.type_identifier,
        $.instance_variable,
        $.integer_literal,
        $.float_literal,
        $.boolean_literal,
        $.nil_literal,
        $.string_literal,
        $.char_literal,
        $.symbol_literal,
        $.self_expression,
        $.super_expression,
        $.parenthesized_expression,
        $.array_literal,
        $.hash_literal,
        $.block_expression,
        $.binary_expression,
        $.unary_expression,
        $.assignment,
        $.call_expression,
        $.member_expression,
        $.index_expression,
        $.conditional_expression,
        $.case_expression,
        $.begin_expression,
        $.raise_expression,
        // $.sizeof_expression,
        $.compile_time_expression,
        $.section_expression,
        $.dot_call_expression,
        $.jsx_element,
      ),

    self_expression: ($) => "self",
    super_expression: ($) => "super",

    parenthesized_expression: ($) => seq("(", optional(commaSep1(choice($.parameter, $.expression))), ")"),

    array_literal: ($) =>
      seq("[", optional(commaSep1($.expression)), "]", optional(seq("of", $._type))),

    hash_pair: ($) =>
      seq(field("key", $.expression), "=>", field("value", $.expression)),

    hash_literal: ($) =>
      seq(
        "{",
        optional(commaSep1($.hash_pair)),
        "}",
        optional(seq("of", $._type, "=>", $._type)),
      ),

    block_expression: ($) =>
      seq("{", repeat(seq(optional($._statement), $._terminator)), "}"),

    block_argument: ($) =>
      seq(
        choice(
          seq(
            "do",
            optional(seq("|", commaSep1($.parameter), "|")),
            repeat(seq(choice($._statement, $._terminator))),
            "end",
          ),
          seq(
            "{",
            optional(seq("|", commaSep1($.parameter), "|")),
            repeat(seq(choice($._statement, $._terminator))),
            "}",
          ),
        ),
      ),

    binary_expression: ($) =>
      choice(
        prec.left(PREC.ASSIGNMENT, seq($.expression, "=", $.expression)),
        prec.left(PREC.FAT_ARROW, seq($.expression, "=>", $.expression)),
        prec.right(PREC.TERNARY, seq($.expression, "?", $.expression, ":", $.expression)),
        prec.left(PREC.RANGE, seq($.expression, choice("..", "..."), $.expression)),
        prec.left(PREC.OR, seq($.expression, choice("||", "or"), $.expression)),
        prec.left(PREC.AND, seq($.expression, choice("&&", "and"), $.expression)),
        prec.left(PREC.EQUALITY, seq($.expression, choice("==", "!=", "<=>", "==="), $.expression)),
        prec.left(PREC.PIPELINE, seq($.expression, "|>", $.expression)),
        prec.right(PREC.PIPELINE, seq($.expression, "<|", $.expression)),
        prec.left(PREC.RELATIONAL, seq($.expression, choice("<", ">", "<=", ">="), $.expression)),
        prec.left(PREC.BITWISE_OR, seq($.expression, "|", $.expression)),
        prec.left(PREC.BITWISE_XOR, seq($.expression, "^", $.expression)),
        prec.left(PREC.BITWISE_AND, seq($.expression, "&", $.expression)),
        prec.left(PREC.SHIFT, seq($.expression, choice("<<", ">>"), $.expression)),
        prec.left(PREC.ADDITIVE, seq($.expression, choice("+", "-"), $.expression)),
        prec.left(PREC.MULTIPLICATIVE, seq($.expression, choice("*", "/", "%"), $.expression)),
        prec.right(PREC.EXPONENTIAL, seq($.expression, "**", $.expression)),
      ),

    unary_expression: ($) =>
      prec(
        PREC.UNARY,
        seq(
          choice("-", "+", "!", "~", "not", "*"),
          $.expression,
        ),
      ),

    assignment: ($) =>
      prec.right(
        PREC.ASSIGNMENT,
        seq(
          field("target", choice($.identifier, $.instance_variable, $.member_expression, $.index_expression)),
          choice("=", "+=", "-=", "*=", "/=", "%=", "**=", "&=", "|=", "^=", "<<=", ">>="),
          field("value", $.expression),
        ),
      ),

    call_expression: ($) =>
      prec.left(
        PREC.POSTFIX,
        seq(
          field("callee", $.expression),
          choice(
            seq("(", optional(commaSep1(choice($.named_argument, $.expression))), ")", optional($.block_argument)),
            $.block_argument,
          ),
        ),
      ),

    named_argument: ($) =>
      seq(field("name", $.identifier), ":", field("value", $.expression)),

    member_expression: ($) =>
      prec.left(
        PREC.POSTFIX,
        seq(
          field("object", $.expression),
          choice(".", "::"),
          field("property", choice($.identifier, $.type_identifier)),
        ),
      ),

    index_expression: ($) =>
      prec.left(
        PREC.POSTFIX,
        seq(field("object", $.expression), "[", commaSep1($.expression), "]"),
      ),

    conditional_expression: ($) =>
      prec.right(
        PREC.TERNARY,
        seq(
          "if",
          field("condition", $.expression),
          "then",
          field("consequence", $.expression),
          "else",
          field("alternative", $.expression),
        ),
      ),

    when_pattern: ($) => commaSep1($.expression),

    case_expression: ($) =>
      seq(
        "case",
        optional(field("value", $.expression)),
        $._terminator,
        repeat1(
          seq(
            "when",
            $.when_pattern,
            choice(
              seq("then", optional($._terminator), repeat(seq(optional($._statement), $._terminator))),
              seq($._terminator, repeat(seq(optional($._statement), $._terminator))),
            ),
          ),
        ),
        optional(seq("else", repeat(seq(choice($._statement, $._terminator))))),
        "end",
      ),

    begin_expression: ($) =>
      seq(
        "begin",
        $._terminator,
        repeat(seq(optional($._statement), $._terminator)),
        repeat($.rescue_clause),
        optional($.ensure_clause),
        "end",
      ),

    rescue_clause: ($) =>
      seq(
        "rescue",
        optional(field("variable", $.identifier)),
        optional(seq(":", field("type", $._type))),
        $._terminator,
        repeat(seq(optional($._statement), $._terminator)),
      ),

    ensure_clause: ($) =>
      seq("ensure", $._terminator, repeat(seq(optional($._statement), $._terminator))),

    raise_expression: ($) => prec.left(seq("raise", optional($.expression))),

    //sizeof_expression: ($) => seq("sizeof", "(", $._type, ")"),
    // "sizeof"
    // "trivially_destructible?"
    // "trivially_copyable?"
    // all of these are compile-time expressions, so they should be parsed as a special kind of expression
    // they all follow the same rule: seq( <expr>, ( type ))
    compile_time_expression: ($) =>
      prec.left(
        PREC.POSTFIX,
        seq(
          choice("sizeof", "trivially_destructible?", "trivially_copyable?"),
          "(",
          $._type,
          ")",
        ),
      ),


    section_expression: ($) =>
      choice(
        seq(
          "&.",
          choice($.identifier, $.type_identifier, $.operator_name),
          optional(
            choice(
              seq("(", optional(commaSep1(choice($.named_argument, $.expression))), ")"),
              $.expression,
            ),
          ),
          optional(seq(".", "!")),
        ),
        seq("&", choice($.identifier, $.type_identifier, $.parenthesized_expression)),
      ),

    dot_call_expression: ($) =>
      prec.left(
        PREC.POSTFIX,
        seq(
          ".",
          field("method", choice($.identifier, $.type_identifier)),
          optional(seq("(", optional(commaSep1($.expression)), ")")),
        ),
      ),

    enum_variant_pattern: ($) =>
      seq(
        optional($.type_identifier),
        ".",
        field("variant", $.type_identifier),
        optional(seq("(", commaSep1($.identifier), ")")),
      ),

    jsx_element: ($) =>
      seq(
        "<",
        choice(
          seq(">", repeat($.jsx_child), "</>"),
          seq(
            field("tag", choice($.identifier, $.type_identifier)),
            repeat($.jsx_attribute),
            choice(
              "/>",
              seq(">", repeat($.jsx_child), "</", choice($.identifier, $.type_identifier), ">"),
            ),
          ),
        ),
      ),

    jsx_attribute: ($) =>
      seq(
        field("name", choice($.identifier, $.type_identifier)),
        optional(seq("=", field("value", choice($.string_literal, seq("{", $.expression, "}"))))),
      ),

    jsx_child: ($) =>
      choice(
        $.jsx_element,
        seq("{", $.expression, "}"),
        $.string_literal,
        $.identifier,
        $.integer_literal,
      ),
  },
});
