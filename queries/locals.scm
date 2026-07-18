; Scopes
;------------------------------------------------------------------------------

((method_definition) @local.scope
 (#set! local.scope-inherits false))

[
  (block)
  (conditional_statement)
] @local.scope

; Definitions
;------------------------------------------------------------------------------

(parameter
  name: (identifier) @local.definition)

(assignment
  left: (assignment_left_hand_side
    (identifier) @local.definition))

(variable_declaration
  (identifier) @local.definition)

; References
;------------------------------------------------------------------------------

(identifier) @local.reference
