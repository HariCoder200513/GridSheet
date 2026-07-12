"use strict";

class DependencyGraph {
  constructor() {
    this.dependencies = new Map();
    this.dependents = new Map();
  }

  _ensureCell(key) {
    if (!this.dependencies.has(key)) this.dependencies.set(key, new Set());
    if (!this.dependents.has(key)) this.dependents.set(key, new Set());
  }

  extractCellRefs(node) {
    const refs = [];
    this._walkAst(node, refs);
    return refs;
  }

  _walkAst(node, refs) {
    if (!node) return;
    if (node.type === "CellRef") {
      refs.push(`${node.row},${node.col}`);
    } else if (node.type === "BinaryOp") {
      this._walkAst(node.left, refs);
      this._walkAst(node.right, refs);
    }
  }

  update(cellKey, formula, tokenizer, parser) {
    this.removeEdges(cellKey);

    if (!formula || !formula.startsWith("=")) return true;

    const expr = formula.slice(1).trim().toUpperCase();
    let ast;
    try {
      const tokens = tokenizer.tokenize(expr);
      ast = parser.parse(tokens);
    } catch {
      return true;
    }

    const refs = this.extractCellRefs(ast);

    this._ensureCell(cellKey);
    for (const ref of refs) {
      this._ensureCell(ref);
      this.dependencies.get(cellKey).add(ref);
      this.dependents.get(ref).add(cellKey);
    }

    if (this._hasCycle(cellKey)) {
      this.removeEdges(cellKey);
      return false;
    }

    return true;
  }

  removeEdges(cellKey) {
    const deps = this.dependencies.get(cellKey);
    if (deps) {
      for (const dep of deps) {
        const depSet = this.dependents.get(dep);
        if (depSet) depSet.delete(cellKey);
      }
      this.dependencies.delete(cellKey);
    }

    const dependentSet = this.dependents.get(cellKey);
    if (dependentSet) {
      for (const dependent of dependentSet) {
        const depSet = this.dependencies.get(dependent);
        if (depSet) depSet.delete(cellKey);
      }
      this.dependents.delete(cellKey);
    }
  }

  _hasCycle(startKey) {
    const visited = new Set();
    const queue = [];

    const directDependents = this.dependents.get(startKey);
    if (!directDependents) return false;

    for (const d of directDependents) {
      if (d === startKey) return true;
      queue.push(d);
      visited.add(d);
    }

    while (queue.length > 0) {
      const current = queue.shift();
      const currentDependents = this.dependents.get(current);
      if (!currentDependents) continue;

      for (const next of currentDependents) {
        if (next === startKey) return true;
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }

    return false;
  }

  getAffectedCells(changedKey) {
    const affected = new Set();
    const queue = [changedKey];
    affected.add(changedKey);

    while (queue.length > 0) {
      const current = queue.shift();
      const deps = this.dependents.get(current);
      if (!deps) continue;

      for (const dep of deps) {
        if (!affected.has(dep)) {
          affected.add(dep);
          queue.push(dep);
        }
      }
    }

    affected.delete(changedKey);

    return this._topologicalSort(affected);
  }

  _topologicalSort(cellSet) {
    if (cellSet.size === 0) return [];

    const inDegree = new Map();
    const subgraph = new Map();

    for (const key of cellSet) {
      inDegree.set(key, 0);
      subgraph.set(key, new Set());

      const deps = this.dependencies.get(key);
      if (deps) {
        for (const dep of deps) {
          if (cellSet.has(dep)) {
            subgraph.get(key).add(dep);
            inDegree.set(key, inDegree.get(key) + 1);
          }
        }
      }
    }

    const queue = [];
    for (const [key, degree] of inDegree) {
      if (degree === 0) queue.push(key);
    }

    const sorted = [];
    while (queue.length > 0) {
      const current = queue.shift();
      sorted.push(current);

      for (const [key, deps] of subgraph) {
        if (deps.has(current)) {
          inDegree.set(key, inDegree.get(key) - 1);
          if (inDegree.get(key) === 0) {
            queue.push(key);
          }
        }
      }
    }

    if (sorted.length < cellSet.size) {
      return Array.from(cellSet);
    }

    return sorted;
  }

  rebuildAll(cellMap, tokenizer, parser) {
    this.dependencies.clear();
    this.dependents.clear();

    for (const [key, val] of cellMap) {
      if (val && val.startsWith("=")) {
        this.update(key, val, tokenizer, parser);
      }
    }
  }

  snapshot() {
    const deps = {};
    for (const [k, v] of this.dependencies) deps[k] = Array.from(v);
    const rdeps = {};
    for (const [k, v] of this.dependents) rdeps[k] = Array.from(v);
    return { dependencies: deps, dependents: rdeps };
  }
}
