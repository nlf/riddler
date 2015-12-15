'use strict';

// Load modules

const Code = require('code');
const Lab = require('lab');
const Riddler = require('..');

// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

describe('parse()', () => {

    it('ignores invalid paths', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a[b=c&a[d]=e');
        expect(parsed).to.deep.equal({
            'a[b': 'c',
            a: {
                d: 'e'
            }
        });

        done();
    });

    it('can parse a simple string', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a=b');
        expect(parsed).to.deep.equal({
            a: 'b'
        });

        done();
    });

    it('can parse an implicit array', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a=b&a=c');
        expect(parsed).to.deep.equal({
            a: ['b', 'c']
        });

        done();
    });

    it('can parse an array without an index', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a[]=b');
        expect(parsed).to.deep.equal({
            a: ['b']
        });

        done();
    });

    it('creates a non-indexed array in a subkey', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a[b][]=c');
        expect(parsed).to.deep.equal({
            a: {
                b: ['c']
            }
        });

        done();
    });

    it('refuses to create a non-indexed array when it contains a subkey', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a[][b]=c');
        expect(parsed).to.deep.equal({
            'a[][b]': 'c'
        });

        done();
    });

    it('can parse an array with a specific index', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a[0]=b');
        expect(parsed).to.deep.equal({
            a: ['b']
        });

        done();
    });

    it('can parse an array with multiple items', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a[0]=b&a[1]=c');
        expect(parsed).to.deep.equal({
            a: ['b', 'c']
        });

        done();
    });

    it('can create a sparse array', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a[1]=b');
        expect(parsed).to.deep.equal({
            a: [undefined, 'b']
        });

        done();
    });

    it('can create a sparse array with multiple entries', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a[1]=b&a[3]=c');
        expect(parsed).to.deep.equal({
            a: [undefined, 'b', undefined, 'c']
        });

        done();
    });

    it('can create a nested implicit array', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a[b][0]=c&a[b][1]=d');
        expect(parsed).to.deep.equal({
            a: {
                b: ['c', 'd']
            }
        });

        done();
    });

    it('can create a nested repeated array', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a[b]=c&a[b]=d&a[b]=e');
        expect(parsed).to.deep.equal({
            a: {
                b: ['c', 'd', 'e']
            }
        });

        done();
    });

    it('can create a deeper nested repeated array', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a[b][c]=d&a[b][c]=e&a[b][c]=f');
        expect(parsed).to.deep.equal({
            a: {
                b: {
                    c: ['d', 'e', 'f']
                }
            }
        });

        done();
    });

    it('can parse an object with a single key', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a[b]=c');
        expect(parsed).to.deep.equal({
            a: {
                b: 'c'
            }
        });

        done();
    });

    it('can parse an object with multiple keys', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a[b]=c&a[d]=e');
        expect(parsed).to.deep.equal({
            a: {
                b: 'c',
                d: 'e'
            }
        });

        done();
    });

    it('can parse an object with a nested key', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a[b][c]=d');
        expect(parsed).to.deep.equal({
            a: {
                b: {
                    c: 'd'
                }
            }
        });

        done();
    });

    it('can create object and arrays together', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a[b][c]=d&a[c][0]=e');
        expect(parsed).to.deep.equal({
            a: {
                b: {
                    c: 'd'
                },
                c: ['e']
            }
        });

        done();
    });

    it('can create an implicit array of objects', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a[0][b]=c&a[0][b]=d');
        expect(parsed).to.deep.equal({
            a: [{
                b: ['c', 'd']
            }]
        });

        done();
    });

    it('can create an array of objects', (done) => {

        const riddler = new Riddler();
        const parsed = riddler.parse('a[0][b]=c&a[0][d][0]=e');
        expect(parsed).to.deep.equal({
            a: [{
                b: 'c',
                d: ['e']
            }]
        });

        done();
    });
});
