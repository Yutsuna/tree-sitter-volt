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
    "[]", "[]=", "<", "<=", ">", ">=", "==", "<=>",
    "+", "-", "*", "/", "%", "**", "//", "&&", "||", "&", "|", "^", "<<", ">>"
  ],

  binary_expressions: [
    /** --------------------------------  */
    "+",
    "-",
    "*",
    "/",
    "%",
    "**",
    "//",
    /** --------------------------------  */
    "==",
    "!=",
    "<",
    ">",
    "<=",
    ">=",
    "<=>",
    /** --------------------------------  */
    "&&",
    "||",
    "^",
    "<<",
    ">>",
    "&",
    "|",
    /** --------------------------------  */
  ],
};

const PREC = {
  ASSIGNMENT: 0,
  CONDITIONAL: 1,
  OR: 2,
  AND: 3,
  COMPARE: 4,
  RELATIONAL: 5,
  BITWISE_OR: 6,
  BITWISE_AND: 7,
  SHIFT: 8,
  ADDITIVE: 9,
  MULTIPLICATIVE: 10,
  EXPONENTIAL: 11,
  UNARY: 12,
  MEMBER: 13,
  CALL_NO_PARENS: 1,
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
    [$.parameter, $.instance_variable],
    [$._type, $.expression],
    [$.generic_type, $.expression],
    [$.parameter, $.variable_declaration],
    [$.variable_declaration],
    [$.conditional_expression, $.inline_modifier],
    [$.conditional_expression, $.inline_modifier, $.typeof_expression],
    [$.conditional_expression, $.inline_modifier, $.return_expression],
    [$.inline_modifier],
    [$.conditional_expression, $.inline_modifier, $.assignment],
    [$.conditional_expression, $.inline_modifier, $.variable_declaration],
    [$.expression, $.symbol_literal],
    [$.symbol_literal, $.assignment_left_hand_side],
    [$.conditional_expression, $.inline_modifier, $.call_expression],
    [$.call_expression, $.parenthesized_expression],
    [$.call_expression, $.typeof_expression],
    [$.call_expression],
    [$.variable_declaration, $.call_expression],
    [$.expression, $.call_expression],
  ],

  rules: {
    /** entry point of every files */
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
        $.include_statement,
        $.member_declaration,
        $.annotation,
      ),

    _terminator: ($) => repeat1(choice("\n", "\r\n", ";")),

    definitions: ($) =>
      seq(
        $._definition,
        repeat(seq($._terminator, $._definition)),
        optional($._terminator)
      ),

    block: ($) =>
      seq(
        $.expression,
        repeat(seq($._terminator, $.expression)),
        optional($._terminator)
      ),

    /** class Name ... end */
    class_definition: ($) =>
      seq(
        "class",
        field("name", $.type_identifier),
        optional($.type_parameter_list),
        optional(seq("include", $.type_identifier)),
        choice(
          seq($._terminator, optional($.definitions), "end"),
          "end"
        )
      ),

    /** struct Name ... end */
    struct_definition: ($) =>
      seq(
        "struct",
        field("name", $.type_identifier),
        optional($.type_parameter_list),
        optional(seq("include", $.type_identifier)),
        choice(
          seq($._terminator, optional($.definitions), "end"),
          "end"
        )
      ),

    /** module Name ... end */
    module_definition: ($) =>
      seq(
        "module",
        field("name", $.type_identifier),
        optional($.type_parameter_list),
        choice(
          seq($._terminator, optional($.definitions), "end"),
          "end"
        )
      ),

    /** mixin Name ... end */
    mixin_definition: ($) =>
      seq(
        "mixin",
        field("name", $.type_identifier),
        optional($.type_parameter_list),
        choice(
          seq($._terminator, optional($.definitions), "end"),
          "end"
        )
      ),

    /** def name( ... ) -> Type ... end */
    method_definition: ($) =>
      seq(
        optional($.visibility_modifier),
        "def",
        field(
          "name",
          choice(
            $.identifier,
            seq("self.", $.identifier),
            $.operator_identifier,
          ),
        ),
        optional($.parameter_list),
        optional(seq("->", field("return_type", $._type))),
        choice(
          seq($._terminator, optional($.block), "end"),
          "end"
        )
      ),

    /** abstract def name( ... ) -> Type */
    abstract_method_definition: ($) =>
      seq(
        optional($.visibility_modifier),
        "abstract",
        "def",
        field(
          "name",
          choice($.identifier, $.operator_identifier),
        ),
        optional($.parameter_list),
        optional(seq("->", field("return_type", $._type))),
      ),

    /** include Name */
    include_statement: ($) => seq("include", $.type_identifier),

    /** getter size : Int */
    member_declaration: ($) =>
      seq(
        optional($.visibility_modifier),
        optional("getter"),
        field("name", $.identifier),
        ":",
        field("type", $._type),
      ),

    /** private | protected | public */
    visibility_modifier: ($) => choice("private", "protected", "public"),

    /** [ T, U ] */
    type_parameter_list: ($) => seq("[", __comma_sep1($.type_identifier), "]"),

    /** ( ..., ... ) */
    parameter_list: ($) => seq("(", __comma_sep($.parameter), ")"),

    /** var : Type */
    parameter: ($) =>
      seq(
        field("name", choice($.identifier, seq("@", $.identifier))),
        ":",
        field("type", $._type),
        optional(seq("=", $.expression)),
      ),

    /** type */
    _type: ($) => choice($.type_identifier, $.pointer_type, $.generic_type),

    /** Type* */
    pointer_type: ($) => prec(15, seq($._type, "*")),

    /** Type[ Type, Type ] */
    generic_type: ($) =>
      seq($.type_identifier, "[", __comma_sep1(choice($._type, $.number)), "]"),

    /** expression */
    expression: ($) =>
      choice(
        $.identifier,
        $.instance_variable,
        $.type_identifier,
        $.number,
        $.string,
        $.boolean_literal,
        $.nil_literal,
        $.self_expression,
        $.symbol_literal,
        $.annotation,
        $.unary_expression,
        $.binary_expression,
        $.conditional_statement,
        $.conditional_expression,
        $.inline_modifier,
        $.assignment,
        $.variable_declaration,
        $.call_expression,
        $.member_expression,
        $.index_expression,
        $.generic_type,
        $.sizeof_expression,
        $.typeof_expression,
        $.return_expression,
        $.raise_expression,
        $.parenthesized_expression,
        $.array_literal,
        $.hash_literal,
      ),

    instance_variable: ($) => seq("@", $.identifier),

    boolean_literal: ($) => choice("true", "false"),

    nil_literal: ($) => "nil",

    self_expression: ($) => "self",

    symbol_literal: ($) => seq(":", $.identifier),

    raise_expression: ($) =>
      prec.right(PREC.OR + 1, seq("raise", $.expression)),

    unary_expression: ($) =>
      prec(PREC.UNARY, seq(choice("*", "-", "!", "~", "&"), $.expression)),

    /** expression OP expression */
    binary_expression: ($) =>
      choice(
        prec.right(PREC.EXPONENTIAL, seq($.expression, "**", $.expression)),
        prec.left(
          PREC.MULTIPLICATIVE,
          seq($.expression, choice("*", "/", "%", "//"), $.expression),
        ),
        prec.left(
          PREC.ADDITIVE,
          seq($.expression, choice("+", "-"), $.expression),
        ),
        prec.left(
          PREC.SHIFT,
          seq($.expression, choice("<<", ">>"), $.expression),
        ),
        prec.left(PREC.BITWISE_AND, seq($.expression, "&", $.expression)),
        prec.left(
          PREC.BITWISE_OR,
          seq($.expression, choice("|", "^"), $.expression),
        ),
        prec.left(
          PREC.RELATIONAL,
          seq($.expression, choice("<", ">", "<=", ">="), $.expression),
        ),
        prec.left(
          PREC.COMPARE,
          seq($.expression, choice("==", "!=", "<=>"), $.expression),
        ),
        prec.left(PREC.AND, seq($.expression, choice("&&", "and"), $.expression)),
        prec.left(PREC.OR, seq($.expression, choice("||", "or"), $.expression)),
      ),

    /** if/while/unless statement */
    conditional_statement: ($) =>
      seq(
        choice("if", "while", "unless"),
        field("condition", $.expression),
        choice(
          seq($._terminator, optional($.block)),
          optional($._terminator)
        ),
        repeat($.elsif_clause),
        optional($.else_clause),
        "end",
      ),

    elsif_clause: ($) =>
      seq(
        "elsif",
        field("condition", $.expression),
        choice(
          seq($._terminator, optional($.block)),
          optional($._terminator)
        ),
      ),

    else_clause: ($) =>
      seq(
        "else",
        choice(
          seq($._terminator, optional($.block)),
          optional($._terminator)
        ),
      ),

    conditional_expression: ($) =>
      prec.right(
        PREC.CONDITIONAL,
        choice(
          seq($.expression, "?", $.expression, ":", $.expression),
          seq($.expression, "if", $.expression, "else", $.expression),
        ),
      ),

    /** expression if/unless expression */
    inline_modifier: ($) =>
      prec.left(PREC.CONDITIONAL, seq($.expression, choice("if", "unless"), $.expression)),

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

    /** expression( ... ) */
    call_expression: ($) =>
      choice(
        seq(
          choice(
            $.identifier,
            $.type_identifier,
            $.member_expression,
            $.index_expression,
            $.parenthesized_expression,
            $.call_expression,
          ),
          "(",
          optional(__comma_sep($.expression)),
          ")",
        ),
        prec.left(
          PREC.CALL_NO_PARENS,
          seq(
            choice($.identifier, $.type_identifier, $.member_expression),
            __comma_sep($.expression),
          ),
        ),
      ),

    member_expression: ($) =>
      prec.left(
        PREC.MEMBER,
        seq($.expression, ".", $.identifier),
      ),

    index_expression: ($) =>
      prec.left(
        PREC.MEMBER,
        seq($.expression, "[", __comma_sep1($.expression), "]"),
      ),

    sizeof_expression: ($) =>
      seq(
        "sizeof",
        $._type,
      ),

    typeof_expression: ($) =>
      seq(
        "typeof",
        $.expression,
      ),

    return_expression: ($) =>
      prec.left(
        seq(
          "return",
          optional($.expression),
        ),
      ),

    parenthesized_expression: ($) =>
      seq(
        "(",
        $.expression,
        ")",
      ),

    array_literal: ($) =>
      seq(
        "[",
        optional(__comma_sep($.expression)),
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
        optional(__comma_sep($.hash_pair)),
        "}",
        optional(seq("of", $._type, "=>", $._type)),
      ),

    /** identifier */
    identifier: ($) => /[a-z_][a-zA-Z0-9_]*\??=?/,

    /** Type */
    type_identifier: ($) => /[A-Z][a-zA-Z0-9_]*/,

    /** Operators allowed as method names */
    operator_identifier: ($) => choice(...OPERATORS.identifiers),

    /** \@\[Annotation("...")] */
    annotation: ($) =>
      seq(
        "@[",
        $.type_identifier,
        optional(seq("(", __comma_sep($.string), ")")),
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
            $.escape_sequence,
          )
        ),
        '"',
      ),

    string_content: ($) => token(prec(1, repeat1(choice(/[^"#\\]+/, /#[^{]/)))),

    interpolation: ($) => seq("#{", $.expression, "}"),

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
