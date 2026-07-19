; Identifiers
;------------------------------------------------------------------------------

(identifier) @variable

; Types
;------------------------------------------------------------------------------

(type_identifier) @type

(class_definition
  name: (type_identifier) @type)

(struct_definition
  name: (type_identifier) @type)

(module_definition
  name: (type_identifier) @type)

(mixin_definition
  name: (type_identifier) @type)

; Keywords
;------------------------------------------------------------------------------

[
  "abstract"
  "and"
  "class"
  "def"
  "do"
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
  "yield"
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

; Variables & Instance variables
;------------------------------------------------------------------------------

(instance_variable) @variable.builtin

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

(regex) @string.special.regex

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
