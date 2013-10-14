/*global defineSuite*/
defineSuite([
             'DynamicScene/EllipsoidGeometryUpdater',
             'DynamicScene/GeometryVisualizer',
         'Specs/createScene',
         'Specs/destroyScene',
         'DynamicScene/ConstantProperty',
         'DynamicScene/ConstantPositionProperty',
         'Core/JulianDate',
         'Core/Math',
         'Core/Matrix3',
         'Core/Matrix4',
         'Core/Quaternion',
         'Core/Cartesian3',
         'Core/Spherical',
         'Core/Color',
         'DynamicScene/DynamicEllipsoid',
         'DynamicScene/DynamicObjectCollection',
         'DynamicScene/ColorMaterialProperty'
     ], function(
         EllipsoidGeometryUpdater,
         GeometryVisualizer,
         createScene,
         destroyScene,
         ConstantProperty,
         ConstantPositionProperty,
         JulianDate,
         CesiumMath,
         Matrix3,
         Matrix4,
         Quaternion,
         Cartesian3,
         Spherical,
         Color,
         DynamicEllipsoid,
         DynamicObjectCollection,
         ColorMaterialProperty) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    var scene;
    var visualizer;

    beforeAll(function() {
        scene = createScene();
    });

    afterAll(function() {
        destroyScene(scene);
    });

    afterEach(function() {
        visualizer = visualizer && visualizer.destroy();
    });

    it('constructor throws if no scene is passed.', function() {
        expect(function() {
            return new GeometryVisualizer(EllipsoidGeometryUpdater);
        }).toThrow();
    });

    it('constructor sets expected parameters.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new GeometryVisualizer(EllipsoidGeometryUpdater, scene, dynamicObjectCollection);
        expect(visualizer.getScene()).toEqual(scene);
        expect(visualizer.getDynamicObjectCollection()).toEqual(dynamicObjectCollection);
    });

    it('update throws if no time specified.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new GeometryVisualizer(EllipsoidGeometryUpdater, scene, dynamicObjectCollection);
        expect(function() {
            visualizer.update();
        }).toThrow();
    });

    it('update does nothing if no dynamicObjectCollection.', function() {
        visualizer = new GeometryVisualizer(EllipsoidGeometryUpdater, scene);
        visualizer.update(new JulianDate());
    });

    it('isDestroy returns false until destroyed.', function() {
        visualizer = new GeometryVisualizer(EllipsoidGeometryUpdater, scene);
        expect(visualizer.isDestroyed()).toEqual(false);
        visualizer.destroy();
        expect(visualizer.isDestroyed()).toEqual(true);
        visualizer = undefined;
    });

    it('object with no ellipsoid does not create a primitive.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new GeometryVisualizer(EllipsoidGeometryUpdater, scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.position = new ConstantPositionProperty(new Cartesian3(1234, 5678, 9101112));
        testObject.orientation = new ConstantProperty(new Quaternion(0, 0, 0, 1));
        visualizer.update(new JulianDate());
        expect(scene.getPrimitives().getLength()).toEqual(0);
    });

    it('object with no position does not create a primitive.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new GeometryVisualizer(EllipsoidGeometryUpdater, scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.orientation = new ConstantProperty(new Quaternion(0, 0, 0, 1));
        var ellipsoid = testObject.ellipsoid = new DynamicEllipsoid();
        ellipsoid.radii = new ConstantProperty(new Cartesian3(1, 2, 3));
        visualizer.update(new JulianDate());
        expect(scene.getPrimitives().getLength()).toEqual(0);
    });

    it('object with no radii does not create a primitive.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new GeometryVisualizer(EllipsoidGeometryUpdater, scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.position = new ConstantPositionProperty(new Cartesian3(1234, 5678, 9101112));
        testObject.orientation = new ConstantProperty(new Quaternion(0, 0, 0, 1));
        testObject.ellipsoid = new DynamicEllipsoid();
        visualizer.update(new JulianDate());
        expect(scene.getPrimitives().getLength()).toEqual(0);
    });

    it('object with no orientation does not create a primitive.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new GeometryVisualizer(EllipsoidGeometryUpdater, scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.position = new ConstantPositionProperty(new Cartesian3(1234, 5678, 9101112));
        testObject.ellipsoid = new DynamicEllipsoid();
        testObject.ellipsoid.radii = new ConstantProperty(new Cartesian3(1, 2, 3));
        visualizer.update(new JulianDate());
        expect(scene.getPrimitives().getLength()).toEqual(0);
    });

    it('A DynamicEllipsoid causes a EllipsoidPrimitive to be created and updated.', function() {
        var time = new JulianDate();
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new GeometryVisualizer(EllipsoidGeometryUpdater, scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.position = new ConstantPositionProperty(new Cartesian3(1234, 5678, 9101112));
        testObject.orientation = new ConstantProperty(new Quaternion(0, 0, Math.sin(CesiumMath.PI_OVER_FOUR), Math.cos(CesiumMath.PI_OVER_FOUR)));

        var ellipsoid = testObject.ellipsoid = new DynamicEllipsoid();
        ellipsoid.radii = new ConstantProperty(123.5);
        ellipsoid.show = new ConstantProperty(true);
        ellipsoid.material = new ColorMaterialProperty();
        visualizer.update(time);

        expect(scene.getPrimitives().getLength()).toEqual(1);
    });

    it('clear hides ellipsoids.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new GeometryVisualizer(EllipsoidGeometryUpdater, scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.position = new ConstantPositionProperty(new Cartesian3(1234, 5678, 9101112));
        testObject.orientation = new ConstantProperty(new Quaternion(0, 0, 0, 1));
        var ellipsoid = testObject.ellipsoid = new DynamicEllipsoid();
        ellipsoid.radii = new ConstantProperty(new Cartesian3(1, 2, 3));

        var time = new JulianDate();
        expect(scene.getPrimitives().getLength()).toEqual(0);
        visualizer.update(time);
        expect(scene.getPrimitives().getLength()).toEqual(1);
        expect(scene.getPrimitives().get(0).show).toEqual(true);
        dynamicObjectCollection.removeAll();
        visualizer.update(time);
        expect(scene.getPrimitives().getLength()).toEqual(0);
    });

    it('Visualizer sets dynamicObject property.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new GeometryVisualizer(EllipsoidGeometryUpdater, scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.position = new ConstantPositionProperty(new Cartesian3(1234, 5678, 9101112));
        testObject.orientation = new ConstantProperty(new Quaternion(0, 0, 0, 1));
        var ellipsoid = testObject.ellipsoid = new DynamicEllipsoid();
        ellipsoid.radii = new ConstantProperty(new Cartesian3(1, 2, 3));

        var time = new JulianDate();
        visualizer.update(time);

        var primitive = scene.getPrimitives().get(0);
        expect(primitive.geometryInstances[0].id).toEqual(testObject);
    });

    it('setDynamicObjectCollection removes old objects and add new ones.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.position = new ConstantPositionProperty(new Cartesian3(1234, 5678, 9101112));
        testObject.orientation = new ConstantProperty(new Quaternion(0, 0, 0, 1));
        var ellipsoid = testObject.ellipsoid = new DynamicEllipsoid();
        ellipsoid.radii = new ConstantProperty(new Cartesian3(1, 2, 3));

        var dynamicObjectCollection2 = new DynamicObjectCollection();
        var testObject2 = dynamicObjectCollection2.getOrCreateObject('test2');
        testObject2.position = new ConstantPositionProperty(new Cartesian3(5678, 9101112, 1234));
        testObject2.orientation = new ConstantProperty(new Quaternion(1, 0, 0, 0));
        var ellipsoid2 = testObject2.ellipsoid = new DynamicEllipsoid();
        ellipsoid2.radii = new ConstantProperty(new Cartesian3(4, 5, 6));

        visualizer = new GeometryVisualizer(EllipsoidGeometryUpdater, scene, dynamicObjectCollection);

        var time = new JulianDate();

        visualizer.update(time);
        scene.render();
        expect(scene.getPrimitives().getLength()).toEqual(1);
        var primitive = scene.getPrimitives().get(0);
        expect(primitive.getGeometryInstanceAttributes(testObject)).toBeDefined();

        visualizer.setDynamicObjectCollection(dynamicObjectCollection2);
        visualizer.update(time);
        scene.render();
        expect(scene.getPrimitives().getLength()).toEqual(1);
        primitive = scene.getPrimitives().get(0);
        expect(primitive.getGeometryInstanceAttributes(testObject)).toBeUndefined();
        expect(primitive.getGeometryInstanceAttributes(testObject2)).toBeDefined();
    });
}, 'WebGL');
