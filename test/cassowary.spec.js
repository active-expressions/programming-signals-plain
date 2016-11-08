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
}  from 'dwarfcassowary';
import * as Cassowary from 'dwarfcassowary';
Cassowary; // TODO: this keeps rollup from tree-shaking away our import reference to Cassowary
import trigger from 'aexpr-trigger';

describe('Cassowary', function() {
    beforeEach(() => Cassowary.ClSimplexSolver.resetInstance());

    xit('two-way data binding', function() {
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

    it('test for assignment', function() {
        let a = 2, b = 3, c = 5;

        let solver = Cassowary.ClSimplexSolver.getInstance();

        // a
        let constraintVarA = new Cassowary.ClVariable('a', a);
        //aexpr(() => a).onChange(val => constraintVarA.set_value(val));
        //aexpr(() => constraintVarA.value()).onChange(val => a = val);
        //solver._constraintVariablesByVariables.set('a', constraintVarA);

        // b
        let constraintVarB = new Cassowary.ClVariable('b', b);
        //aexpr(() => b).onChange(val => constraintVarB.set_value(val));
        //aexpr(() => constraintVarB.value()).onChange(val => b = val);
        //solver._constraintVariablesByVariables.set('b', constraintVarB);

        /*
         * Initial Constraint Solving
         */
        console.log('INITIAL CONSTRAINT CONSTRUCTION',
            constraintVarA.toString(),
            constraintVarB.toString()
        );
        //always: 2 * a == b;
        let linearEquation = constraintVarA.times(2).cnEquals(constraintVarB);
        solver.addConstraint(linearEquation);

        constraintVarA.stay(Cassowary.ClStrength.weak);
        constraintVarB.stay(Cassowary.ClStrength.weak);
        solver.solveConstraints();

        expect(constraintVarA.value()).not.to.equal(0);
        expect(constraintVarB.value()).not.to.equal(0);
        expect(2 * constraintVarA.value()).to.equal(constraintVarB.value());

        /*
         * Assignment to A
         */
        console.log('ASSIGNMENT TO A',
            constraintVarA.toString(),
            constraintVarB.toString()
        );
        constraintVarA.set_value(10);
        //solver.solveConstraints();
        constraintVarA.suggestValue(10);

        expect(constraintVarA.value()).to.equal(10);
        expect(constraintVarB.value()).not.to.equal(0);
        expect(2 * constraintVarA.value()).to.equal(constraintVarB.value());

        /*
         * Second Constraint
         */
        // c
        console.log('SECOND CONSTRAINT',
            constraintVarA.toString(),
            constraintVarB.toString()
        );
        let constraintVarC = new Cassowary.ClVariable('c', c);
        constraintVarB.stay(Cassowary.ClStrength.weak);
        //aexpr(() => b).onChange(val => constraintVarB.set_value(val));
        //aexpr(() => constraintVarB.value()).onChange(val => b = val);
        //solver._constraintVariablesByVariables.set('c', constraintVarC);

        let linearEquation2 = constraintVarA.plus(constraintVarB).cnEquals(constraintVarC);
        solver.addConstraint(linearEquation2);
        solver.solveConstraints();

        expect(constraintVarA.value()).not.to.equal(0);
        expect(constraintVarB.value()).not.to.equal(0);
        expect(constraintVarC.value()).not.to.equal(0);
        expect(2 * constraintVarA.value()).to.equal(constraintVarB.value());
        expect(constraintVarA.value() + constraintVarB.value()).to.equal(constraintVarC.value());

        /*
         * Assignment to B
         */
        console.log('ASSIGNMENT TO B',
            constraintVarA.toString(),
            constraintVarB.toString(),
            constraintVarC.toString()
        );
        constraintVarB.set_value(3000);
        constraintVarB.suggestValue(3000);
        //solver.solveConstraints();

        expect(constraintVarB.value()).to.equal(3000);
        expect(2 * constraintVarA.value()).to.equal(constraintVarB.value());
        expect(constraintVarA.value() + constraintVarB.value()).to.equal(constraintVarC.value());
    });

    xit('simple equality', function() {
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
                if (!solver.__solving__) {
                    solver.__solving__ = true;
                    solver.addAssignmentConstraints();

                    try {
                        solver.solveConstraints();
                    } finally {
                        solver.__solving__ = false;
                        solver.removeAssignmentConstraints();
                    }
                }
            });


        //console.log(a, b, constraintVarA._value, constraintVarB._value);
        expect(2 * a).to.equal(b);

        a = 10;
        //console.log(a, b, constraintVarA._value, constraintVarB._value);
        //expect(a).to.equal(10);
        expect(2 * a).to.equal(b);

        b = 3000;
        //console.log(a, b, constraintVarA._value, constraintVarB._value);
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

    xit('this test opens a printer!?', function() {
        let a = 2, b = 3;

        //always: 2 * a == b;
        let solver = Cassowary.ClSimplexSolver.getInstance();

        // a
        let constraintVarA = solver.getConstraintVariableFor(window, 'a', () => {
            let _constraintVar = new Cassowary.ClVariable('a', a);
            //_constraintVar.stay(Cassowary.ClStrength.weak);
            aexpr(() => a).onChange(val => _constraintVar.set_value(val));
            aexpr(() => _constraintVar.value()).onChange(val => a = val);
            return _constraintVar;
        });

        // b
        let constraintVarB = solver.getConstraintVariableFor(window, 'b', () => {
            let _constraintVar = new Cassowary.ClVariable('b', b);
            //_constraintVar.stay(Cassowary.ClStrength.weak);
            aexpr(() => b).onChange(val => _constraintVar.set_value(val));
            aexpr(() => _constraintVar.value()).onChange(val => b = val);
            return _constraintVar;
        });

        let linearEquation = constraintVarA.times(2).cnEquals(constraintVarB);
        solver.addConstraint(linearEquation);

        console.log(
            'BEFORE CONSTRAINT CONSTRUCTION',
            a, constraintVarA.toString(), constraintVarA._lastValue,
            b, constraintVarB.toString(), constraintVarB._lastValue
        );

        trigger(aexpr(() => 2 * constraintVarA.value() == constraintVarB.value()))
            .onBecomeFalse(() => {
                if (!solver.__solving__) {
                    solver.__solving__ = true;
                    solver.addAssignmentConstraints();

                    try {
                        solver.solveConstraints();
                    } finally {
                        solver.__solving__ = false;
                        solver.removeAssignmentConstraints();
                    }
                }
            });

        console.log(
            'AFTER CONSTRAINT CONSTRUCTION',
            a, constraintVarA.toString(), constraintVarA._lastValue,
            b, constraintVarB.toString(), constraintVarB._lastValue
        );

        expect(2 * a).to.equal(b);

        console.log(
            'BEFORE ASSIGNMENT TO A',
            a, constraintVarA.toString(), constraintVarA._lastValue,
            b, constraintVarB.toString(), constraintVarB._lastValue
        );
        a = 10;
        //console.log(a, b, constraintVarA._value, constraintVarB._value);
        expect(a).to.equal(10);
        expect(2 * a).to.equal(b);

        console.log(
            'BEFORE ASSIGNMENT TO B',
            a, constraintVarA.toString(), constraintVarA._lastValue,
            b, constraintVarB.toString(), constraintVarB._lastValue
        );
        b = 3000;
        console.log(
            'AFTER ASSIGNMENT TO B',
            a, constraintVarA.toString(), constraintVarA._lastValue,
            b, constraintVarB.toString(), constraintVarB._lastValue
        );
        //console.log(a, b, constraintVarA._value, constraintVarB._value);
        expect(b).to.equal(3000);
        expect(2 * a).to.equal(b);
    });

    xit('involve multiple constraints', function() {
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

            console.log(
                a, constraintVarA.value(), constraintVarA._lastValue,
                b, constraintVarB.value(), constraintVarB._lastValue
            );

            let linearEquation = constraintVarA.times(2).cnEquals(constraintVarB);
            solver.addConstraint(linearEquation);

            console.log(
                a, constraintVarA.value(), constraintVarA._lastValue,
                b, constraintVarB.value(), constraintVarB._lastValue
            );

            trigger(aexpr(() => 2 * constraintVarA.value() == constraintVarB.value()))
                .onBecomeFalse(() => {
                    if (!solver.__solving__) {
                        solver.__solving__ = true;
                        solver.addAssignmentConstraints();

                        try {
                            solver.solveConstraints();
                        } finally {
                            solver.__solving__ = false;
                            solver.removeAssignmentConstraints();
                        }
                    }
                });
            expect(2 * a).to.equal(b);

            console.log(
                a, constraintVarA.value(), constraintVarA._lastValue,
                b, constraintVarB.value(), constraintVarB._lastValue
            );
            a = 15;
            console.log(
                a, constraintVarA.value(), constraintVarA._lastValue,
                b, constraintVarB.value(), constraintVarB._lastValue
            );

            expect(a).to.equal(15);
            expect(2 * a).to.equal(b);
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
                        if (!solver.__solving__) {
                            solver.__solving__ = true;

                            try {
                                solver.solveConstraints();
                            } finally {
                                solver.__solving__ = false;
                            }
                        }
                    });
            }
        }

        //console.log(a, b, getLocalB(), getLocalC());
        expect(2 * a).to.equal(b);
        expect(a + getLocalB()).to.equal(2 * getLocalC());

        a = 10;

        //console.log(a, b, getLocalB(), getLocalC());
        expect(2 * a).to.equal(b);
        expect(a + getLocalB()).to.equal(2 * getLocalC());

        setLocalC(100);

        //console.log(a, b, getLocalB(), getLocalC());
        expect(2 * a).to.equal(b);
        expect(a + getLocalB()).to.equal(2 * getLocalC());
    });

    xit('rewrite test', function() {
        var a = 2, b = 3, c = 10;

        //console.log(a, b, c);
        always: 2 * a + 3 * b == c;

        //console.log(a, b, c);
        expect(2 * a + 3 * b).to.equal(c);

        always: 2 * a == b;
        //console.log(a, b, c);
        expect(2 * a + 3 * b).to.equal(c);
        expect(2 * a).to.equal(b);

        c = 42;

        //console.log(a, b, c);
        expect(2 * a + 3 * b).to.equal(c);
        expect(2 * a).to.equal(b);
    });

    xit('rewrite test with assignment', function() {
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
