"use strict";

class Evaluator {
  constructor(cellMap) {
    this.cellMap = cellMap;
    this.visited = new Set();
  }

  evaluate(ast) {
    this.visited.clear();
    return this.evalNode(ast);
  }

  evalNode(node) {
    switch (node.type) {
      case "Number":
        return node.value;

      case "CellRef": {
        const key = `${node.row},${node.col}`;
        if (this.visited.has(key)) return "#ERR!";
        this.visited.add(key);

        const val = this.cellMap.get(key);
        if (val === undefined) return 0;
        if (typeof val === "string" && val.startsWith("=")) {
          const inner = this.evalFormulaString(val);
          return isNaN(Number(inner)) ? 0 : Number(inner);
        }
        return isNaN(Number(val)) ? 0 : Number(val);
      }

      case "BinaryOp": {
        const left = this.evalNode(node.left);
        const right = this.evalNode(node.right);
        if (typeof left === "string") return left;
        if (typeof right === "string") return right;

        switch (node.op) {
          case "+": return left + right;
          case "-": return left - right;
          case "*": return left * right;
          case "/":
            if (right === 0) return "#DIV/0!";
            return left / right;
        }
      }
    }
    return "#ERR!";
  }

  evalFormulaString(expr) {
    const formula = expr.slice(1).trim().toUpperCase();
    try {
      const tokens = tokenizer.tokenize(formula);
      const ast = parser.parse(tokens);
      return this.evalNode(ast);
    } catch {
      return "#ERR!";
    }
  }
}
