/* globals Bottle */
;(function() {
    'use strict';

    /**
     * Bottle Provider test suite
     */
    describe('Bottle#provider', function() {
        it('will log an error if the same key is used twice', function() {
            var b = new Bottle();

            spyOn(console, 'error');
            b.provider('same', function(){ });
            expect(console.error).not.toHaveBeenCalled();

            b.provider('same', function(){ });
            expect(console.error).toHaveBeenCalled();
        });
        it('creates a provider instance on the container', function() {
            var b = new Bottle();
            var ThingProvider = function() { };
            b.provider('Thing', ThingProvider);
            expect(b.container.ThingProvider instanceof ThingProvider).toBe(true);
        });
        it('lazily creates the provider when accessed', function() {
            var i = 0;
            var b = new Bottle();
            b.provider('Thing', function() { i = ++i; });

            expect(i).toBe(0);
            expect(b.container.ThingProvider).toBeDefined();
            expect(i).toBe(1);
        });
        it('uses the $get method to create services, and passes a container', function() {
            var b = new Bottle();
            var Thing = function() {};
            var ThingProvider = function() { this.$get = function() { return new Thing(); }; };
            b.provider('Thing', ThingProvider);

            var provider = b.container.ThingProvider;
            spyOn(provider, '$get').and.callThrough();
            expect(b.container.Thing instanceof Thing).toBe(true);
            expect(provider.$get).toHaveBeenCalledWith(b.container);
        });

        it('lazily creates the service it provides', function() {
            var i = 0;
            var b = new Bottle();
            var Thing = function() { i++; };
            var ThingProvider = function() { this.$get = function() { return new Thing(); }; };

            b.provider('Thing', ThingProvider);
            expect(i).toBe(0);
            expect(b.container.Thing instanceof Thing).toBe(true);
            expect(i).toBe(1);
        });

        it('removes the provider after the service is accessed', function() {
            var b = new Bottle();
            b.provider('Thing', function() { this.$get = function() { return 'test'; }; });
            expect(b.container.ThingProvider).toBeDefined();
            expect(b.container.Thing).toBeDefined();
            expect(b.container.ThingProvider).not.toBeDefined();
        });

        it('will nest bottle containers if the service name uses dot notation', function() {
            var b = new Bottle();
            var Thing = function() {};
            var ThingProvider = function() { this.$get = function() { return new Thing(); }; };
            b.provider('Util.Thing', ThingProvider);
            expect(b.container.Util).toBeDefined();
            expect(b.container.Util.ThingProvider).toBeDefined();
            expect(b.container.Util.Thing).toBeDefined();
        });

        it('Allows falsey values returned by $get to remain defined when accessed multiple times', function() {
            var b = new Bottle();
            var NullyProvider = function() { this.$get = function() { return null; }; };
            var EmptyProvider = function() { this.$get = function() { return ''; }; };
            var FalseyProvider = function() { this.$get = function() { return false; }; };
            var ZeroProvider = function() { this.$get = function() { return 0; }; };

            b.provider('Nully', NullyProvider);
            b.provider('Empty', EmptyProvider);
            b.provider('Falsey', FalseyProvider);
            b.provider('Zero', ZeroProvider);

            expect(b.container.Nully).toBe(null);
            expect(b.container.Nully).toBe(null);
            expect(b.container.Empty).toBe('');
            expect(b.container.Empty).toBe('');
            expect(b.container.Falsey).toBe(false);
            expect(b.container.Falsey).toBe(false);
            expect(b.container.Zero).toBe(0);
            expect(b.container.Zero).toBe(0);
        });
    });
}());
