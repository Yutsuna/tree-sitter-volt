; Scopes
;------------------------------------------------------------------------------

((method_declaration) @local.scope
 (#set! local.scope-inherits false))

[
  (block_expression)
  (block_argument)
  (conditional_statement)
  (class_declaration)
  (struct_declaration)
  (module_declaration)
  (mixin_declaration)
] @local.scope

; Definitions
;------------------------------------------------------------------------------

(parameter
  name: (identifier) @local.definition)

(assignment
  target: (identifier) @local.definition)

(variable_declaration
  name: (identifier) @local.definition)

(field_declaration
  name: (identifier) @local.definition)

; References
;------------------------------------------------------------------------------

(identifier) @local.reference
