export default function({ types: t, template, traverse, }) {

    var signal = template(`(aexpr(() => init)
                             .onChange(val => name = val),
                             init)`);


    return {
        visitor: {
            Program(program) {
                program.traverse({
                    CallExpression(path) {
                        if(!path.get("callee").isIdentifier()) { return; }
                        if(!path.get("callee").node.name !== 'aexpr') { return; }
                    }
                });
                program.traverse({
                    Identifier(path) {
                        if(!path.parentPath.isVariableDeclarator()) { return; }

                        // const as substitute for 'signal'
                        var declaration = path.parentPath.parentPath.node;
                        if(declaration.kind !== 'const') {return; }
                        declaration.kind = 'let';

                        var init = path.parentPath.get('init');
                        init.replaceWith(signal({
                            init:init,
                            name:path.node
                        }).expression)
                    }
                });
            }
        }
    };
}