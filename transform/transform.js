export default function(param) {
    let { types: t, template, traverse, } = param;
    return {
        visitor: {
            Program(program) {
                program.traverse({
                    Identifier(path) {
                        if(!path.parentPath.isVariableDeclarator()) { return; }

                        // const as substitute for 'signal'
                        if(path.parentPath.parentPath.node.kind !== 'const') {return; }
                        path.parentPath.parentPath.node.kind = 'let';

                        var init = path.parentPath.get('init');
                        init.replaceWith(template(`aexpr(() => init)
                                             .onChange(val => name = val)
                                             .getCurrentValue()`)({
                                                 init:init,
                                                name:path.node
                                             }).expression)
                    }
                });
            }
        }
    };
}