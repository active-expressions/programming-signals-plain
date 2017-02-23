/*istanbul ignore next*/'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function ( /*istanbul ignore next*/_ref) {
  /*istanbul ignore next*/var t = _ref.types,
      template = _ref.template,
      traverse = _ref.traverse;

  var setup = template( /*istanbul ignore next*/'\nconst signals = [],\n    adjustedDependencies = [],\n    defineSignal = function(scope, name, init, solve) {\n      let signal = new Signal(scope, name, init, solve);\n      signals.push(signal);\n      return signal.initialize();\n    },\n    resolveSignals = function(starting) {\n      let startingIndex = signals.indexOf(starting);\n      signals\n        .filter((s, i) => i >= startingIndex)\n        .forEach(s => {\n          if(adjustedDependencies.some((dep) => {\n              let scope = dep[0],\n                  name = dep[1];\n              return s.hasDependency(scope, name);\n            })) {\n            s.resolve();\n            adjustedDependencies.push([s.scope, s.name]);\n            s.initialize();\n          }\n        });\n    },\n    getLocal = function(scope, name) {\n      if(Signal.determineDepencencies) {\n        Signal.currentSignal.addDependency(scope, name);\n      }\n    },\n    setLocal = function(scope, name) {\n      if(Signal.solving) { return; }\n      let triggeredSignal = signals.find(s => s.hasDependency(scope, name));\n      if(triggeredSignal) {\n        Signal.solving = true;\n        adjustedDependencies.length = 0;\n        adjustedDependencies.push([scope, name]);\n        resolveSignals(triggeredSignal);\n        Signal.solving = false;\n      }\n    };\n\nconst compositeKeyStore = new Map();\n\nclass Signal {\n  constructor(scope, name, init, solve) {\n    this.scope = scope,\n    this.name = name,\n    this.init = init,\n    this.solve = solve;\n    this.dependencies = new Set();\n  }\n  initialize() {\n    this.dependencies.clear();\n    Signal.determineDepencencies = true;\n    Signal.currentSignal = this;\n    let result = this.init();\n    Signal.determineDepencencies = false;\n    Signal.currentSignal = undefined;\n    return result;\n  }\n  addDependency(scope, name) {\n    this.dependencies.add(CompositeKey.get(scope, name));\n  }\n  hasDependency(scope, name) {\n    return this.dependencies.has(CompositeKey.get(scope, name));\n  }\n  resolve() {\n    this.solve();\n  }\n}\nSignal.currentSignal = undefined;\nSignal.determineDepencencies = false;\nSignal.solving = false;\n\nclass CompositeKey {\n    static get(obj1, obj2) {\n        if(!compositeKeyStore.has(obj1)) {\n            compositeKeyStore.set(obj1, new Map());\n        }\n        let secondKeyMap = compositeKeyStore.get(obj1);\n        if(!secondKeyMap.has(obj2)) {\n            secondKeyMap.set(obj2, {});\n        }\n        return secondKeyMap.get(obj2);\n    }\n    static clear() {\n        compositeKeyStore.clear();\n    }\n}\n');

  return {
    visitor: {
      /*istanbul ignore next*/Program: function Program(program, state) {
        function isVariable(path) {
          // - filter out with negative conditions
          if (t.isLabeledStatement(path.parent) && path.parentKey === 'label') return false;
          if (t.isBreakStatement(path.parent) && path.parentKey === 'label') return false;
          if (t.isForInStatement(path.parent) && path.parentKey === 'left') return false;
          if (t.isFunctionExpression(path.parent) && path.parentKey === 'id') return false;
          if (t.isImportDefaultSpecifier(path.parent) && path.parentKey === 'local') return false;
          if (t.isCatchClause(path.parent) && path.parentKey === 'param') return false;
          if (t.isObjectProperty(path.parent) && path.parentKey === 'key') return false;
          if (t.isClassDeclaration(path.parent)) return false;
          if (t.isClassMethod(path.parent)) return false;
          if (t.isImportSpecifier(path.parent)) return false; // correct?
          if (t.isMemberExpression(path.parent) && path.parentKey === 'property' && !path.parent.computed) return false;
          if (t.isObjectMethod(path.parent)) return false;
          if (t.isFunctionDeclaration(path.parent)) return false;
          if (t.isArrowFunctionExpression(path.parent) && path.parentKey === 'params') return false;
          if (t.isFunctionExpression(path.parent) && path.parentKey === 'params') return false;
          if (t.isRestElement(path.parent)) return false;

          return true;
        }

        function getIdentifierForExplicitScopeObject(parentWithScope) {
          var bindings = parentWithScope.scope.bindings;
          var scopeName = Object.keys(bindings).find(function (key) {
            return bindings[key].path && bindings[key].path.node && bindings[key].path.node.id && bindings[key].path.node.id[IS_EXPLICIT_SCOPE_OBJECT];
          });

          if (scopeName) {
            return t.identifier(scopeName);
          } else {
            var uniqueIdentifier = parentWithScope.scope.generateUidIdentifier('scope');
            uniqueIdentifier[IS_EXPLICIT_SCOPE_OBJECT] = true;

            parentWithScope.scope.push({
              kind: 'let',
              id: uniqueIdentifier,
              init: t.objectExpression([t.objectProperty(t.identifier('name'), t.stringLiteral(uniqueIdentifier.name))])
            });
            return uniqueIdentifier;
          }
        }

        function getScopeIdentifierForVariable(path) {
          if (path.scope.hasBinding(path.node.name)) {
            var parentWithScope = path.findParent(function (par) /*istanbul ignore next*/{
              return par.scope.hasOwnBinding(path.node.name);
            });
            if (parentWithScope) {
              return getIdentifierForExplicitScopeObject(parentWithScope);
            }
          } else {
            return t.identifier('window');
          }
        }

        function bubbleThroughPattern(path) {
          if (path.parentPath.isArrayPattern() && path.parentKey === 'elements') return bubbleThroughPattern(path.parentPath);
          if (path.parentPath.isRestElement() && path.parentKey === 'argument') return bubbleThroughPattern(path.parentPath);
          if (path.parentPath.isObjectPattern() && path.parentKey === 'properties') return bubbleThroughPattern(path.parentPath);
          if (path.parentPath.isObjectProperty() && path.parentKey === 'value') return bubbleThroughPattern(path.parentPath);
          if (path.parentPath.isRestProperty() && path.parentKey === 'argument') return bubbleThroughPattern(path.parentPath);
          return path;
        }

        function isLocallyDefined(path) {
          return path.scope.hasBinding(path.node.name) && path.findParent(function (par) /*istanbul ignore next*/{
            return par.scope.hasOwnBinding(path.node.name);
          });
        }

        function identifierInDeclaration(identifierPath) {
          if (!identifierPath.findParent(function (p) /*istanbul ignore next*/{
            return p.isDeclaration();
          })) {
            return false;
          }
          var pattern = bubbleThroughPattern(identifierPath);
          return pattern.parentPath.isVariableDeclarator() && pattern.parentKey === 'id';
        }

        program.traverse({
          /*istanbul ignore next*/UpdateExpression: function UpdateExpression(path) {
            path.replaceWith(t.binaryExpression(path.node.operator === '++' ? '-' : '+', t.assignmentExpression(path.node.operator === '++' ? '+=' : '-=', path.get('argument').node, t.numberLiteral(1)), t.numberLiteral(1)));
          }
        });

        var localReads = new Set();
        var globalReads = new Set();
        var localWrites = new Set();
        var signalDeclarators = new Set();
        var objPropReads = new Set();
        var objPropWrites = new Set();
        var objPropCalls = new Set();

        program.traverse({
          /*istanbul ignore next*/MemberExpression: function MemberExpression(path) {
            if (path.parentPath.isAssignmentExpression() && path.parentKey === 'left') {
              objPropWrites.add(path);
            } else if (path.parentPath.isCallExpression() && path.parentKey === 'callee') {
              objPropCalls.add(path);
            } else {
              objPropReads.add(path);
            }
          }
        });

        program.traverse({
          /*istanbul ignore next*/Identifier: function Identifier(path) {
            if (path.parentPath.isAssignmentExpression() && path.parentKey === 'left') {
              localWrites.add(path);
            } else if (isVariable(path) && isLocallyDefined(path) && !identifierInDeclaration(path)) {
              localReads.add(path);
            } else if (isVariable(path) && isLocallyDefined(path)) {
              var pattern = bubbleThroughPattern(path);
              // const as substitute for 'signal' for now #TODO
              if (pattern.parentPath.parentPath.node.kind === 'const') {
                signalDeclarators.add(pattern.parentPath);
              }
            } else if (isVariable(path) && !isLocallyDefined(path)) {
              globalReads.add(path);
            }
          }
        });

        var rewriteGetter = function rewriteGetter(path) {
          path.replaceWith(template( /*istanbul ignore next*/'((result, scope, name) => {\n                      getLocal(scope, name);\n                      return result;\n                    })(IDENTIFIER, SCOPE, NAME)')({
            IDENTIFIER: path.node,
            SCOPE: getScopeIdentifierForVariable(path),
            NAME: t.stringLiteral(path.node.name)
          }));
        };
        globalReads.forEach(rewriteGetter);
        localReads.forEach(rewriteGetter);

        signalDeclarators.forEach(function (decl) {
          decl.parentPath.node.kind = 'let';
          var init = decl.get('init'),
              id = decl.get('id');
          init.replaceWith(template( /*istanbul ignore next*/'defineSignal(SCOPE, NAME, () => INIT, () => VAR = INIT)')({
            SCOPE: getScopeIdentifierForVariable(id),
            NAME: t.stringLiteral(id.node.name),
            VAR: t.identifier(id.node.name),
            INIT: init
          }));
        });

        localWrites.forEach(function (path) {
          var assignment = path.parentPath;
          assignment.replaceWith(template( /*istanbul ignore next*/'((result, scope, name) => {\n                      setLocal(scope, name);\n                      return result;\n                    })(ASSIGNMENT, SCOPE, NAME)')({
            ASSIGNMENT: assignment.node,
            SCOPE: getScopeIdentifierForVariable(path),
            NAME: t.stringLiteral(path.node.name)
          }));
        });

        objPropReads.forEach(function (p) {
          program.unshiftContainer('body', t.expressionStatement(t.stringLiteral(p.node.property.name)));
        });
        objPropReads.forEach(function (path) {
          var obj = path.get('object'),
              prop = path.get('property'),
              computed = path.node.computed;
          path.replaceWith(template( /*istanbul ignore next*/'((obj, prop) => {\n                      getLocal(obj, prop);\n                      return obj[prop];\n                    })(OBJECT, PROP_NAME)')({
            OBJECT: obj.node,
            PROP_NAME: computed ? prop.node : t.stringLiteral(prop.node.name)
          }));
        });
        objPropWrites.forEach(function (path) {
          var assignment = path.parentPath;
          var operator = assignment.node.operator;
          var obj = path.get('object'),
              prop = path.get('property'),
              computed = path.node.computed;
          assignment.replaceWith(template( /*istanbul ignore next*/'((obj, prop, value) => {\n                      let result = obj[prop] ' + operator + ' value;\n                      setLocal(obj, prop);\n                      return result;\n                    })(OBJECT, PROP_NAME, VALUE)')({
            OBJECT: obj.node,
            PROP_NAME: computed ? prop.node : t.stringLiteral(prop.node.name),
            VALUE: assignment.node.right
          }));
        });
        objPropCalls.forEach(function (path) {
          var obj = path.get('object'),
              prop = path.get('property'),
              computed = path.node.computed;
          path.replaceWith(template( /*istanbul ignore next*/'((obj, prop, ) => {\n                      getLocal(obj, prop);\n                      return obj[prop].bind(obj);\n                    })(OBJECT, PROP_NAME)')({
            OBJECT: obj.node,
            PROP_NAME: computed ? prop.node : t.stringLiteral(prop.node.name)
          }));
        });

        program.unshiftContainer("body", setup());
      }
    }
  };
};

var IS_EXPLICIT_SCOPE_OBJECT = Symbol('FLAG: generated scope object');
