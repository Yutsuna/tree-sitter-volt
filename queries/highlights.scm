; Identifiers
;------------------------------------------------------------------------------

(identifier) @variable

; Types
;------------------------------------------------------------------------------

(type_identifier) @type

(class_definition
  name: (type_identifier) @constructor)

(struct_definition
  name: (type_identifier) @constructor)

(module_definition
  name: (type_identifier) @constructor)

(mixin_definition
  name: (type_identifier) @constructor)

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

; Function calls
;------------------------------------------------------------------------------

(call_expression
  (member_expression
    (identifier) @function.method))

(call_expression
  (identifier) @function)

(call_expression
  (type_identifier) @constructor)

; Function definitions
;------------------------------------------------------------------------------

(method_definition
  name: (identifier) @function)

(method_definition
  name: (operator_identifier) @function)

(abstract_method_definition
  name: (identifier) @function)

(abstract_method_definition
  name: (operator_identifier) @function)

; Identifiers & variables
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

(regex_literal) @string.regex

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
