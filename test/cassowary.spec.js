import withLogging from '../src/withlogging.js';
import select from '../src/select.js';
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
import trigger from 'aexpr-trigger';

describe('Cassowary', function() {
    beforeEach(() => Cassowary.ClSimplexSolver.resetInstance());

    it('two-way data binding', function() {
        let a = 2,
            constraintVarA = new Cassowary.ClVariable('a', a);

        expect(a).to.equal(constraintVarA._value);

        // Two-way data binding
        aexpr(() => a).onChange(val => constraintVarA._value = val);
        aexpr(() => constraintVarA._value).onChange(val => a = val);

        expect(a).to.equal(constraintVarA._value);

        a = 10;

        expect(a).to.equal(10);
        expect(a).to.equal(constraintVarA._value);

        constraintVarA._value = 20;

        expect(a).to.equal(20);
        expect(a).to.equal(constraintVarA._value);
    });

    it('simple equality', function() {
        let a = 1.5, b = 3;

        //always: 2 * a == b;
        {
            // a
            let constraintVarA = new Cassowary.ClVariable('a', a);
            constraintVarA.stay(Cassowary.ClStrength.weak);
            aexpr(() => a).onChange(val => constraintVarA._value = val);
            aexpr(() => constraintVarA._value).onChange(val => a = val);

            // b
            let constraintVarB = new Cassowary.ClVariable('b', b);
            constraintVarB.stay(Cassowary.ClStrength.weak);
            aexpr(() => b).onChange(val => constraintVarB._value = val);
            aexpr(() => constraintVarB._value).onChange(val => b = val);

            let linearEquation = constraintVarA.times(2).cnEquals(constraintVarB);
            let solver = Cassowary.ClSimplexSolver.getInstance();
            solver.addConstraint(linearEquation);

            trigger(aexpr(() => 2 * constraintVarA._value == constraintVarB._value))
                .onBecomeFalse(() => {
                    solver._fNeedsSolving = true;
                    solver.solve();
                });
        }

        expect(2 * a).to.equal(b);

        a = 10;
        expect(2 * a).to.equal(b);

        b = 3000;
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
        debugger
        solver.addConstraint(linExpr);
        solver.solve();

        expect(a.value()).to.equal(b.value());
    });

    xit('rewrite test', function() {
        var a = 2, b = 3, c = 10;
        always: 2 * a + 3 * b == c;

        expect(2 * a + 3 * b).to.equal(c);
    });
});
