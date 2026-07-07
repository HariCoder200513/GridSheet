"use strict";

class Tokenizer {
  tokenize(formula) {
    const tokens = [];
    let i = 0;

    while (i < formula.length) {
      const ch = formula[i];

      if (ch === " ") {
        i++;
        continue;
      }

      console.log(tokens)

      if (ch === "(") {
        tokens.push({ type: "PAREN_OPEN", value: "(" });
        i++;
        continue;
      }

      if (ch === ")") {
        tokens.push({ type: "PAREN_CLOSE", value: ")" });
        i++;
        continue;
      }

      if ("+-*/".includes(ch)) {
        tokens.push({ type: "OPERATOR", value: ch });
        i++;
        continue;
      }

      if (ch >= "0" && ch <= "9" || ch === ".") {
        let num = "";
        while (i < formula.length && (formula[i] >= "0" && formula[i] <= "9" || formula[i] === ".")) {
          num += formula[i];
          i++;
        }
        tokens.push({ type: "NUMBER", value: Number(num) });
        continue;
      }

      if (ch >= "A" && ch <= "Z") {
        let ref = "";
        while (i < formula.length && formula[i] >= "A" && formula[i] <= "Z") {
          ref += formula[i];
          i++;
        }
        while (i < formula.length && formula[i] >= "0" && formula[i] <= "9") {
          ref += formula[i];
          i++;
        }
        tokens.push({ type: "CELL_REF", value: ref });
        continue;
      }

      throw new Error(`Unexpected character: ${ch}`);
    }

    return tokens;
  }
}
