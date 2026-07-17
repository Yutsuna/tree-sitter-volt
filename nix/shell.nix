{
  pkgs,
  ...
}:
pkgs.mkShell {
  name = "tree-sitter-dev-shell";
  nativeBuildInputs = with pkgs; [
    tree-sitter
    nodejs
    prettier
    python3
    stdenv.cc
  ];
  shellHook = ''
    export CXXFLAGS="-std=c++20"
  '';
}
