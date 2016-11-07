import {
    ClVariable,
    CL,
    ClAbstractVariable,
    ClDummyVariable,
    ClEditConstraint,
    ClEditInfo,
    ClEditOrStayConstraint,
    ClLinearConstraint, ClLinearEquation, ClLinearExpression,
    ClLinearInequality, ClConstraint, ClPoint, ClSimplexSolver,
    ClSlackVariable, ClStayConstraint, ClStrength, ClObjectiveVariable,
    ExCLConstraintNotFound, ExCLError, ExCLNonlinearExpression, ExCLInternalError,
    ExCLNotEnoughStays, ExCLRequiredFailure, ExCLTooDifficult, Timer
}  from './../lib/dwarfcassowary/dwarfcassowary.js';
import * as Cassowary from './../lib/dwarfcassowary/dwarfcassowary.js';
Cassowary; // TODO: this keeps rollup from tree-shaking away our import reference to Cassowary
import trigger from 'aexpr-trigger';

describe('Cassowary', function() {
    beforeEach(() => Cassowary.ClSimplexSolver.resetInstance());

    it('two-way data binding', function() {
        let a = 2,
            constraintVarA = new Cassowary.ClVariable('a', a);

        expect(a).to.equal(constraintVarA._value);

        // Two-way data binding
        aexpr(() => a).onChange(val => constraintVarA.set_value(val));
        aexpr(() => constraintVarA.value()).onChange(val => a = val);

        expect(a).to.equal(constraintVarA._value);

        a = 10;

        expect(a).to.equal(10);
        expect(a).to.equal(constraintVarA._value);

        constraintVarA._value = 20;

        expect(a).to.equal(20);
        expect(a).to.equal(constraintVarA._value);
    });

    it('simple equality', function() {
        let a = 2, b = 3;

        //always: 2 * a == b;

            // a
            let constraintVarA = new Cassowary.ClVariable('a', a);
            constraintVarA.stay(Cassowary.ClStrength.weak);
            aexpr(() => a).onChange(val => constraintVarA.set_value(val));
            aexpr(() => constraintVarA.value()).onChange(val => a = val);

            // b
            let constraintVarB = new Cassowary.ClVariable('b', b);
            constraintVarB.stay(Cassowary.ClStrength.weak);
            aexpr(() => b).onChange(val => constraintVarB.set_value(val));
            aexpr(() => constraintVarB.value()).onChange(val => b = val);
        //aexpr(()=> a).onChange(val => console.log(`a: ${val}`));
        //aexpr(()=> b).onChange(val => console.log(`b: ${val}`));
            let linearEquation = constraintVarA.times(2).cnEquals(constraintVarB);
            let solver = Cassowary.ClSimplexSolver.getInstance();
            solver.addConstraint(linearEquation);

            trigger(aexpr(() => 2 * constraintVarA.value() == constraintVarB.value()))
                .onBecomeFalse(() => {
                    solver.solveConstraints();
                });


        console.log(a, b, constraintVarA._value, constraintVarB._value);
        expect(2 * a).to.equal(b);

        a = 10;
        console.log(a, b, constraintVarA._value, constraintVarB._value);
        expect(2 * a).to.equal(b);

        b = 3000;
        console.log(a, b, constraintVarA._value, constraintVarB._value);
        expect(2 * a).to.equal(b);

        return;
        expect(a).to.equal(10);
        expect(a).to.equal(constraintVarA._value);

        constraintVarA._value = 20;

        expect(a).to.equal(20);
        expect(a).to.equal(constraintVarA._value);
        return;

        expect(2 * a + 3 * b).to.equal(c);

        let solver2 = Cassowary.ClSimplexSolver.getInstance();
        let linExpr = a.times(1);
        linExpr=linExpr.cnEquals(2);
        ClVariable,
            CL,
            ClAbstractVariable,
            ClDummyVariable,
            ClEditConstraint,
            ClEditInfo,
            ClEditOrStayConstraint,
            ClLinearConstraint, ClLinearEquation, ClLinearExpression,
            ClLinearInequality, ClConstraint, ClPoint, ClSimplexSolver,
            ClSlackVariable, ClStayConstraint, ClStrength, ClObjectiveVariable,
            ExCLConstraintNotFound, ExCLError, ExCLNonlinearExpression, ExCLInternalError,
            ExCLNotEnoughStays, ExCLRequiredFailure, ExCLTooDifficult, Timer;
        solver.addConstraint(linExpr);
        solver.solve();

        expect(a.value()).to.equal(b.value());
    });

    it('involve multiple constraints', function() {
        let _scope = {};
        let a = 2, b = 3;

        //always: 2 * a == b;
        {
            let solver = Cassowary.ClSimplexSolver.getInstance();

            // a
            let constraintVarA = solver.getConstraintVariableFor(_scope, 'a', () => {
                let _constraintVar = new Cassowary.ClVariable('a', a);
                _constraintVar.stay(Cassowary.ClStrength.weak);
                aexpr(() => a).onChange(val => _constraintVar.set_value(val));
                aexpr(() => _constraintVar.value()).onChange(val => a = val);
                return _constraintVar;
            });

            // global b
            let constraintVarB = solver.getConstraintVariableFor(_scope, 'b', () => {
                let _constraintVar = new Cassowary.ClVariable('b', b);
                _constraintVar.stay(Cassowary.ClStrength.weak);
                aexpr(() => b).onChange(val => _constraintVar.set_value(val));
                aexpr(() => _constraintVar.value()).onChange(val => b = val);
                return _constraintVar;
            });

            let linearEquation = constraintVarA.times(2).cnEquals(constraintVarB);
            solver.addConstraint(linearEquation);

            trigger(aexpr(() => 2 * constraintVarA.value() == constraintVarB.value()))
                .onBecomeFalse(() => {
                    solver.solveConstraints();
                });
        }

        let getLocalB, getLocalC, setLocalC;
        {
            //always: a + __b__ == 2 * c
            let _scope2 = {};
            let b = 10, c = 20;
            getLocalB = () => b;
            getLocalC = () => c;
            setLocalC = val => c = val;
            {
                let solver = Cassowary.ClSimplexSolver.getInstance();

                // a
                let constraintVarA = solver.getConstraintVariableFor(_scope, 'a', () => {
                    let _constraintVar = new Cassowary.ClVariable('a', a);
                    _constraintVar.stay(Cassowary.ClStrength.weak);
                    aexpr(() => a).onChange(val => _constraintVar.set_value(val));
                    aexpr(() => _constraintVar.value()).onChange(val => a = val);
                    return _constraintVar;
                });

                // local b
                let constraintVarB = solver.getConstraintVariableFor(_scope2, 'b', () => {
                    let _constraintVar = new Cassowary.ClVariable('b', b);
                    _constraintVar.stay(Cassowary.ClStrength.weak);
                    aexpr(() => b).onChange(val => _constraintVar.set_value(val));
                    aexpr(() => _constraintVar.value()).onChange(val => b = val);
                    return _constraintVar;
                });

                // c
                let constraintVarC = solver.getConstraintVariableFor(_scope2, 'c', () => {
                    let _constraintVar = new Cassowary.ClVariable('c', c);
                    _constraintVar.stay(Cassowary.ClStrength.weak);
                    aexpr(() => c).onChange(val => _constraintVar.set_value(val));
                    aexpr(() => _constraintVar.value()).onChange(val => c = val);
                    return _constraintVar;
                });

                let linearEquation = constraintVarA.plus(constraintVarB).cnEquals(constraintVarC.times(2));
                solver.addConstraint(linearEquation);

                trigger(aexpr(() => constraintVarA.value() + constraintVarB.value() == 2 * constraintVarC.value()))
                    .onBecomeFalse(() => {
                        solver.solveConstraints();
                    });
            }
        }

        console.log(a, b, getLocalB(), getLocalC());
        expect(2 * a).to.equal(b);
        expect(a + getLocalB()).to.equal(2 * getLocalC());

        a = 10;

        console.log(a, b, getLocalB(), getLocalC());
        expect(2 * a).to.equal(b);
        expect(a + getLocalB()).to.equal(2 * getLocalC());

        setLocalC(100);

        console.log(a, b, getLocalB(), getLocalC());
        expect(2 * a).to.equal(b);
        expect(a + getLocalB()).to.equal(2 * getLocalC());
    });

    it('rewrite test', function() {
        var a = 2, b = 3, c = 10;

        console.log(a, b, c);
        always: 2 * a + 3 * b == c;

        console.log(a, b, c);
        expect(2 * a + 3 * b).to.equal(c);

        c = 42;

        console.log(a, b, c);
        expect(2 * a + 3 * b).to.equal(c);
    });
});
