import XCTest
import SwiftTreeSitter
import TreeSitterVolt

final class TreeSitterVoltTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_volt())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Volt grammar")
    }
}
