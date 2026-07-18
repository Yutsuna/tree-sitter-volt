; Identifiers
;------------------------------------------------------------------------------

(identifier) @variable

((identifier) @function.method
 (#is-not? local))

; Keywords
;------------------------------------------------------------------------------

[
  "abstract"
  "and"
  "class"
  "def"
  "else"
  "elsif"
  "end"
  "getter"
  "if"
  "include"
  "mixin"
  "module"
  "of"
  "or"
  "raise"
  "return"
  "sizeof"
  "struct"
  "typeof"
  "unless"
  "while"
] @keyword

((identifier) @keyword
 (#match? @keyword "^(private|protected|public)$"))

(visibility_modifier) @keyword

; Types
;------------------------------------------------------------------------------

(type_identifier) @constructor

; Function calls
;------------------------------------------------------------------------------

(call_expression
  (member_expression
    (identifier) @function.method))

(call_expression
  (identifier) @function.method)

(call_expression
  (type_identifier) @constructor)

; Function definitions
;------------------------------------------------------------------------------

(method_definition
  name: (identifier) @function.method)

(method_definition
  name: (operator_identifier) @function.method)

(abstract_method_definition
  name: (identifier) @function.method)

(abstract_method_definition
  name: (operator_identifier) @function.method)

; Identifiers
;------------------------------------------------------------------------------

(instance_variable) @property

(self_expression) @variable.builtin

(parameter
  name: (identifier) @variable.parameter)

; Member declarations
;------------------------------------------------------------------------------

(member_declaration
  name: (identifier) @property)

; Literals
;------------------------------------------------------------------------------

[
  (string)
] @string

(string_content) @string

(symbol_literal) @string.special.symbol

(escape_sequence) @escape

(number) @number

[
  (nil_literal)
  (boolean_literal)
] @constant.builtin

(interpolation
  "#{" @punctuation.special
  "}" @punctuation.special) @embedded

(comment) @comment
(doc_comment) @comment

; Annotations
;------------------------------------------------------------------------------

(annotation
  "@[" @punctuation.special
  (type_identifier) @attribute
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
  "//"
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
] @operator

(assignment_operator) @operator

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
