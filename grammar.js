/**
 * @file Volt programming language syntax highlighter
 * @author Yutsuna
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

/**
 * private
 */

const OPERATORS = {
  identifiers: [
    "[]",
    "[]=",
    "<",
    "<=",
    ">",
    ">=",
    "==",
    "<=>",
    "+",
    "-",
    "*",
    "/",
    "%",
    "**",
    "//",
    "&&",
    "||",
    "&",
    "|",
    "^",
    "<<",
    ">>",
  ],

  binary_expressions: [
    "+",
    "-",
    "*",
    "/",
    "%",
    "**",
    "//",
    "==",
    "!=",
    "<",
    ">",
    "<=",
    ">=",
    "<=>",
    "&&",
    "||",
    "^",
    "<<",
    ">>",
    "&",
    "|",
  ],
};

const PREC = {
  ASSIGNMENT: 0,
  CALL_NO_PARENS: 1,
  CONDITIONAL: 2,
  INLINE_CONDITIONAL: 2,
  OR: 3,
  AND: 4,
  COMPARE: 5,
  RELATIONAL: 6,
  BITWISE_OR: 7,
  BITWISE_AND: 8,
  SHIFT: 9,
  ADDITIVE: 10,
  MULTIPLICATIVE: 11,
  EXPONENTIAL: 12,
  UNARY: 13,
  MEMBER: 14,
};

//@ts-ignore
const __comma_sep = (rule) => seq(rule, repeat(seq(",", rule)));
//@ts-ignore
const __comma_sep1 = (rule) => seq(rule, repeat(seq(",", rule)), optional(","));

/**
 * public
 */

export default grammar({
  name: "volt",

  /** #{...}# | # */
  extras: ($) => [/[ \t]+/, $.comment, $.doc_comment],

  word: ($) => $.identifier,

  conflicts: ($) => [
    [$.expression, $.variable_declaration],
    [$.class_definition, $.include_statement],
    [$.struct_definition, $.include_statement],
    [$._type, $.generic_type, $.expression],
    [$._type, $.generic_type],
    [$.expression, $.assignment_left_hand_side],
    [$._simple_expression, $.assignment_left_hand_side],
    [$.parameter, $.instance_variable],
    [$._type, $.expression],
    [$._type, $._simple_expression],
    [$.generic_type, $.expression],
    [$.parameter, $.variable_declaration],
    [$._simple_expression, $.variable_declaration],
    [$.variable_declaration],
    [$.conditional_expression, $.inline_modifier],
    [$.conditional_expression, $.inline_modifier, $.typeof_expression],
    [$.conditional_expression, $.inline_modifier, $.return_expression],
    [$.conditional_expression, $.inline_modifier, $.yield_expression],
    [$.yield_expression, $.inline_modifier],
    [$.block_argument, $.hash_literal],
    [$.inline_modifier],
    [$.inline_modifier, $.conditional_statement],
    [$.inline_modifier, $.call_expression],
    [$.unary_expression, $.conditional_expression, $.inline_modifier],
    [$.raise_expression, $.conditional_expression, $.inline_modifier],
    [$.binary_expression, $.conditional_expression, $.inline_modifier],
    [$.inline_modifier, $.typeof_expression],
    [$.inline_modifier, $.variable_declaration],
    [$.conditional_expression, $.inline_modifier, $.assignment],
    [$.conditional_expression, $.inline_modifier, $.variable_declaration],
    [$.expression, $.symbol_literal],
    [$._simple_expression, $.symbol_literal],
    [$.ternary_expression, $.symbol_literal],
    [$.ternary_expression, $.call_expression],
    [$.symbol_literal, $.assignment_left_hand_side],
    [$.conditional_expression, $.inline_modifier, $.call_expression],
    [$.call_expression, $.parenthesized_expression],
    [$._simple_expression, $.call_expression],
    [$.call_expression, $.typeof_expression],
    [$.call_expression],
    [$.variable_declaration, $.call_expression],
    [$.expression, $.call_expression],
    [$._type, $.scoped_type_identifier],
    [$._simple_expression, $.scoped_identifier],
    [$._simple_expression, $.scoped_type_identifier],
    [$.scoped_type_identifier, $.scoped_identifier],
    [$.hash_pair, $.named_argument],
    [$.call_expression, $.generic_type],
    [$.call_expression, $.scoped_identifier],
    [$.parameter],
    [$.member_declaration, $.variable_declaration],
    [$._type, $.assignment_left_hand_side],
    [$.inline_modifier, $.named_argument],
    [$.inline_modifier, $.hash_pair],
    [$.inline_modifier, $.named_argument, $.hash_pair],
    [$._type, $._simple_expression, $.assignment_left_hand_side],
    [$._simple_expression, $.variable_declaration, $.named_argument],
    [$._simple_expression, $.variable_declaration, $.named_argument, $.hash_pair],
    [$._type, $._simple_expression, $.call_expression],
    [$._type, $._simple_expression, $.variable_declaration],
    [$._simple_expression, $.generic_type],
    [$._statement, $.else_clause],
    [$.macro_interpolation],
  ],

  rules: {
    /** entry point of every file */
    source_file: ($) => seq(optional($._terminator), optional($.definitions)),

    /** top level definitions */
    _definition: ($) =>
      choice(
        $.class_definition,
        $.struct_definition,
        $.module_definition,
        $.mixin_definition,
        $.method_definition,
        $.abstract_method_definition,
        $.macro_definition,
        $.component_definition,
        $.circuit_definition,
        $.include_statement,
        $.member_declaration,
        $._statement,
      ),

    _terminator: ($) => repeat1(choice("\n", "\r\n", ";")),

    definitions: ($) =>
      seq(
        $._definition,
        repeat(seq($._terminator, $._definition)),
        optional($._terminator),
      ),

    _statement: ($) =>
      choice(
        $.expression,
        $.conditional_statement,
        $.for_statement,
      ),

    block: ($) =>
      seq(
        $._statement,
        repeat(seq($._terminator, $._statement)),
        optional($._terminator),
      ),

    /** class Name ... end */
    class_definition: ($) =>
      seq(
        "class",
        field("name", choice($.scoped_type_identifier, $.type_identifier)),
        optional($.type_parameter_list),
        optional(seq("<", field("superclass", choice($.scoped_type_identifier, $.type_identifier)))),
        optional(seq("include", choice($.scoped_type_identifier, $.type_identifier))),
        choice(seq($._terminator, optional($.definitions), "end"), "end"),
      ),

    /** struct Name ... end */
    struct_definition: ($) =>
      seq(
        "struct",
        field("name", choice($.scoped_type_identifier, $.type_identifier)),
        optional($.type_parameter_list),
        optional(seq("<", field("superclass", choice($.scoped_type_identifier, $.type_identifier)))),
        optional(seq("include", choice($.scoped_type_identifier, $.type_identifier))),
        choice(seq($._terminator, optional($.definitions), "end"), "end"),
      ),

    /** module Name ... end */
    module_definition: ($) =>
      seq(
        "module",
        field("name", choice($.scoped_type_identifier, $.type_identifier)),
        optional($.type_parameter_list),
        choice(seq($._terminator, optional($.definitions), "end"), "end"),
      ),

    /** mixin Name ... end */
    mixin_definition: ($) =>
      seq(
        "mixin",
        field("name", choice($.scoped_type_identifier, $.type_identifier)),
        optional($.type_parameter_list),
        choice(seq($._terminator, optional($.definitions), "end"), "end"),
      ),

    /** circuit "Name" { ... } */
    circuit_definition: ($) =>
      seq(
        "circuit",
        field("name", $.string),
        optional($._terminator),
        seq(
          "{",
          optional($._terminator),
          optional($.definitions),
          "}",
        ),
      ),

    /** component Name(...) ... end */
    component_definition: ($) =>
      seq(
        "component",
        field("name", $.type_identifier),
        optional($.parameter_list),
        choice(seq($._terminator, optional($.definitions), "end"), "end"),
      ),

    /** macro def name(...) ... end */
    macro_definition: ($) =>
      seq(
        "macro",
        "def",
        field(
          "name",
          choice(
            $.macro_interpolation,
            $.identifier,
            seq("self.", choice($.macro_interpolation, $.identifier)),
            $.operator_identifier,
          ),
        ),
        optional($.parameter_list),
        choice(seq($._terminator, optional($.definitions), "end"), "end"),
      ),

    /** def name( ... ) -> Type ... end */
    method_definition: ($) =>
      seq(
        optional($.visibility_modifier),
        "def",
        field(
          "name",
          choice(
            $.macro_interpolation,
            $.identifier,
            seq("self.", choice($.macro_interpolation, $.identifier)),
            $.operator_identifier,
          ),
        ),
        optional($.parameter_list),
        optional(seq("->", field("return_type", $._type))),
        choice(seq($._terminator, optional($.block), "end"), "end"),
      ),

    /** abstract def name( ... ) -> Type */
    abstract_method_definition: ($) =>
      seq(
        optional($.visibility_modifier),
        "abstract",
        "def",
        field("name", choice($.identifier, $.macro_interpolation, $.operator_identifier)),
        optional($.parameter_list),
        optional(seq("->", field("return_type", $._type))),
      ),

    /** include Name */
    include_statement: ($) => seq("include", choice($.scoped_type_identifier, $.type_identifier)),

    /** getter size : Int */
    member_declaration: ($) =>
      seq(
        optional($.visibility_modifier),
        optional(choice("getter", "setter", "property")),
        field("name", $.identifier),
        ":",
        field("type", $._type),
        optional(seq("=", $.expression)),
      ),

    /** private | protected | public */
    visibility_modifier: ($) => choice("private", "protected", "public"),

    /** [ T, U ] */
    type_parameter_list: ($) => seq("[", __comma_sep1(choice($.scoped_type_identifier, $.type_identifier)), "]"),

    /** ( ..., ... ) */
    parameter_list: ($) =>
      seq(
        "(",
        optional($._terminator),
        optional(
          seq(
            $.parameter,
            repeat(seq(optional($._terminator), ",", optional($._terminator), $.parameter)),
            optional(","),
            optional($._terminator),
          ),
        ),
        ")",
      ),

    /** var : Type = val */
    parameter: ($) =>
      seq(
        field(
          "name",
          choice(
            $.identifier,
            $.instance_variable,
            seq("&", $.identifier),
            seq("*", $.identifier),
          ),
        ),
        optional(seq(":", field("type", $._type))),
        optional(seq("=", $.expression)),
      ),

    /** type */
    _type: ($) =>
      choice(
        $.scoped_type_identifier,
        $.type_identifier,
        $.self_expression,
        $.identifier,
        $.pointer_type,
        $.generic_type,
        $.function_type,
        $.parenthesized_type,
      ),

    scoped_type_identifier: ($) =>
      prec(
        10,
        seq(
          repeat1(seq(choice($.type_identifier, $.identifier), "::")),
          $.type_identifier,
        ),
      ),

    scoped_identifier: ($) =>
      prec(
        10,
        seq(
          choice($.type_identifier, $.scoped_type_identifier),
          "::",
          choice($.identifier, $.type_identifier),
        ),
      ),

    parenthesized_type: ($) => seq("(", __comma_sep1($._type), ")"),

    function_type: ($) =>
      prec.right(
        1,
        seq(
          optional(choice($.scoped_type_identifier, $.type_identifier, $.pointer_type, $.generic_type, $.parenthesized_type)),
          "->",
          $._type,
        ),
      ),

    /** Type* */
    pointer_type: ($) => prec(15, seq($._type, "*")),

    /** Type[ Type, Type ] or Type< Type, Type > */
    generic_type: ($) =>
      prec(
        16,
        seq(
          choice($.type_identifier, $.scoped_type_identifier),
          choice(
            seq("[", __comma_sep1(choice($._type, $.number)), "]"),
            seq("<", __comma_sep1(choice($._type, $.number)), ">"),
          ),
        ),
      ),

    /** expression */
    expression: ($) =>
      choice(
        $._simple_expression,
        $.inline_modifier,
        $.assignment,
        $.variable_declaration,
        $.return_expression,
        $.raise_expression,
      ),

    _simple_expression: ($) =>
      choice(
        $.identifier,
        $.instance_variable,
        $.scoped_identifier,
        $.scoped_type_identifier,
        $.type_identifier,
        $.number,
        $.character_literal,
        $.string,
        $.boolean_literal,
        $.nil_literal,
        $.self_expression,
        $.symbol_literal,
        $.annotation,
        $.unary_expression,
        $.binary_expression,
        $.range_expression,
        $.conditional_expression,
        $.case_expression,
        $.ternary_expression,
        $.call_expression,
        $.member_expression,
        $.implicit_member_expression,
        $.index_expression,
        $.generic_type,
        $.sizeof_expression,
        $.typeof_expression,
        $.parenthesized_expression,
        $.array_literal,
        $.hash_literal,
        $.jsx_element,
        $.regex,
        $.yield_expression,
        $.macro_interpolation,
        $.macro_statement,
      ),

    instance_variable: ($) => token(seq("@", /[a-zA-Z_][a-zA-Z0-9_]*/)),

    boolean_literal: ($) => choice("true", "false"),

    nil_literal: ($) => "nil",

    self_expression: ($) => "self",

    character_literal: ($) =>
      token(
        seq(
          "'",
          choice(
            /[^'\\]/,
            seq("\\", /./),
          ),
          "'",
        ),
      ),

    yield_expression: ($) =>
      prec.right(
        PREC.CALL_NO_PARENS,
        seq("yield", optional(__comma_sep(choice($.expression, $.named_argument))))
      ),

    symbol_literal: ($) => /:[a-z_][a-zA-Z0-9_]*[!?]?=?/,

    regex: ($) =>
      token(
        seq(
          "/",
          repeat(choice(/[^/\\\n]/, seq("\\", /./))),
          "/",
          optional(/[a-z]+/),
        ),
      ),

    raise_expression: ($) =>
      prec.right(PREC.OR + 1, seq("raise", $.expression)),

    unary_expression: ($) =>
      prec(PREC.UNARY, seq(choice("*", "+", "-", "!", "~", "&", "not"), $.expression)),

    /** expression OP expression */
    binary_expression: ($) =>
      choice(
        prec.right(PREC.EXPONENTIAL, seq($.expression, "**", optional($._terminator), $.expression)),
        prec.left(
          PREC.MULTIPLICATIVE,
          seq($.expression, choice("*", "/", "%", "//"), optional($._terminator), $.expression),
        ),
        prec.left(
          PREC.ADDITIVE,
          seq($.expression, choice("+", "-"), optional($._terminator), $.expression),
        ),
        prec.left(
          PREC.SHIFT,
          seq($.expression, choice("<<", ">>"), optional($._terminator), $.expression),
        ),
        prec.left(PREC.BITWISE_AND, seq($.expression, "&", optional($._terminator), $.expression)),
        prec.left(
          PREC.BITWISE_OR,
          seq($.expression, choice("|", "^"), optional($._terminator), $.expression),
        ),
        prec.left(
          PREC.RELATIONAL,
          seq($.expression, choice("<", ">", "<=", ">="), optional($._terminator), $.expression),
        ),
        prec.left(
          PREC.COMPARE,
          seq($.expression, choice("==", "!=", "<=>"), optional($._terminator), $.expression),
        ),
        prec.left(
          PREC.AND,
          seq($.expression, choice("&&", "and"), optional($._terminator), $.expression),
        ),
        prec.left(PREC.OR, seq($.expression, choice("||", "or"), optional($._terminator), $.expression)),
      ),

    range_expression: ($) =>
      prec.left(
        PREC.RELATIONAL,
        seq($.expression, choice("..", "..."), $.expression),
      ),

    /** if/while/unless statement */
    conditional_statement: ($) =>
      seq(
        choice("if", "while", "unless"),
        field("condition", $.expression),
        choice(seq($._terminator, optional($.block)), optional($._terminator)),
        repeat($.elsif_clause),
        optional($.else_clause),
        "end",
      ),

    elsif_clause: ($) =>
      seq(
        "elsif",
        field("condition", $.expression),
        choice(seq($._terminator, optional($.block)), optional($._terminator)),
      ),

    else_clause: ($) =>
      seq(
        "else",
        choice(
          seq($._terminator, optional($.block)),
          $.block,
          seq($.expression, optional($._terminator)),
        ),
      ),

    for_statement: ($) =>
      seq(
        "for",
        __comma_sep1(choice($.identifier, $.instance_variable)),
        "in",
        $.expression,
        choice(seq($._terminator, optional($.block)), optional($._terminator)),
        "end",
      ),

    case_expression: ($) =>
      seq(
        "case",
        optional($.expression),
        optional($._terminator),
        repeat1($.when_clause),
        optional($.else_clause),
        "end",
      ),

    when_clause: ($) =>
      seq(
        "when",
        __comma_sep1($.expression),
        choice(
          seq("then", $.expression, optional($._terminator)),
          seq($._terminator, optional($.block)),
        ),
      ),

    implicit_member_expression: ($) =>
      prec.left(PREC.MEMBER, seq(".", choice($.identifier, $.call_expression))),

    ternary_expression: ($) =>
      prec.dynamic(
        1,
        prec.right(
          PREC.CONDITIONAL,
          seq($.expression, "?", $.expression, ":", $.expression),
        ),
      ),

    conditional_expression: ($) =>
      prec.right(
        PREC.CONDITIONAL,
        seq($.expression, "if", $.expression, "else", $.expression),
      ),

    /** expression if/unless expression */
    inline_modifier: ($) =>
      prec.dynamic(1, seq($.expression, choice("if", "unless"), $.expression)),

    assignment_left_hand_side: ($) =>
      choice(
        $.identifier,
        $.instance_variable,
        $.member_expression,
        $.call_expression,
        $.unary_expression,
        $.index_expression,
      ),

    assignment_operator: ($) =>
      choice("=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>="),

    /** var = expression */
    assignment: ($) =>
      prec.right(
        PREC.ASSIGNMENT,
        seq(
          field("left", $.assignment_left_hand_side),
          $.assignment_operator,
          field("right", $.expression),
        ),
      ),

    variable_declaration: ($) =>
      seq(
        choice($.identifier, $.instance_variable),
        ":",
        field("type", $._type),
        optional(seq("=", $.expression)),
      ),

    block_parameters: ($) => seq("|", __comma_sep($.identifier), "|"),

    block_argument: ($) =>
      choice(
        seq("do", optional($.block_parameters), choice(seq($._terminator, optional($.block)), optional($.block)), "end"),
        seq("{", optional($.block_parameters), choice(seq(optional($._terminator), optional($.block)), optional($._terminator)), "}"),
      ),

    named_argument: ($) =>
      seq(
        field("name", $.identifier),
        ":",
        field("value", $.expression),
      ),

    /** expression( ... ) */
    call_expression: ($) =>
      choice(
        seq(
          choice(
            $.identifier,
            $.type_identifier,
            $.scoped_identifier,
            $.scoped_type_identifier,
            $.member_expression,
            $.index_expression,
            $.parenthesized_expression,
            $.call_expression,
          ),
          "(",
          optional($._terminator),
          optional(
            seq(
              choice($.expression, $.named_argument, $.hash_pair),
              repeat(
                seq(
                  optional($._terminator),
                  ",",
                  optional($._terminator),
                  choice($.expression, $.named_argument, $.hash_pair),
                ),
              ),
              optional(","),
              optional($._terminator),
            ),
          ),
          ")",
          optional($.block_argument),
        ),
        prec.left(
          PREC.CALL_NO_PARENS,
          seq(
            choice($.identifier, $.type_identifier, $.scoped_identifier, $.scoped_type_identifier, $.member_expression),
            __comma_sep(choice($._simple_expression, $.named_argument, $.hash_pair)),
            optional($.block_argument),
          ),
        ),
        seq(
          choice($.identifier, $.type_identifier, $.scoped_identifier, $.scoped_type_identifier, $.member_expression),
          $.block_argument,
        ),
      ),

    member_expression: ($) =>
      prec.left(PREC.MEMBER, seq($.expression, ".", choice($.identifier, $.macro_interpolation))),

    index_expression: ($) =>
      prec.left(
        PREC.MEMBER,
        seq($.expression, "[", __comma_sep1($.expression), "]"),
      ),

    sizeof_expression: ($) => seq("sizeof", $._type),

    typeof_expression: ($) => seq("typeof", $.expression),

    return_expression: ($) => prec.left(seq("return", optional($.expression))),

    parenthesized_expression: ($) => seq("(", $.expression, ")"),

    array_literal: ($) =>
      seq(
        "[",
        optional($._terminator),
        optional(
          seq(
            $.expression,
            repeat(seq(optional($._terminator), ",", optional($._terminator), $.expression)),
            optional(","),
            optional($._terminator),
          ),
        ),
        "]",
        optional(seq("of", $._type)),
      ),

    hash_pair: ($) =>
      choice(
        seq($.expression, "=>", $.expression),
        seq($.identifier, ":", $.expression),
      ),

    hash_literal: ($) =>
      seq(
        "{",
        optional($._terminator),
        optional(
          seq(
            $.hash_pair,
            repeat(seq(optional($._terminator), ",", optional($._terminator), $.hash_pair)),
            optional(","),
            optional($._terminator),
          ),
        ),
        "}",
        optional(seq("of", $._type, "=>", $._type)),
      ),

    jsx_element: ($) =>
      prec.dynamic(
        -10,
        choice(
          seq(
            token(seq("<", /[a-zA-Z0-9_\-]+/)),
            repeat($.jsx_attribute),
            "/>",
          ),
          seq(
            token(seq("<", /[a-zA-Z0-9_\-]+/)),
            repeat($.jsx_attribute),
            ">",
            repeat(choice($.jsx_element, $.jsx_expression, $.jsx_text)),
            token(seq("</", /[a-zA-Z0-9_\-]+/)),
            ">",
          ),
        ),
      ),

    jsx_tag_name: ($) => token(/[a-zA-Z0-9_\-]+/),

    jsx_attribute_name: ($) => /[a-zA-Z0-9_\-:]+/,

    jsx_attribute: ($) =>
      seq(
        field("name", $.jsx_attribute_name),
        optional(
          seq(
            "=",
            choice($.string, $.jsx_expression),
          ),
        ),
      ),

    jsx_expression: ($) => seq("{", $.expression, "}"),

    jsx_text: ($) => token(prec(-1, /[^<{}]+/)),

    macro_statement: ($) =>
      prec(
        20,
        seq(
          "{%",
          choice(
            seq("for", __comma_sep1($.identifier), "in", $.expression),
            seq("if", $.expression),
            seq("elsif", $.expression),
            "else",
            "end",
            $.expression,
          ),
          "%}",
        ),
      ),

    macro_interpolation: ($) =>
      prec(
        20,
        seq(
          optional("@"),
          "{{",
          $.expression,
          "}}",
        ),
      ),

    /** identifier */
    identifier: ($) => /[a-z_][a-zA-Z0-9_]*[!?]?=?/,

    /** Type */
    type_identifier: ($) => /[A-Z][a-zA-Z0-9_]*/,

    /** Operators allowed as method names */
    operator_identifier: ($) => choice(...OPERATORS.identifiers),

    /** \@\[Annotation("...")] */
    annotation: ($) =>
      seq(
        "@[",
        choice($.scoped_type_identifier, $.type_identifier, $.identifier),
        optional(seq("(", __comma_sep(choice($.expression, $.named_argument)), ")")),
        "]",
      ),

    /** 123 | .0 | u64 */
    number: ($) => choice(/[0-9]+(_[a-zA-Z0-9]+)?/, /[0-9]+\.[0-9]+/),

    /** "String" */
    string: ($) =>
      seq(
        '"',
        repeat(
          choice(
            $.string_content,
            $.interpolation,
            $.macro_interpolation,
            $.macro_statement,
            $.escape_sequence,
          ),
        ),
        '"',
      ),

    string_content: ($) => token(prec(1, repeat1(choice(/[^"#\\]+/, /#[^{]/)))),

    interpolation: ($) => seq("#{", optional($._terminator), optional($.block), "}"),

    escape_sequence: ($) =>
      token(
        seq(
          "\\",
          choice(
            /[^uxU]/,
            /x[0-9a-fA-F]{2}/,
            /u[0-9a-fA-F]{4}/,
            /u\{[0-9a-fA-F]+\}/,
            /U[0-9a-fA-F]{8}/,
          ),
        ),
      ),

    /** # */
    comment: ($) => /#[^{].*/,

    /** #{...}# */
    doc_comment: ($) =>
      seq("#{", repeat(choice(/[^#]/, seq("#", /[^}]/))), "#}"),
  },
});
