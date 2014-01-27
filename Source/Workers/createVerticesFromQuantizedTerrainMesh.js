/*global define*/
define([
        '../Core/Cartesian3',
        '../Core/Cartographic',
        '../Core/Ellipsoid',
        '../Core/Extent',
        '../Core/Math',
        './createTaskProcessorWorker'
    ], function(
        Cartesian3,
        Cartographic,
        Ellipsoid,
        Extent,
        CesiumMath,
        createTaskProcessorWorker) {
    "use strict";

    var quantizedStride = 3;
    var vertexStride = 6;
    var maxShort = 32767;

    var cartesian3Scratch = new Cartesian3();
    var cartographicScratch = new Cartographic();

    var xIndex = 0;
    var yIndex = 1;
    var zIndex = 2;
    var hIndex = 3;
    var uIndex = 4;
    var vIndex = 5;

    function createVerticesFromQuantizedTerrainMesh(parameters, transferableObjects) {
        var quantizedVertices = parameters.quantizedVertices;
        var quantizedVertexCount = quantizedVertices.length / 3;
        var edgeVertexCount = parameters.westIndices.length + parameters.eastIndices.length +
                              parameters.southIndices.length + parameters.northIndices.length;
        var minimumHeight = parameters.minimumHeight;
        var maximumHeight = parameters.maximumHeight;
        var center = parameters.relativeToCenter;

        var extent = parameters.extent;
        var west = extent.west;
        var south = extent.south;
        var east = extent.east;
        var north = extent.north;

        var ellipsoid = Ellipsoid.clone(parameters.ellipsoid);

        var uBuffer = quantizedVertices.subarray(0, quantizedVertexCount);
        var vBuffer = quantizedVertices.subarray(quantizedVertexCount, 2 * quantizedVertexCount);
        var heightBuffer = quantizedVertices.subarray(quantizedVertexCount * 2, 3 * quantizedVertexCount);

        var vertexBuffer = new Float32Array(quantizedVertexCount * vertexStride + edgeVertexCount * vertexStride);

        for (var i = 0, bufferIndex = 0; i < quantizedVertexCount; ++i, bufferIndex += vertexStride) {
            var u = uBuffer[i] / maxShort;
            var v = vBuffer[i] / maxShort;
            var height = CesiumMath.lerp(minimumHeight, maximumHeight, heightBuffer[i] / maxShort);

            cartographicScratch.longitude = CesiumMath.lerp(west, east, u);
            cartographicScratch.latitude = CesiumMath.lerp(south, north, v);
            cartographicScratch.height = height;

            ellipsoid.cartographicToCartesian(cartographicScratch, cartesian3Scratch);

            vertexBuffer[bufferIndex + xIndex] = cartesian3Scratch.x - center.x;
            vertexBuffer[bufferIndex + yIndex] = cartesian3Scratch.y - center.y;
            vertexBuffer[bufferIndex + zIndex] = cartesian3Scratch.z - center.z;
            vertexBuffer[bufferIndex + hIndex] = height;
            vertexBuffer[bufferIndex + uIndex] = u;
            vertexBuffer[bufferIndex + vIndex] = v;
        }

        var edgeTriangleCount = Math.max(0, (edgeVertexCount - 4) * 2);
        var indexBuffer = new Uint16Array(parameters.indices.length + edgeTriangleCount * 3);
        indexBuffer.set(parameters.indices, 0);

        // TODO: ensure vertices are sorted on the server, and remove this.
        parameters.westIndices.sort(function(a, b) {
            return vBuffer[a] - vBuffer[b];
        });

        parameters.southIndices.sort(function(a, b) {
            return uBuffer[a] - uBuffer[b];
        });

        parameters.eastIndices.sort(function(a, b) {
            return vBuffer[a] - vBuffer[b];
        });

        parameters.northIndices.sort(function(a, b) {
            return uBuffer[a] - uBuffer[b];
        });

        // Add skirts.
        var vertexBufferIndex = quantizedVertexCount * vertexStride;
        var indexBufferIndex = parameters.indices.length;
        indexBufferIndex = addSkirt(vertexBuffer, vertexBufferIndex, indexBuffer, indexBufferIndex, parameters.westIndices, center, ellipsoid, extent, parameters.westSkirtHeight, true);
        vertexBufferIndex += parameters.westIndices.length * vertexStride;
        indexBufferIndex = addSkirt(vertexBuffer, vertexBufferIndex, indexBuffer, indexBufferIndex, parameters.southIndices, center, ellipsoid, extent, parameters.southSkirtHeight, false);
        vertexBufferIndex += parameters.southIndices.length * vertexStride;
        indexBufferIndex = addSkirt(vertexBuffer, vertexBufferIndex, indexBuffer, indexBufferIndex, parameters.eastIndices, center, ellipsoid, extent, parameters.eastSkirtHeight, false);
        vertexBufferIndex += parameters.eastIndices.length * vertexStride;
        indexBufferIndex = addSkirt(vertexBuffer, vertexBufferIndex, indexBuffer, indexBufferIndex, parameters.northIndices, center, ellipsoid, extent, parameters.northSkirtHeight, true);
        vertexBufferIndex += parameters.northIndices.length * vertexStride;

        transferableObjects.push(vertexBuffer.buffer);
        transferableObjects.push(indexBuffer.buffer);

        return {
            vertices : vertexBuffer.buffer,
            indices : indexBuffer.buffer
        };
    }

    function addSkirt(vertexBuffer, vertexBufferIndex, indexBuffer, indexBufferIndex, edgeVertices, center, ellipsoid, extent, skirtLength, isWestOrNorthEdge) {
        var start, end, increment;
        if (isWestOrNorthEdge) {
            start = edgeVertices.length - 1;
            end = -1;
            increment = -1;
        } else {
            start = 0;
            end = edgeVertices.length;
            increment = 1;
        }

        var previousIndex = -1;

        var vertexIndex = vertexBufferIndex / vertexStride;

        for (var i = start; i !== end; i += increment) {
            var index = edgeVertices[i];
            var offset = index * vertexStride;
            var u = vertexBuffer[offset + uIndex];
            var v = vertexBuffer[offset + vIndex];
            var h = vertexBuffer[offset + hIndex];

            cartographicScratch.longitude = CesiumMath.lerp(extent.west, extent.east, u);
            cartographicScratch.latitude = CesiumMath.lerp(extent.south, extent.north, v);
            cartographicScratch.height = h - skirtLength;

            var position = ellipsoid.cartographicToCartesian(cartographicScratch, cartesian3Scratch);
            Cartesian3.subtract(position, center, position);

            vertexBuffer[vertexBufferIndex++] = position.x;
            vertexBuffer[vertexBufferIndex++] = position.y;
            vertexBuffer[vertexBufferIndex++] = position.z;
            vertexBuffer[vertexBufferIndex++] = cartographicScratch.height;
            vertexBuffer[vertexBufferIndex++] = u;
            vertexBuffer[vertexBufferIndex++] = v;

            if (previousIndex !== -1) {
                indexBuffer[indexBufferIndex++] = previousIndex;
                indexBuffer[indexBufferIndex++] = vertexIndex - 1;
                indexBuffer[indexBufferIndex++] = index;

                indexBuffer[indexBufferIndex++] = vertexIndex - 1;
                indexBuffer[indexBufferIndex++] = vertexIndex;
                indexBuffer[indexBufferIndex++] = index;
            }

            previousIndex = index;
            ++vertexIndex;
        }

        return indexBufferIndex;
    }

    return createTaskProcessorWorker(createVerticesFromQuantizedTerrainMesh);
});