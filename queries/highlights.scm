; Identifiers
;------------------------------------------------------------------------------

(identifier) @variable

; Types
;------------------------------------------------------------------------------

(type_identifier) @type

(class_declaration
  name: (type_identifier) @type)

(struct_declaration
  name: (type_identifier) @type)

(module_declaration
  name: (type_identifier) @type)

(mixin_declaration
  name: (type_identifier) @type)

(enum_declaration
  name: (type_identifier) @type)

; Keywords
;------------------------------------------------------------------------------

[
  "abstract"
  "external"
  "class"
  "def"
  "do"
  "else"
  "elsif"
  "end"
  "enum"
  "getter"
  "setter"
  "if"
  "include"
  "mixin"
  "module"
  "of"
  "property"
  "raise"
  "rescue"
  "ensure"
  "return"
  "struct"
  "circuit"
  "component"
  "macro"
  "unless"
  "until"
  "while"
  "for"
  "in"
  "case"
  "when"
  "then"
] @keyword

(compile_time_expression
  [
    "sizeof"
    "trivially_destructible?"
    "trivially_copyable?"
  ] @keyword)

; Function calls
;------------------------------------------------------------------------------

(call_expression
  callee: (expression
    (member_expression
      property: (identifier) @function.method)))

(call_expression
  callee: (expression
    (identifier) @function))

; Function definitions
;------------------------------------------------------------------------------

(method_declaration
  name: (identifier) @function)

; Variables & Instance variables
;------------------------------------------------------------------------------

(instance_variable) @variable.builtin

(self_expression) @variable.builtin

(parameter
  name: (identifier) @variable.parameter)

; Member / Field declarations
;------------------------------------------------------------------------------

(field_declaration
  name: (identifier) @property)

; Literals
;------------------------------------------------------------------------------

(string_literal) @string

(symbol_literal) @string.special.symbol

(char_literal) @character

(integer_literal) @number
(float_literal) @number

[
  (nil_literal)
  (boolean_literal)
] @constant.builtin

(comment) @comment
(block_comment) @comment
(doc_comment) @comment

; Annotations
;------------------------------------------------------------------------------

(annotation
  "@[" @punctuation.special
  "]" @punctuation.special)

; Operators
;------------------------------------------------------------------------------

[
  "+"
  "-"
  "*"
  "/"
  "%"
  "**"
  "=="
  "!="
  "<"
  ">"
  "<="
  ">="
  "&&"
  "||"
  "!"
  "<=>"
  "=>"
  "<<"
  ">>"
  "&"
  "|"
  "^"
  "~"
  "->"
  "|>"
  "<|"
  "not"
  "and"
  "or"
] @operator

(assignment
  [
    "="
    "+="
    "-="
    "*="
    "/="
    "%="
    "**="
    "&="
    "|="
    "^="
    "<<="
    ">>="
  ] @operator)

; Punctuation
;------------------------------------------------------------------------------

[
  ","
  ";"
  "."
  ":"
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket
