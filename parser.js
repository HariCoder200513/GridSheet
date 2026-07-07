"use strict";

class Parser {
  constructor() {
    this.tokens = [];
    this.pos = 0;
  }

  parse(tokens) {
    this.tokens = tokens;
    this.pos = 0;
    const ast = this.parseExpression();
    if (this.pos < this.tokens.length) {
      throw new Error("Unexpected token");
    }
    return ast;
  }

  peek() {
    if (this.pos >= this.tokens.length) return null;
    return this.tokens[this.pos];
  }

  consume() {
    const token = this.tokens[this.pos];
    this.pos++;
    return token;
  }

  parseExpression() {
    let left = this.parseTerm();
    while (this.peek() && this.peek().type === "OPERATOR" &&
           (this.peek().value === "+" || this.peek().value === "-")) {
      const op = this.consume().value;
      const right = this.parseTerm();
      left = { type: "BinaryOp", op, left, right };
    }
    return left;
  }

  parseTerm() {
    let left = this.parseFactor();
    while (this.peek() && this.peek().type === "OPERATOR" &&
           (this.peek().value === "*" || this.peek().value === "/")) {
      const op = this.consume().value;
      const right = this.parseFactor();
      left = { type: "BinaryOp", op, left, right };
    }
    return left;
  }

  parseFactor() {
    const token = this.peek();
    if (!token) throw new Error("Unexpected end of expression");

    if (token.type === "NUMBER") {
      this.consume();
      return { type: "Number", value: token.value };
    }

    if (token.type === "CELL_REF") {
      this.consume();
      const colLetters = token.value.match(/[A-Z]+/)[0];
      const rowNum = parseInt(token.value.match(/\d+/)[0], 10);
      const col = colLetters.charCodeAt(0) - 64;
      return { type: "CellRef", row: rowNum, col };
    }

    if (token.type === "PAREN_OPEN") {
      this.consume();
      const expr = this.parseExpression();
      if (!this.peek() || this.peek().type !== "PAREN_CLOSE") {
        throw new Error("Missing closing parenthesis");
      }
      this.consume();
      return expr;
    }

    throw new Error(`Unexpected token: ${token.value}`);
  }
}
