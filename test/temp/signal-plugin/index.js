/*istanbul ignore next*/"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function ( /*istanbul ignore next*/_ref) {
    /*istanbul ignore next*/var t = _ref.types,
        template = _ref.template,
        traverse = _ref.traverse;


    var signal = template( /*istanbul ignore next*/"(aexpr(() => init)\n                             .onChange(val => name = val),\n                             init)");

    return {
        visitor: {
            /*istanbul ignore next*/Program: function Program(program) {
                program.traverse({
                    /*istanbul ignore next*/CallExpression: function CallExpression(path) {
                        if (!path.get("callee").isIdentifier()) {
                            return;
                        }
                        if (!path.get("callee").node.name !== 'aexpr') {
                            return;
                        }
                    }
                });
                program.traverse({
                    /*istanbul ignore next*/Identifier: function Identifier(path) {
                        if (!path.parentPath.isVariableDeclarator()) {
                            return;
                        }

                        // const as substitute for 'signal'
                        var declaration = path.parentPath.parentPath.node;
                        if (declaration.kind !== 'const') {
                            return;
                        }
                        declaration.kind = 'let';

                        var init = path.parentPath.get('init');
                        init.replaceWith(signal({
                            init: init,
                            name: path.node
                        }).expression);
                    }
                });
            }
        }
    };
};
