/*global define*/
define(['./PositionProperty',
        './Property',
        '../Core/Cartesian3',
        '../Core/defaultValue',
        '../Core/defined',
        '../Core/defineProperties',
        '../Core/DeveloperError',
        '../Core/Event',
        '../Core/ReferenceFrame'
    ], function(
        PositionProperty,
        Property,
        Cartesian3,
        defaultValue,
        defined,
        defineProperties,
        DeveloperError,
        Event,
        ReferenceFrame) {
    "use strict";

    /**
     * A {@link PositionProperty} whose value does not change in respect to the
     * {@link ReferenceFrame} in which is it defined.
     *
     * @alias ConstantPositionProperty
     * @constructor
     *
     * @param {Cartesian3} [value] The property value.
     * @param {ReferenceFrame} [referenceFrame=ReferenceFrame.FIXED] The reference frame in which the position is defined.
     */
    var ConstantPositionProperty = function(value, referenceFrame) {
        this._definitionChanged = new Event();
        this._value = Cartesian3.clone(value);
        this._referenceFrame = defaultValue(referenceFrame, ReferenceFrame.FIXED);
    };

    defineProperties(ConstantPositionProperty.prototype, {
        /**
         * Gets a value indicating if this property is constant.  A value is considered
         * constant if getValue always returns the same result for the current definition.
         * @memberof PositionProperty.prototype
         * @type {Boolean}
         */
        isConstant : {
            get : function() {
                return !defined(this._value) || this._referenceFrame === ReferenceFrame.FIXED;
            }
        },
        /**
         * Gets the event that is raised whenever the definition of this property changes.
         * The definition is considered to have changed if a call to getValue would return
         * a different result for the same time.
         * @memberof PositionProperty.prototype
         * @type {Event}
         */
        definitionChanged : {
            get : function() {
                return this._definitionChanged;
            }
        },
        /**
         * Gets the reference frame in which the position is defined.
         * @memberof ConstantPositionProperty.prototype
         * @Type {ReferenceFrame}
         * @default ReferenceFrame.FIXED;
         */
        referenceFrame : {
            get : function() {
                return this._referenceFrame;
            }
        }
    });

    /**
     * Gets the value of the property at the provided time in the fixed frame.
     * @memberof ConstantPositionProperty
     *
     * @param {JulianDate} time The time for which to retrieve the value.
     * @param {Object} [result] The object to store the value into, if omitted, a new instance is created and returned.
     * @returns {Object} The modified result parameter or a new instance if the result parameter was not supplied.
     *
     * @exception {DeveloperError} time is required.
     */
    ConstantPositionProperty.prototype.getValue = function(time, result) {
        return this.getValueInReferenceFrame(time, ReferenceFrame.FIXED, result);
    };

    /**
     * Sets the value of the property.
     * If the value is an object, the object must provide clone and equals functions.
     * @memberof ConstantPositionProperty
     *
     * @param {Cartesian3} value The property value.
     * @param {ReferenceFrame} [referenceFrame=this.referenceFrame] The reference frame in which the position is defined.
     */
    ConstantPositionProperty.prototype.setValue = function(value, referenceFrame) {
        var definitionChanged = false;
        if (!Cartesian3.equals(this._value, value)) {
            definitionChanged = true;
            this._value = Cartesian3.clone(value);
        }
        if (defined(referenceFrame) && this._referenceFrame !== referenceFrame) {
            definitionChanged = true;
            this._referenceFrame = defaultValue(this._referenceFrame, referenceFrame);
        }
        if (definitionChanged) {
            this._definitionChanged.raiseEvent(this);
        }
    };

    /**
     * Gets the value of the property at the provided time and in the provided reference frame.
     * @memberof ConstantPositionProperty
     *
     * @param {JulianDate} time The time for which to retrieve the value.
     * @param {ReferenceFrame} referenceFrame The desired referenceFrame of the result.
     * @param {Cartesian3} [result] The object to store the value into, if omitted, a new instance is created and returned.
     * @returns {Cartesian3} The modified result parameter or a new instance if the result parameter was not supplied.
     *
     * @exception {DeveloperError} time is required.
     * @exception {DeveloperError} referenceFrame is required.
     */
    ConstantPositionProperty.prototype.getValueInReferenceFrame = function(time, referenceFrame, result) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(time)) {
            throw new DeveloperError('time is required.');
        }
        if (!defined(referenceFrame)) {
            throw new DeveloperError('referenceFrame is required.');
        }
        //>>includeEnd('debug');

        return PositionProperty.convertToReferenceFrame(time, this._value, this._referenceFrame, referenceFrame, result);
    };

    /**
     * Compares this property to the provided property and returns
     * <code>true</code> if they are equal, <code>false</code> otherwise.
     * @memberof ConstantPositionProperty
     *
     * @param {Property} [other] The other property.
     * @returns {Boolean} <code>true</code> if left and right are equal, <code>false</code> otherwise.
     */
    ConstantPositionProperty.prototype.equals = function(other) {
        return this === other ||
               (other instanceof ConstantPositionProperty &&
                Cartesian3.equals(this._value, other._value) &&
                this._referenceFrame === other._referenceFrame);
    };

    return ConstantPositionProperty;
});