/*istanbul ignore next*/'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (param) {
    /*istanbul ignore next*/var t = param.types,
        template = param.template,
        traverse = param.traverse;

    return {
        visitor: {
            /*istanbul ignore next*/Program: function Program(program) {
                program.traverse({
                    /*istanbul ignore next*/Identifier: function Identifier(path) {
                        if (!path.parentPath.isVariableDeclarator()) {
                            return;
                        }

                        // const as substitute for 'signal'
                        if (path.parentPath.parentPath.node.kind !== 'const') {
                            return;
                        }
                        path.parentPath.parentPath.node.kind = 'let';

                        var init = path.parentPath.get('init');
                        init.replaceWith(template( /*istanbul ignore next*/'aexpr(() => init)\n                                             .onChange(val => name = val)\n                                             .getCurrentValue()')({
                            init: init,
                            name: path.node
                        }).expression);
                    }
                });
            }
        }
    };
};
