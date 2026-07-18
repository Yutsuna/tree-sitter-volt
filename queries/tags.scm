; Method definitions
;------------------------------------------------------------------------------

(
  (comment)* @doc
  .
  (method_definition
    name: (_) @name) @definition.method
  (#strip! @doc "^#\\s*")
  (#select-adjacent! @doc @definition.method)
)

(
  (comment)* @doc
  .
  (abstract_method_definition
    name: (_) @name) @definition.method
  (#strip! @doc "^#\\s*")
  (#select-adjacent! @doc @definition.method)
)

; Class definitions
;------------------------------------------------------------------------------

(
  (comment)* @doc
  .
  (class_definition
    name: (type_identifier) @name) @definition.class
  (#strip! @doc "^#\\s*")
  (#select-adjacent! @doc @definition.class)
)

; Struct definitions
;------------------------------------------------------------------------------

(
  (comment)* @doc
  .
  (struct_definition
    name: (type_identifier) @name) @definition.class
  (#strip! @doc "^#\\s*")
  (#select-adjacent! @doc @definition.class)
)

; Module definitions
;------------------------------------------------------------------------------

(
  (module_definition
    name: (type_identifier) @name) @definition.module
)

; Mixin definitions
;------------------------------------------------------------------------------

(
  (mixin_definition
    name: (type_identifier) @name) @definition.module
)

; Calls
;------------------------------------------------------------------------------

(call_expression
  (member_expression
    (identifier) @name)) @reference.call

(
  [(identifier) (type_identifier)] @name @reference.call
  (#is-not? local)
)
