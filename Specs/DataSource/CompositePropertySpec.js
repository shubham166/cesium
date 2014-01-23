/*global defineSuite*/
defineSuite([
             'DataSource/CompositeProperty',
             'DataSource/ConstantProperty',
             'Core/Cartesian3',
             'Core/JulianDate',
             'Core/TimeInterval',
             'Core/TimeIntervalCollection'
     ], function(
             CompositeProperty,
             ConstantProperty,
             Cartesian3,
             JulianDate,
             TimeInterval,
             TimeIntervalCollection) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    it('default constructor has expected values', function() {
        var property = new CompositeProperty();
        expect(property.intervals).toBeInstanceOf(TimeIntervalCollection);
        expect(property.getValue(new JulianDate())).toBeUndefined();
    });

    it('works without a result parameter', function() {
        var interval1 = new TimeInterval(new JulianDate(10, 0), new JulianDate(12, 0), true, true, new ConstantProperty(new Cartesian3(1, 2, 3)));
        var interval2 = new TimeInterval(new JulianDate(12, 0), new JulianDate(14, 0), false, true, new ConstantProperty(new Cartesian3(4, 5, 6)));

        var property = new CompositeProperty();
        property.intervals.addInterval(interval1);
        property.intervals.addInterval(interval2);

        var result1 = property.getValue(interval1.start);
        expect(result1).not.toBe(interval1.data.getValue(interval1.start));
        expect(result1).toEqual(interval1.data.getValue(interval1.start));

        var result2 = property.getValue(interval2.stop);
        expect(result2).not.toBe(interval2.data.getValue(interval2.stop));
        expect(result2).toEqual(interval2.data.getValue(interval2.stop));
    });

    it('works with a result parameter', function() {
        var interval1 = new TimeInterval(new JulianDate(10, 0), new JulianDate(12, 0), true, true, new ConstantProperty(new Cartesian3(1, 2, 3)));
        var interval2 = new TimeInterval(new JulianDate(12, 0), new JulianDate(14, 0), false, true, new ConstantProperty(new Cartesian3(4, 5, 6)));

        var property = new CompositeProperty();
        property.intervals.addInterval(interval1);
        property.intervals.addInterval(interval2);

        var expected = new Cartesian3();
        var result1 = property.getValue(interval1.start, expected);
        expect(result1).toBe(expected);
        expect(result1).toEqual(interval1.data.getValue(interval1.start));

        var result2 = property.getValue(interval2.stop, expected);
        expect(result2).toBe(expected);
        expect(result2).toEqual(interval2.data.getValue(interval2.stop));
    });

    it('equals works', function() {
        var interval1 = new TimeInterval(new JulianDate(10, 0), new JulianDate(12, 0), true, true, new ConstantProperty(new Cartesian3(1, 2, 3)));
        var interval2 = new TimeInterval(new JulianDate(12, 0), new JulianDate(14, 0), false, true, new ConstantProperty(new Cartesian3(4, 5, 6)));

        var left = new CompositeProperty();
        left.intervals.addInterval(interval1);
        left.intervals.addInterval(interval2);

        var right = new CompositeProperty();
        right.intervals.addInterval(interval1);
        expect(left.equals(right)).toEqual(false);

        right.intervals.addInterval(interval2);
        expect(left.equals(right)).toEqual(true);
    });

    it('raises definitionChanged event in all cases', function() {
        var interval1 = new TimeInterval(new JulianDate(10, 0), new JulianDate(12, 0), true, true, new ConstantProperty(new Cartesian3(1, 2, 3)));
        var interval2 = new TimeInterval(new JulianDate(12, 0), new JulianDate(14, 0), false, true, new ConstantProperty(new Cartesian3(4, 5, 6)));

        var property = new CompositeProperty();
        spyOn(property.definitionChanged, 'raiseEvent');

        property.intervals.addInterval(interval1);
        expect(property.definitionChanged.raiseEvent).toHaveBeenCalledWith(property);
        property.definitionChanged.raiseEvent.reset();

        property.intervals.addInterval(interval2);
        expect(property.definitionChanged.raiseEvent).toHaveBeenCalledWith(property);
        property.definitionChanged.raiseEvent.reset();

        property.intervals.removeInterval(interval2);
        expect(property.definitionChanged.raiseEvent).toHaveBeenCalledWith(property);
        property.definitionChanged.raiseEvent.reset();

        interval1.data.setValue(new Cartesian3());
        expect(property.definitionChanged.raiseEvent).toHaveBeenCalledWith(property);
        property.definitionChanged.raiseEvent.reset();

        property.intervals.clear();
        expect(property.definitionChanged.raiseEvent).toHaveBeenCalledWith(property);
        property.definitionChanged.raiseEvent.reset();
    });

    it('getValue throws with no time parameter', function() {
        var property = new CompositeProperty();
        expect(function() {
            property.getValue(undefined);
        }).toThrowDeveloperError();
    });
});