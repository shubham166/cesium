/*global define*/
define(['../Core/Color',
        '../Core/defined',
        '../Core/defineProperties',
        '../Core/Event',
        './ConstantProperty',
        './Property'
    ], function(
        Color,
        defined,
        defineProperties,
        Event,
        ConstantProperty,
        Property) {
    "use strict";

    /**
     * A {@link MaterialProperty} that maps to polyline outline {@link Material} uniforms.
     * @alias PolylineOutlineMaterialProperty
     * @constructor
     */
    var PolylineOutlineMaterialProperty = function() {
        this._definitionChanged = new Event();
        this._color = undefined;
        this._colorSubscription = undefined;
        this._outlineColor = undefined;
        this._outlineColorSubscription = undefined;
        this._outlineWidth = undefined;
        this._outlineWidthSubscription = undefined;
        this.color = new ConstantProperty(Color.WHITE);
        this.outlineColor = new ConstantProperty(Color.BLACK);
        this.outlineWidth = new ConstantProperty(0.0);
    };

    defineProperties(PolylineOutlineMaterialProperty.prototype, {
        /**
         * Gets a value indicating if this property is constant.  A property is considered
         * constant if getValue always returns the same result for the current definition.
         * @memberof PolylineOutlineMaterialProperty.prototype
         * @type {Boolean}
         */
        isConstant : {
            get : function() {
                return (!defined(this._color) || this._color.isConstant) &&
                       (!defined(this._outlineColor) || this._outlineColor.isConstant) &&
                       (!defined(this._outlineWidth) || this._outlineWidth.isConstant);
            }
        },
        /**
         * Gets the event that is raised whenever the definition of this property changes.
         * The definition is considered to have changed if a call to getValue would return
         * a different result for the same time.
         * @memberof PolylineOutlineMaterialProperty.prototype
         * @type {Event}
         */
        definitionChanged : {
            get : function() {
                return this._definitionChanged;
            }
        },
        /**
         * A {@link Color} {@link Property} which determines the polyline's color.
         * @memberof PolylineOutlineMaterialProperty.prototype
         * @type {Property}
         * @default new ConstantProperty(Color.WHITE)
         */
        color : {
            get : function() {
                return this._color;
            },
            set : function(value) {
                if (this._color !== value) {
                    if (this._colorSubscription) {
                        this._colorSubscription();
                        this._colorSubscription = undefined;
                    }
                    this._color = value;
                    if (defined(value)) {
                        this._colorSubscription = value.definitionChanged.addEventListener(PolylineOutlineMaterialProperty.prototype._raiseDefinitionChanged, this);
                    }
                    this._raiseDefinitionChanged(this);
                }
            }
        },
        /**
         * A {@link Color} {@link Property} which determines the polyline's outline color.
         * @memberof PolylineOutlineMaterialProperty.prototype
         * @type {Property}
         * @default new ConstantProperty(Color.BLACK)
         */
        outlineColor : {
            get : function() {
                return this._outlineColor;
            },
            set : function(value) {
                if (this._outlineColor !== value) {
                    if (this._outlineColorSubscription) {
                        this._outlineColorSubscription();
                        this._outlineColorSubscription = undefined;
                    }
                    this._outlineColor = value;
                    if (defined(value)) {
                        this._outlineColorSubscription = value.definitionChanged.addEventListener(PolylineOutlineMaterialProperty.prototype._raiseDefinitionChanged, this);
                    }
                    this._raiseDefinitionChanged(this);
                }
            }
        },
        /**
         * A Number {@link Property} which determines the polyline's outline width.
         * @type {Property}
         * @default new ConstantProperty(0)
         */
        outlineWidth : {
            get : function() {
                return this._outlineWidth;
            },
            set : function(value) {
                if (this._outlineWidth !== value) {
                    if (this._outlineWidthSubscription) {
                        this._outlineWidthSubscription();
                        this._outlineWidthSubscription = undefined;
                    }
                    this._outlineWidth = value;
                    if (defined(value)) {
                        this._outlineWidthSubscription = value.definitionChanged.addEventListener(PolylineOutlineMaterialProperty.prototype._raiseDefinitionChanged, this);
                    }
                    this._raiseDefinitionChanged(this);
                }
            }
        }
    });

    /**
     * Gets the {@link Material} type at the provided time.
     * @memberof PolylineOutlineMaterialProperty
     *
     * @param {JulianDate} time The time for which to retrieve the type.
     * @type {String} The type of material.
     */
    PolylineOutlineMaterialProperty.prototype.getType = function(time) {
        return 'PolylineOutline';
    };

    /**
     * Gets the value of the property at the provided time.
     * @memberof PolylineOutlineMaterialProperty
     *
     * @param {JulianDate} time The time for which to retrieve the value.
     * @param {Object} [result] The object to store the value into, if omitted, a new instance is created and returned.
     * @returns {Object} The modified result parameter or a new instance if the result parameter was not supplied.
     *
     * @exception {DeveloperError} time is required.
     */
    PolylineOutlineMaterialProperty.prototype.getValue = function(time, result) {
        if (!defined(result)) {
            result = {};
        }
        result.color = defined(this._color) ? this._color.getValue(time, result.color) : undefined;
        result.outlineColor = defined(this._outlineColor) ? this._outlineColor.getValue(time, result.outlineColor) : undefined;
        result.outlineWidth = defined(this._outlineWidth) ? this._outlineWidth.getValue(time) : undefined;
        return result;
    };

    /**
     * Compares this property to the provided property and returns
     * <code>true</code> if they are equal, <code>false</code> otherwise.
     * @memberof PolylineOutlineMaterialProperty
     *
     * @param {Property} [other] The other property.
     * @returns {Boolean} <code>true</code> if left and right are equal, <code>false</code> otherwise.
     */
    PolylineOutlineMaterialProperty.prototype.equals = function(other) {
        return this === other || //
               (other instanceof PolylineOutlineMaterialProperty && //
                Property.equals(this._color, other._color) && //
                Property.equals(this._outlineColor, other._outlineColor) && //
                Property.equals(this._outlineWidth, other._outlineWidth));
    };

    /**
     * @private
     */
    PolylineOutlineMaterialProperty.prototype._raiseDefinitionChanged = function(){
        this._definitionChanged.raiseEvent(this);
    };

    return PolylineOutlineMaterialProperty;
});