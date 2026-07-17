{
  pkgs,
  ...
}:
pkgs.mkShell {
  name = "tree-sitter-dev-shell";
  nativeBuildInputs = with pkgs; [
    tree-sitter
    nodejs
    python3
    stdenv.cc
  ];
}
