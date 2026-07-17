{
  pkgs,
  lib,
  version,
  ...
}:
let
  src = lib.cleanSource ../.;
in
pkgs.tree-sitter.buildGrammar {
  language = "volt";
  inherit version src;
  meta = with lib; {
    description = "Tree-sitter grammar for the Volt programming language";
    license = licenses.mit;
    maintainers = [ ];
  };
}
