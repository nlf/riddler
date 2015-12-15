'use strict';

// Load modules

const Hoek = require('hoek');
const Querystring = require('querystring');

// Declare internals

const internals = {};


internals.defaults = {
    separator: '&',
    assignment: '=',
    unescape: Querystring.unescape
};


internals.array = /^\[([0-9]+)\]/;

internals.object = /^\[([^\]]+)\]/;


module.exports = internals.Riddler = function (options) {

    Hoek.assert(this instanceof internals.Riddler, 'Riddler must be instantiated using new');

    options = Object.assign({}, options);
    options = Hoek.applyToDefaultsWithShallow(internals.defaults, options, ['unescape']);

    this.settings = options;
};


internals.Riddler.prototype._genSteps = function (path) {

    const original = path;
    const steps = [];
    const firstKey = path.slice(0, path.indexOf('['));

    if (firstKey === '') {
        steps.push({
            type: 'object',
            key: original,
            last: true
        });

        return steps;
    }

    path = path.slice(firstKey.length);
    steps.push({
        type: 'object',
        key: firstKey,
        last: false
    });

    while (path !== '') {
        if (path.slice(0, 2) === '[]') {
            steps[steps.length - 1].append = true;
            path = path.slice(2);
            if (path !== '') {
                return [{
                    type: 'object',
                    key: original,
                    last: true
                }];
            }
        }
        else if (internals.array.test(path)) {
            const match = internals.array.exec(path);
            const index = parseInt(match[1], 10);
            path = path.slice(match[0].length);
            steps.push({
                type: 'array',
                key: index,
                last: false
            });
        }
        else if (internals.object.test(path)) {
            const match = internals.object.exec(path);
            const key = match[1];
            path = path.slice(match[0].length);
            steps.push({
                type: 'object',
                key: key,
                last: false
            });
        }
        else {
            return [{
                type: 'object',
                key: original,
                last: true
            }];
        }
    }

    for (let i = 0; i < steps.length - 1; ++i) {
        steps[i].nextType = steps[i + 1].type;
    }
    steps[steps.length - 1].last = true;

    return steps;
};


internals.Riddler.prototype._runStep = function (step, context, value) {

    const current = context[step.key];
    if (step.last) {
        if (typeof current === 'undefined') {
            if (step.append) {
                context[step.key] = [value];
            }
            else {
                context[step.key] = value;
            }
        }
        else if (Array.isArray(current)) {
            context[step.key].push(value);
        }
        else if (typeof current === 'object' &&
                 current !== null) {

            return this._runStep({ type: 'object', key: '', last: true }, current, value);
        }
        else {
            context[step.key] = [current, value];
        }

        return context;
    }

    if (typeof current === 'undefined') {
        if (step.nextType === 'array') {
            context[step.key] = [];
        }
        else {
            context[step.key] = {};
        }
        return context[step.key];
    }

    if (typeof current === 'object' &&
             current !== null) {

        return context[step.key];
    }

    if (Array.isArray(current)) {
        if (step.nextType === 'array') {
            return current;
        }

        const result = {};
        for (let i = 0; i < current.length; ++i) {
            result[i] = current[i];
        }

        context[step.key] = result;
        return result;
    }

    const result = {};
    result[''] = current;
    context[step.key] = result;
    return result;
};


internals.Riddler.prototype.parse = function (str) {

    const obj = Querystring.parse(str, this.settings.separator, this.settings.assignment, { decodeURIComponent: this.settings.unescape });
    const result = {};
    let context = result;
    for (const path in obj) {
        const steps = this._genSteps(path);
        for (const step of steps) {
            context = this._runStep(step, context, obj[path]);
        }
        context = result;
    }

    return result;
};


internals.Riddler.prototype.stringify = function (obj) {
};
