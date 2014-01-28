/*global defineSuite*/
defineSuite([
             'DataSource/ImageMaterialProperty',
             'DataSource/ConstantProperty',
             'DataSource/TimeIntervalCollectionProperty',
             'Core/Cartesian2',
             'Core/JulianDate',
             'Core/TimeInterval'
     ], function(
             ImageMaterialProperty,
             ConstantProperty,
             TimeIntervalCollectionProperty,
             Cartesian2,
             JulianDate,
             TimeInterval) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    it('constructor provides the expected defaults', function() {
        var property = new ImageMaterialProperty();
        expect(property.getType()).toEqual('Image');

        var result = property.getValue();
        expect(result.image).toBeUndefined();
        expect(result.repeat).toEqual(new Cartesian2(1.0, 1.0));
    });

    it('works with constant values', function() {
        var property = new ImageMaterialProperty();
        property.image = new ConstantProperty('http://test.invalid/image.png');
        property.repeat = new ConstantProperty(new Cartesian2(2, 3));

        var result = property.getValue(new JulianDate());
        expect(result.image).toEqual('http://test.invalid/image.png');
        expect(result.repeat).toEqual(new Cartesian2(2, 3));
    });

    it('works with undefined values', function() {
        var property = new ImageMaterialProperty();
        property.image = new ConstantProperty();
        property.repeat = new ConstantProperty();

        var result = property.getValue();
        expect(result.hasOwnProperty('image')).toEqual(true);
        expect(result.hasOwnProperty('repeat')).toEqual(true);
        expect(result.image).toBeUndefined();
        expect(result.repeat).toBeUndefined();
    });

    it('works with dynamic values', function() {
        var property = new ImageMaterialProperty();
        property.image = new TimeIntervalCollectionProperty();
        property.repeat = new TimeIntervalCollectionProperty();

        var start = new JulianDate(1, 0);
        var stop = new JulianDate(2, 0);
        property.image.intervals.addInterval(new TimeInterval(start, stop, true, true, 'http://test.invalid/image.png'));
        property.repeat.intervals.addInterval(new TimeInterval(start, stop, true, true, new Cartesian2(2, 3)));

        var result = property.getValue(start);
        expect(result.image).toEqual('http://test.invalid/image.png');
        expect(result.repeat).toEqual(new Cartesian2(2, 3));
    });

    it('works with a result parameter', function() {
        var property = new ImageMaterialProperty();
        property.image = new ConstantProperty('http://test.invalid/image.png');
        property.repeat = new ConstantProperty(new Cartesian2(2, 3));

        var result = {};
        var returnedResult = property.getValue(new JulianDate(), result);
        expect(result).toBe(returnedResult);
        expect(result.image).toEqual('http://test.invalid/image.png');
        expect(result.repeat).toEqual(new Cartesian2(2, 3));
    });

    it('equals works', function() {
        var left = new ImageMaterialProperty();
        left.image = new ConstantProperty('http://test.invalid/image.png');
        left.repeat = new ConstantProperty(new Cartesian2(2, 3));

        var right = new ImageMaterialProperty();
        right.image = new ConstantProperty('http://test.invalid/image.png');
        right.repeat = new ConstantProperty(new Cartesian2(2, 3));

        expect(left.equals(right)).toEqual(true);

        right.image = new ConstantProperty('http://test.invalid/image2.png');
        expect(left.equals(right)).toEqual(false);

        right.image = left.image;
        right.repeat = new ConstantProperty(new Cartesian2(3, 2));
        expect(left.equals(right)).toEqual(false);

        right.repeat = left.repeat;
        expect(left.equals(right)).toEqual(true);
    });

    it('raises definitionChanged when a property is assigned or modified', function() {
        var property = new ImageMaterialProperty();
        spyOn(property.definitionChanged, 'raiseEvent');

        property.image = new ConstantProperty('http://test.invalid/image.png');
        expect(property.definitionChanged.raiseEvent).toHaveBeenCalledWith(property);
        property.definitionChanged.raiseEvent.reset();

        property.image.setValue('http://test.invalid/image2.png');
        expect(property.definitionChanged.raiseEvent).toHaveBeenCalledWith(property);
        property.definitionChanged.raiseEvent.reset();

        property.image = property.image;
        expect(property.definitionChanged.raiseEvent.callCount).toEqual(0);
        property.definitionChanged.raiseEvent.reset();

        property.repeat = new ConstantProperty(new Cartesian2(1.5, 1.5));
        expect(property.definitionChanged.raiseEvent).toHaveBeenCalledWith(property);
        property.definitionChanged.raiseEvent.reset();

        property.repeat.setValue(new Cartesian2(1.0, 1.0));
        expect(property.definitionChanged.raiseEvent).toHaveBeenCalledWith(property);
        property.definitionChanged.raiseEvent.reset();

        property.repeat = property.repeat;
        expect(property.definitionChanged.raiseEvent.callCount).toEqual(0);
    });

    it('isConstant is only true when all properties are constant or undefined', function() {
        var property = new ImageMaterialProperty();
        expect(property.isConstant).toBe(true);

        property.image = undefined;
        property.repeat = undefined;
        expect(property.isConstant).toBe(true);

        var start = new JulianDate(1, 0);
        var stop = new JulianDate(2, 0);
        property.image = new TimeIntervalCollectionProperty();
        property.image.intervals.addInterval(new TimeInterval(start, stop, true, true, 'http://test.invalid/image.png'));
        expect(property.isConstant).toBe(false);

        property.image = undefined;
        expect(property.isConstant).toBe(true);
        property.repeat = new TimeIntervalCollectionProperty();
        property.repeat.intervals.addInterval(new TimeInterval(start, stop, true, true, new Cartesian2(2, 3)));
        expect(property.isConstant).toBe(false);
    });
});