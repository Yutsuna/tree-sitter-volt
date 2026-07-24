; Method definitions
;------------------------------------------------------------------------------

(
  (comment)* @doc
  .
  (method_declaration
    name: (_) @name) @definition.method
  (#strip! @doc "^#\\s*")
  (#select-adjacent! @doc @definition.method)
)

; Class definitions
;------------------------------------------------------------------------------

(
  (comment)* @doc
  .
  (class_declaration
    name: (type_identifier) @name) @definition.class
  (#strip! @doc "^#\\s*")
  (#select-adjacent! @doc @definition.class)
)

; Struct definitions
;------------------------------------------------------------------------------

(
  (comment)* @doc
  .
  (struct_declaration
    name: (type_identifier) @name) @definition.class
  (#strip! @doc "^#\\s*")
  (#select-adjacent! @doc @definition.class)
)

; Module definitions
;------------------------------------------------------------------------------

(
  (module_declaration
    name: (type_identifier) @name) @definition.module
)

; Mixin definitions
;------------------------------------------------------------------------------

(
  (mixin_declaration
    name: (type_identifier) @name) @definition.module
)

; Calls
;------------------------------------------------------------------------------

(call_expression
  callee: (expression
    (member_expression
      property: (identifier) @name))) @reference.call

(
  [(identifier) (type_identifier)] @name @reference.call
  (#is-not? local)
)
