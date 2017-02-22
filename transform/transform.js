const IS_EXPLICIT_SCOPE_OBJECT = Symbol('FLAG: generated scope object');

export default function({ types: t, template, traverse, }) {
    var setup = template(`
var aexprCallbacks = [],
    signals = [],
    solveSignals = false,
    resolveSignals = function() {
      signals.forEach(s => s ());
    }
`);
    
    return {
        visitor: {
            Program(program, state) {
                function isVariable(path) {
                  // - filter out with negative conditions
                  if(t.isLabeledStatement(path.parent) && path.parentKey === 'label') return false;
                  if(t.isBreakStatement(path.parent) && path.parentKey === 'label') return false;
                  if(t.isForInStatement(path.parent) && path.parentKey === 'left') return false;
                  if(t.isFunctionExpression(path.parent) && path.parentKey === 'id') return false;
                  if(t.isImportDefaultSpecifier(path.parent) && path.parentKey === 'local') return false;
                  if(t.isCatchClause(path.parent) && path.parentKey === 'param') return false;
                  if(t.isObjectProperty(path.parent) && path.parentKey === 'key') return false;
                  if(t.isClassDeclaration(path.parent)) return false;
                  if(t.isClassMethod(path.parent)) return false;
                  if(t.isImportSpecifier(path.parent)) return false; // correct?
                  if(t.isMemberExpression(path.parent) && path.parentKey === 'property' && !path.parent.computed) return false;
                  if(t.isObjectMethod(path.parent)) return false;
                  if(t.isFunctionDeclaration(path.parent)) return false;
                  if((t.isArrowFunctionExpression(path.parent) && path.parentKey === 'params')) return false;
                  if((t.isFunctionExpression(path.parent) && path.parentKey === 'params')) return false;
                  if(t.isRestElement(path.parent)) return false;
              
                  return true;
                }

                function getIdentifierForExplicitScopeObject(parentWithScope) {
                    let bindings = parentWithScope.scope.bindings;
                    let scopeName = Object.keys(bindings).find(key => {
                        return bindings[key].path &&
                            bindings[key].path.node &&
                            bindings[key].path.node.id &&
                            bindings[key].path.node.id[IS_EXPLICIT_SCOPE_OBJECT]
                    });

                    if(scopeName) {
                        return t.identifier(scopeName);
                    } else {
                        let uniqueIdentifier = parentWithScope.scope.generateUidIdentifier('scope');
                        uniqueIdentifier[IS_EXPLICIT_SCOPE_OBJECT] = true;

                        parentWithScope.scope.push({
                            kind: 'let',
                            id: uniqueIdentifier,
                            init: t.objectExpression([
                              t.objectProperty(t.identifier('name'), t.stringLiteral(uniqueIdentifier.name))
                            ])
                        });
                        return uniqueIdentifier;
                    }
                }

                function getScopeIdentifierForVariable(path) {
                    if(path.scope.hasBinding(path.node.name)) {
                        let parentWithScope = path.findParent(par =>
                            par.scope.hasOwnBinding(path.node.name)
                        );
                        if(parentWithScope) {
                            return getIdentifierForExplicitScopeObject(parentWithScope);
                        }
                    } else {
                        return t.identifier('window');
                    }
                }
                
                function bubbleThroughPattern(path) {
                  if(path.parentPath.isArrayPattern() && path.parentKey === 'elements') return bubbleThroughPattern(path.parentPath);
                  if(path.parentPath.isRestElement() && path.parentKey === 'argument') return bubbleThroughPattern(path.parentPath);
                  if(path.parentPath.isObjectPattern() && path.parentKey === 'properties') return bubbleThroughPattern(path.parentPath);
                  if(path.parentPath.isObjectProperty() && path.parentKey === 'value') return bubbleThroughPattern(path.parentPath);
                  if(path.parentPath.isRestProperty() && path.parentKey === 'argument') return bubbleThroughPattern(path.parentPath);
                  return path;
                }
                
                function isLocallyDefined(path) {
                  return path.scope.hasBinding(path.node.name) && path.findParent(par =>
                    par.scope.hasOwnBinding(path.node.name)
                  );
                }
                
                function identifierInDeclaration(identifierPath) {
                  if(!identifierPath.findParent(p=>p.isDeclaration())) { return false; }
                  let pattern = bubbleThroughPattern(identifierPath);
                  return pattern.parentPath.isVariableDeclarator() && pattern.parentKey === 'id';
                }

                let localReads = new Set();
                let localWrites = new Set();
                let bindings = new Set();
                let signalDeclarators = new Set();
                
                program.traverse({
                  Identifier(path) {
                    if(path.parentPath.isAssignmentExpression() && path.parentKey === 'left') {
                      localWrites.add(path);
                    } else if (isVariable(path) && isLocallyDefined(path) && !identifierInDeclaration(path)){
                      localReads.add(path);
                    } else if (isVariable(path) &&isLocallyDefined(path)) {
                      let pattern = bubbleThroughPattern(path);
                      // const as substitute for 'signal' for now #TODO
                      if(pattern.parentPath.parentPath.kind === 'const') {
                        signalDeclarators.add(pattern.parentPath);
                      }
                    }
                  }
                });
                
                localReads.forEach(path => {
                  path.replaceWith(template(`(result => {
                      return result;
                    })(identifier, scope, name)`)({
                      identifier: path.node,
                      scope: getScopeIdentifierForVariable(path),
                      name: t.stringLiteral(path.node.name)
                    }))
                  path.node.name += 'R';
                });
                localWrites.forEach(path => {
                  let assignment = path.parentPath;
                  assignment.replaceWith(
                    template(`(result => {return result;
                    })(assignment, scope, name)`)({
                      assignment: assignment.node,
                      scope: getScopeIdentifierForVariable(path),
                      name: t.stringLiteral(path.node.name)
                    })
                  );
                });
                return;
                let assignmentExpressions = new Set();
                program.traverse({
                    AssignmentExpression(path) {
                      assignmentExpressions.add(path);
                    },
                    UpdateExpression(path) {
                      assignmentExpressions.add(path);
                    }
                });
                assignmentExpressions.forEach(path => {
                  path.replaceWith(template(`(result => {
                    resolveSignals();
                    return result
                  })(expr)`)({ expr: path.node }));
                });

                var signal = template(`(signals.push(() => name = init), init)`);
                program.traverse({
                    Identifier(path) {
                        if(!path.parentPath.isVariableDeclarator()) { return; }

                        // const as substitute for 'signal' for now #TODO
                        var declaration = path.parentPath.parentPath.node;
                        if(declaration.kind !== 'const') {return; }
                        declaration.kind = 'let';

                        var init = path.parentPath.get('init');
                        init.replaceWith(signal({
                            init: init,
                            name: path.node
                        }).expression);
                    }
                });

                program.unshiftContainer("body", setup());
            }
        }
    };
}