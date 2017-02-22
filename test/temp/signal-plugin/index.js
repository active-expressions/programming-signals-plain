/*istanbul ignore next*/'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function ( /*istanbul ignore next*/_ref) {
    /*istanbul ignore next*/var t = _ref.types,
        template = _ref.template,
        traverse = _ref.traverse;

    var setup = template( /*istanbul ignore next*/'\nvar aexprCallbacks = [],\n    signals = [],\n    solveSignals = false,\n    resolveSignals = function() {\n        if(!solveSignals) {\n            solveSignals = true;\n            signals.forEach(s => s());\n            solveSignals = false;\n            let nonSignalCB;\n            while(nonSignalCB = aexprCallbacks.pop()) {\n                nonSignalCB();\n            }\n        }\n    },\n    newAExpr = function(axp) {\n        return {\n            onChange(cb) {\n                axp.onChange(val => {\n                    if(solveSignals) {\n                        aexprCallbacks.push(() => cb(axp.getCurrentValue()));\n                    } else {\n                        return cb(val);\n                    }\n                });\n            }\n        }\n    }\n');
    var signal = template( /*istanbul ignore next*/'(aexpr(() => init).onChange(resolveSignals), signals.push(() => name = init), init)');

    return {
        visitor: {
            /*istanbul ignore next*/Program: function Program(program) {
                var aexprs = new Set();
                program.traverse({
                    /*istanbul ignore next*/CallExpression: function CallExpression(path) {
                        var callee = path.get("callee");
                        if (callee.isIdentifier() && callee.node.name === 'aexpr') aexprs.add(path);
                    }
                });
                aexprs.forEach(function (path) /*istanbul ignore next*/{
                    return path.replaceWith(template( /*istanbul ignore next*/'newAExpr(expr)')({ expr: path.node }));
                });

                program.traverse({
                    /*istanbul ignore next*/Identifier: function Identifier(path) {
                        if (!path.parentPath.isVariableDeclarator()) {
                            return;
                        }

                        // const as substitute for 'signal' for now #TODO
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

                program.unshiftContainer("body", setup());
            }
        }
    };
};
