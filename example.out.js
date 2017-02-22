let _scope2 = {
  name: '_scope2'
};

const signals = [],
      defineSignal = function (scope, name, init, solve) {
  let signal = new Signal(scope, name, init, solve);
  signals.push(signal);
  return signal.initialize();
},
      resolveSignals = function (starting) {
  let startingIndex = signals.indexOf(starting);
  signals.filter((s, i) => i >= startingIndex).forEach(s => {
    s.resolve();
    s.initialize();
  });
},
      getLocal = function (scope, name) {
  if (Signal.determineDepencencies) {
    Signal.currentSignal.addDependency(scope, name);
  }
},
      setLocal = function (scope, name) {
  if (Signal.solving) {
    return;
  }

  let triggeredSignal = signals.find(s => s.hasDependency(scope, name));

  if (triggeredSignal) {
    Signal.solving = true;
    resolveSignals(triggeredSignal);
    Signal.solving = false;
  }
};

const compositeKeyStore = new Map();

class Signal {
  constructor(scope, name, init, solve) {
    this.scope = scope, this.name = name, this.init = init, this.solve = solve;
    this.dependencies = new Set();
  }

  initialize() {
    this.dependencies.clear();
    Signal.determineDepencencies = true;
    Signal.currentSignal = this;
    let result = this.init();
    Signal.determineDepencencies = false;
    Signal.currentSignal = undefined;
    return result;
  }

  addDependency(scope, name) {
    this.dependencies.add(CompositeKey.get(scope, name));
  }

  hasDependency(scope, name) {
    return this.dependencies.has(CompositeKey.get(scope, name));
  }

  resolve() {
    this.solve();
  }

}

Signal.currentSignal = undefined;
Signal.determineDepencencies = false;
Signal.solving = false;

class CompositeKey {
  static get(obj1, obj2) {
    if (!compositeKeyStore.has(obj1)) {
      compositeKeyStore.set(obj1, new Map());
    }

    let secondKeyMap = compositeKeyStore.get(obj1);

    if (!secondKeyMap.has(obj2)) {
      secondKeyMap.set(obj2, {});
    }

    return secondKeyMap.get(obj2);
  }

  static clear() {
    compositeKeyStore.clear();
  }

}

'prop1';
'prop1';
'prop1';
let obj = {
  prop1: 1,
  func() {
    return ((obj, prop) => {
      getLocal(obj, prop);
      return obj[prop];
    })(this, 'prop1');
  }
};
((obj, prop, value) => {
  let result = obj[prop] = value;
  setLocal(obj, prop);
  return result;
})(((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(window, window, 'window'), 'glob', 1);
function foo(a, b) {
  let _scope = {
    name: '_scope'
  };
  return ((result, scope, name) => {
    getLocal(scope, name);
    return result;
  })(a, _scope, 'a') + ((result, scope, name) => {
    getLocal(scope, name);
    return result;
  })(glob, window, 'glob');
}
let a = 0,
    b = 1;
let s = defineSignal(_scope2, 's', () => 1 + ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(a, _scope2, 'a') + ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(foo, _scope2, 'foo')(((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(a, _scope2, 'a'), ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(a, _scope2, 'a')), () => s = 1 + ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(a, _scope2, 'a') + ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(foo, _scope2, 'foo')(((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(a, _scope2, 'a'), ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(a, _scope2, 'a')));
let t = defineSignal(_scope2, 't', () => ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(s, _scope2, 's') + ((obj, prop) => {
  getLocal(obj, prop);
  return obj[prop];
})(((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(obj, _scope2, 'obj'), 'prop1') + ((obj, prop) => {
  getLocal(obj, prop);
  return obj[prop].bind(obj);
})(((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(obj, _scope2, 'obj'), 'func')(), () => t = ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(s, _scope2, 's') + ((obj, prop) => {
  getLocal(obj, prop);
  return obj[prop];
})(((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(obj, _scope2, 'obj'), 'prop1') + ((obj, prop) => {
  getLocal(obj, prop);
  return obj[prop].bind(obj);
})(((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(obj, _scope2, 'obj'), 'func')());
((obj, prop) => {
  getLocal(obj, prop);
  return obj[prop].bind(obj);
})(((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(console, window, 'console'), 'log')(['init(2,3) ', ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(s, _scope2, 's'), ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(t, _scope2, 't')]);

((result, scope, name) => {
  setLocal(scope, name);
  return result;
})(a = 42, _scope2, 'a');
((obj, prop) => {
  getLocal(obj, prop);
  return obj[prop].bind(obj);
})(((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(console, window, 'console'), 'log')(['local(86,87) ', ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(s, _scope2, 's'), ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(t, _scope2, 't')]);

((obj, prop, value) => {
  let result = obj[prop] = value;
  setLocal(obj, prop);
  return result;
})(((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(obj, _scope2, 'obj'), 'prop1', 17);
((obj, prop) => {
  getLocal(obj, prop);
  return obj[prop].bind(obj);
})(((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(console, window, 'console'), 'log')(['obj.props(86,117) ', ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(s, _scope2, 's'), ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(t, _scope2, 't')]);

((result, scope, name) => {
  setLocal(scope, name);
  return result;
})(glob = 12, window, 'glob');
((obj, prop) => {
  getLocal(obj, prop);
  return obj[prop].bind(obj);
})(((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(console, window, 'console'), 'log')(['globals(97,131) ', ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(s, _scope2, 's'), ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(t, _scope2, 't')]);

((result, scope, name) => {
  setLocal(scope, name);
  return result;
})(a += 1, _scope2, 'a') - 1;
((obj, prop) => {
  getLocal(obj, prop);
  return obj[prop].bind(obj);
})(((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(console, window, 'console'), 'log')(['update expr(99,133) ', ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(s, _scope2, 's'), ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(t, _scope2, 't')]);

((obj, prop, value) => {
  let result = obj[prop] = value;
  setLocal(obj, prop);
  return result;
})(((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(obj, _scope2, 'obj'), 'func', function () {
  return ((obj, prop) => {
    getLocal(obj, prop);
    return obj[prop];
  })(this, 'prop1') * 2;
});
((obj, prop) => {
  getLocal(obj, prop);
  return obj[prop].bind(obj);
})(((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(console, window, 'console'), 'log')(['func(99,150) ', ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(s, _scope2, 's'), ((result, scope, name) => {
  getLocal(scope, name);
  return result;
})(t, _scope2, 't')]);