/*global defineSuite*/
defineSuite(['DataSource/PolylineOutlineMaterialProperty',
             'DataSource/ConstantProperty',
             'DataSource/TimeIntervalCollectionProperty',
             'Core/Color',
             'Core/JulianDate',
             'Core/TimeInterval'
     ], function(
             PolylineOutlineMaterialProperty,
             ConstantProperty,
             TimeIntervalCollectionProperty,
             Color,
             JulianDate,
             TimeInterval) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    it('constructor provides the expected defaults', function() {
        var property = new PolylineOutlineMaterialProperty();
        expect(property.getType()).toEqual('PolylineOutline');

        var result = property.getValue();
        expect(result.color).toEqual(Color.WHITE);
        expect(result.outlineColor).toEqual(Color.BLACK);
        expect(result.outlineWidth).toEqual(0.0);
    });

    it('works with constant values', function() {
        var property = new PolylineOutlineMaterialProperty();
        property.color = new ConstantProperty(Color.RED);
        property.outlineColor = new ConstantProperty(Color.BLUE);

        var result = property.getValue(new JulianDate());
        expect(result.color).toEqual(Color.RED);
        expect(result.outlineColor).toEqual(Color.BLUE);
    });

    it('works with undefined values', function() {
        var property = new PolylineOutlineMaterialProperty();
        property.color.setValue(undefined);
        property.outlineColor.setValue(undefined);

        var result = property.getValue();
        expect(result.hasOwnProperty('color')).toEqual(true);
        expect(result.hasOwnProperty('outlineColor')).toEqual(true);
        expect(result.color).toBeUndefined();
        expect(result.outlineColor).toBeUndefined();
    });

    it('works with dynamic values', function() {
        var property = new PolylineOutlineMaterialProperty();
        property.color = new TimeIntervalCollectionProperty();
        property.outlineColor = new TimeIntervalCollectionProperty();

        var start = new JulianDate(1, 0);
        var stop = new JulianDate(2, 0);
        property.color.intervals.addInterval(new TimeInterval(start, stop, true, true, Color.BLUE));
        property.outlineColor.intervals.addInterval(new TimeInterval(start, stop, true, true, Color.RED));

        var result = property.getValue(start);
        expect(result.color).toEqual(Color.BLUE);
        expect(result.outlineColor).toEqual(Color.RED);
    });

    it('works with a result parameter', function() {
        var property = new PolylineOutlineMaterialProperty();
        property.color = new ConstantProperty(Color.RED);
        property.outlineColor = new ConstantProperty(Color.BLUE);

        var result = {
            color : Color.YELLOW.clone(),
            outlineColor : Color.BROWN.clone()
        };
        var returnedResult = property.getValue(new JulianDate(), result);
        expect(returnedResult).toBe(result);
        expect(result.color).toEqual(Color.RED);
        expect(result.outlineColor).toEqual(Color.BLUE);
    });

    it('equals works', function() {
        var left = new PolylineOutlineMaterialProperty();
        left.color = new ConstantProperty(Color.WHITE);
        left.outlineColor = new ConstantProperty(Color.BLACK);
        left.outlineWidth = new ConstantProperty(5);

        var right = new PolylineOutlineMaterialProperty();
        right.color = new ConstantProperty(Color.WHITE);
        right.outlineColor = new ConstantProperty(Color.BLACK);
        right.outlineWidth = new ConstantProperty(5);
        expect(left.equals(right)).toEqual(true);

        right.color = new ConstantProperty(Color.RED);
        expect(left.equals(right)).toEqual(false);

        right.color = left.color;
        right.outlineColor = new ConstantProperty(Color.BLUE);
        expect(left.equals(right)).toEqual(false);

        right.outlineColor = left.outlineColor;
        right.outlineWidth = new ConstantProperty(6);
        expect(left.equals(right)).toEqual(false);
    });

    it('raises definitionChanged when a property is assigned or modified', function() {
        var property = new PolylineOutlineMaterialProperty();
        spyOn(property.definitionChanged, 'raiseEvent');

        property.color = new ConstantProperty(Color.RED);
        expect(property.definitionChanged.raiseEvent).toHaveBeenCalledWith(property);
        property.definitionChanged.raiseEvent.reset();

        property.color.setValue(Color.YELLOW);
        expect(property.definitionChanged.raiseEvent).toHaveBeenCalledWith(property);
        property.definitionChanged.raiseEvent.reset();

        property.color = property.color;
        expect(property.definitionChanged.raiseEvent.callCount).toEqual(0);
        property.definitionChanged.raiseEvent.reset();

        property.outlineColor = new ConstantProperty(Color.BLUE);
        expect(property.definitionChanged.raiseEvent).toHaveBeenCalledWith(property);
        property.definitionChanged.raiseEvent.reset();

        property.outlineColor.setValue(Color.GREEN);
        expect(property.definitionChanged.raiseEvent).toHaveBeenCalledWith(property);
        property.definitionChanged.raiseEvent.reset();

        property.outlineColor = property.outlineColor;
        expect(property.definitionChanged.raiseEvent.callCount).toEqual(0);

        property.outlineWidth = new ConstantProperty(2.5);
        expect(property.definitionChanged.raiseEvent).toHaveBeenCalledWith(property);
        property.definitionChanged.raiseEvent.reset();

        property.outlineWidth.setValue(1.5);
        expect(property.definitionChanged.raiseEvent).toHaveBeenCalledWith(property);
        property.definitionChanged.raiseEvent.reset();

        property.outlineWidth = property.outlineWidth;
        expect(property.definitionChanged.raiseEvent.callCount).toEqual(0);
    });

    it('isConstant is only true when all properties are constant or undefined', function() {
        var property = new PolylineOutlineMaterialProperty();
        expect(property.isConstant).toBe(true);

        property.color = undefined;
        property.outlineColor = undefined;
        property.outlineWidth = undefined;
        expect(property.isConstant).toBe(true);

        var start = new JulianDate(1, 0);
        var stop = new JulianDate(2, 0);
        property.color = new TimeIntervalCollectionProperty();
        property.color.intervals.addInterval(new TimeInterval(start, stop, true, true, Color.RED));
        expect(property.isConstant).toBe(false);

        property.color = undefined;
        expect(property.isConstant).toBe(true);
        property.outlineColor = new TimeIntervalCollectionProperty();
        property.outlineColor.intervals.addInterval(new TimeInterval(start, stop, true, true, Color.BLUE));
        expect(property.isConstant).toBe(false);

        property.outlineColor = undefined;
        expect(property.isConstant).toBe(true);
        property.outlineWidth = new TimeIntervalCollectionProperty();
        property.outlineWidth.intervals.addInterval(new TimeInterval(start, stop, true, true, 2.0));
        expect(property.isConstant).toBe(false);
    });
});