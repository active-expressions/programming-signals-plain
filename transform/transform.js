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
            Program(program) {
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