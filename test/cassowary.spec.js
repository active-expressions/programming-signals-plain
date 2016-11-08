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
}  from '../lib/dwarfcassowary/dwarfcassowary.js';
import * as Cassowary from '../lib/dwarfcassowary/dwarfcassowary.js';
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

    describe('system integration', function() {
        // understanding the library API
        it('manual usage of solver library', function() {
            let a = 2, b = 3, c = 5;

            let solver = Cassowary.ClSimplexSolver.getInstance();

            // a
            let constraintVarA = new Cassowary.ClVariable('a', a);

            // b
            let constraintVarB = new Cassowary.ClVariable('b', b);

            /*
             * Initial Constraint Solving
             */
            //always: 2 * a == b;
            let linearEquation = constraintVarA.times(2).cnEquals(constraintVarB);
            solver.addConstraint(linearEquation);

            solver.solveConstraints();

            expect(constraintVarA.value()).not.to.equal(0);
            expect(constraintVarB.value()).not.to.equal(0);
            expect(2 * constraintVarA.value()).to.equal(constraintVarB.value());

            /*
             * Assignment to A
             */
            constraintVarA.set_value(10);
            constraintVarA.suggestValue(10);

            expect(constraintVarA.value()).to.equal(10);
            expect(constraintVarB.value()).not.to.equal(0);
            expect(2 * constraintVarA.value()).to.equal(constraintVarB.value());

            // c
            let constraintVarC = new Cassowary.ClVariable('c', c);

            /*
             * Second Constraint
             */
            let linearEquation2 = constraintVarA.plus(constraintVarC).cnEquals(constraintVarB);
            solver.addConstraint(linearEquation2);
            solver.solveConstraints();

            expect(constraintVarA.value()).not.to.equal(0);
            expect(constraintVarB.value()).not.to.equal(0);
            expect(constraintVarC.value()).not.to.equal(0);
            expect(2 * constraintVarA.value()).to.equal(constraintVarB.value());
            expect(constraintVarA.value() + constraintVarC.value()).to.equal(constraintVarB.value());

            /*
             * Assignment to B
             */
            constraintVarB.set_value(3000);
            constraintVarB.suggestValue(3000);

            expect(constraintVarB.value()).to.equal(3000);
            expect(2 * constraintVarA.value()).to.equal(constraintVarB.value());
            expect(constraintVarA.value() + constraintVarC.value()).to.equal(constraintVarB.value());
        });

        // identify, what the source transformation should do
        it('mimicing rewriter', function() {
            let a = 2, b = 3, c = 5;

            let solver = Cassowary.ClSimplexSolver.getInstance();

            // a
            let constraintVarA = new Cassowary.ClVariable('a', a);
            solver._constraintVariablesByVariables.set('a', constraintVarA);
            aexpr(() => a).onChange(val => constraintVarA.set_value(val));
            aexpr(() => constraintVarA.value()).onChange(val => a = val);

            // b
            let constraintVarB = new Cassowary.ClVariable('b', b);
            solver._constraintVariablesByVariables.set('b', constraintVarB);
            aexpr(() => b).onChange(val => constraintVarB.set_value(val));
            aexpr(() => constraintVarB.value()).onChange(val => b = val);

            /*
             * Initial Constraint Solving
             */
            console.log('BEFORE INITIAL CONSTRAINT CONSTRUCTION',
                constraintVarA.toString(), a,
                constraintVarB.toString(), b
            );
            //always: 2 * a == b;
            let linearEquation = constraintVarA.times(2).cnEquals(constraintVarB);
            solver.addConstraint(linearEquation);

            trigger(aexpr(() => 2 * constraintVarA.value() == constraintVarB.value()))
                .onBecomeFalse(() => solver.solveConstraints());

            expect(a).not.to.equal(0);
            expect(b).not.to.equal(0);
            expect(2 * a).to.equal(b);

            console.log('AFTER INITIAL CONSTRAINT CONSTRUCTION',
                constraintVarA.toString(), a,
                constraintVarB.toString(), b
            );

            /*
             * Assignment to A
             */
            console.log('ASSIGNMENT TO A',
                constraintVarA.toString(), a,
                constraintVarB.toString(), b
            );
            a = 10;
            //constraintVarA.suggestValue(10);
            //solver.solveConstraints();

            expect(a).to.equal(10);
            expect(b).not.to.equal(0);
            expect(2 * a).to.equal(b);

            /*
             * Second Constraint
             */
            // c
            let constraintVarC = new Cassowary.ClVariable('c', c);
            solver._constraintVariablesByVariables.set('c', constraintVarC);
            aexpr(() => c).onChange(val => constraintVarC.set_value(val));
            aexpr(() => constraintVarC.value()).onChange(val => c = val);

            console.log('SECOND CONSTRAINT',
                constraintVarA.toString(), a,
                constraintVarB.toString(), b,
                constraintVarC.toString(), c
            );
            let linearEquation2 = constraintVarA.plus(constraintVarC).cnEquals(constraintVarB);
            solver.addConstraint(linearEquation2);
            trigger(aexpr(() => constraintVarA.value() + constraintVarC.value() == constraintVarB.value()))
                .onBecomeFalse(() => solver.solveConstraints());

            console.log('SECOND CONSTRAINT AFTER SOLVING',
                constraintVarA.toString(), a,
                constraintVarB.toString(), b,
                constraintVarC.toString(), c
            );
            expect(a).not.to.equal(0);
            expect(b).not.to.equal(0);
            expect(c).not.to.equal(0);
            expect(2 * a).to.equal(b);
            expect(a + c).to.equal(b);

            /*
             * Assignment to B
             */
            b = 3000;
            //constraintVarB.suggestValue(3000);
            //solver.solveConstraints();

            console.log('ASSIGNMENT TO B',
                constraintVarA.toString(), a,
                constraintVarB.toString(), b,
                constraintVarC.toString(), c
            );
            expect(b).to.equal(3000);
            expect(2 * a).to.equal(b);
            expect(a + c).to.equal(b);
        });

        // using the source transformation
        it('test applying rewriter', function() {
            let a = 2, b = 3, c = 5;

            always: 2 * a == b; // a = 1.5, b = 3

            expect(a).not.to.equal(0);
            expect(b).not.to.equal(0);
            expect(2 * a).to.equal(b);

            a = 10; // a = 10, b = 20

            expect(a).to.equal(10);
            expect(b).not.to.equal(0);
            expect(2 * a).to.equal(b);

            always: a + c == b; // a = 10, b = 20, c = 10

            expect(a).not.to.equal(0);
            expect(b).not.to.equal(0);
            expect(c).not.to.equal(0);
            expect(2 * a).to.equal(b);
            expect(a + c).to.equal(b);

            b = 3000; // a = 1500, b = 3000, c = 1500

            expect(b).to.equal(3000);
            expect(2 * a).to.equal(b);
            expect(a + c).to.equal(b);
        });
    });

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

    // TODO: same variables in different scopes
    xit('involve multiple constraints', function() {
        let _scope = {};
        let a = 2, b = 3;

        //always: 2 * a == b;
        {
            let solver = Cassowary.ClSimplexSolver.getInstance();

            // a
            let constraintVarA = solver.getConstraintVariableFor(_scope, 'a', () => {
                let _constraintVar = new Cassowary.ClVariable('a', a);
                aexpr(() => a).onChange(val => _constraintVar.set_value(val));
                aexpr(() => _constraintVar.value()).onChange(val => a = val);
                return _constraintVar;
            });

            // global b
            let constraintVarB = solver.getConstraintVariableFor(_scope, 'b', () => {
                let _constraintVar = new Cassowary.ClVariable('b', b);
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
                    aexpr(() => a).onChange(val => _constraintVar.set_value(val));
                    aexpr(() => _constraintVar.value()).onChange(val => a = val);
                    return _constraintVar;
                });

                // local b
                let constraintVarB = solver.getConstraintVariableFor(_scope2, 'b', () => {
                    let _constraintVar = new Cassowary.ClVariable('b', b);
                    aexpr(() => b).onChange(val => _constraintVar.set_value(val));
                    aexpr(() => _constraintVar.value()).onChange(val => b = val);
                    return _constraintVar;
                });

                // c
                let constraintVarC = solver.getConstraintVariableFor(_scope2, 'c', () => {
                    let _constraintVar = new Cassowary.ClVariable('c', c);
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

    it('two constraints with assignment', function() {
        var a = 2, b = 3, c = 10;

        always: 2 * a + 3 * b == c;
        expect(2 * a + 3 * b).to.equal(c);

        always: 2 * a == b;
        expect(2 * a + 3 * b).to.equal(c);
        expect(2 * a).to.equal(b);

        c = 42;
        expect(2 * a + 3 * b).to.equal(c);
        expect(2 * a).to.equal(b);
    });

    it('rewrite test with assignment', function() {
        var a = 2, b = 3, c = 10;

        always: 2 * a + 3 * b == c;
        expect(2 * a + 3 * b).to.equal(c);

        c = 42;
        expect(2 * a + 3 * b).to.equal(c);
    });
});
