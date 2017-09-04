define(["jquery"], function($) {
    return {
        encodeHtmlAttr: function(attr) {
            return attr.replace(/'|"/g, function(match) {
                if (match == '"') {
                    return "&quot;";
                }
                return "&#39;";
            });
        },
        encodeHtml: function(html) {
            return $("<div></div>").text(html).html();
        },
        encodeHtmlAndAttr: function(content) {
            return this.encodeHtmlAttr($("<div></div>").text(content).html());
        },
        count: (function() {
            var count = 0;
            return function(num) {
                if (typeof num != "undefined") {
                    num = num || 0;
                } else {
                    num = 1;
                }
                count += num;
                return count;
            };
        })(),

        distance: function(pointA, pointB) {},
        // 根据给定点，计算最小包含矩形的四个点，按照顺时针顺序返回点集
        getRectPoints: function(points) {
            var xValues = points.map(function(item) { return item.x; }),
                yValues = points.map(function(item) { return item.x; }),
                minX = Math.min.apply(Math, xValues),
                minY = Math.min.apply(Math, yValues),
                maxX = Math.max.apply(Math, xValues),
                maxY = Math.max.apply(Math, yValues);
            return [
                { x: minX, y: minY },
                { x: maxX, y: minY },
                { x: maxX, y: maxY },
                { x: minX, y: maxY }
            ];
        },
        rectCoordCompare: function(rectA, rectB) {
            return {
                upperX: rect
            };
        },
        // is big contain small
        isRectContain: function(bigRect, smallRect) {
            if ((bigRect[0].x <= smallRect[0].x) &&
                (bigRect[0].y <= smallRect[0].y) &&
                (bigRect[1].x >= smallRect[1].x) &&
                (bigRect[1].y >= smallRect[1].y)) {
                return true;
            }
            return false;
        },
        isRectPureIntersect: function(rectA, rectB) {
            var isContain = this.isRectContain(rectA, rectB) || this.isRectContain(rectB, rectA);
            return !this.isRectNotIntersect(rectA, rectB) && !isContain;
        },
        isRectIntersect: function(rectA, rectB) {
            return !this.isRectNotIntersect(rectA, rectB);
        },
        isRectNotIntersect: function(rectA, rectB) {
            if ((rectA[0].x > rectB[1].x) ||
                (rectA[0].y > rectB[1].y) ||
                (rectB[0].x > rectA[1].x) ||
                (rectB[0].y > rectA[1].y)) {
                return true;
            }
            return false;
        },
        direction: {
            rightUp: 1,
            leftUp: 2,
            leftDown: 3,
            rightDown: 4
        },
        getPointDirection: function(pointA, pointB) {
            if (pointA.x > pointB.x && pointA.y >= pointB.y) {
                return this.direction.rightDown;
            }
            if (pointA.x < pointB.x && pointA.y <= pointB.y) {
                return this.direction.leftUp;
            }
            if (pointA.x >= pointB.x && pointA.y < pointB.y) {
                return this.direction.rightUp;
            }
            if (pointA.x < pointB.x && pointA.y >= pointB.y) {
                return this.direction.leftDown;
            }
        },
        getScaleOffset: function(index, lastPos, currPos) {
            var offset = {
                x: currPos.x - lastPos.x,
                y: currPos.y - lastPos.y
            }
            if (index == 1) {
                offset.x = -offset.x;
                offset.y = -offset.y;
            } else if (index == 2) {
                offset.y = -offset.y;
            } else if (index == 4) {
                offset.x = -offset.x;
            }
            return offset;
        },
        getPointsRectInfo: function(points) {
            var rect = this.getRectPoints(points),
                width = rect[2].x - rect[0].x,
                height = rect[2].y - rect[0].y,
                cx = (rect[0].x + rect[2].x) / 2,
                cy = (rect[0].y + rect[2].y) / 2;
            return {
                points: rect,
                height: height,
                width: width,
                cx: cx,
                cy: cy
            };
        },
        updatePoints: function(points, offset) {
            points.forEach(function(point) {
                point.x += offset.x;
                point.y += offset.y;
            });
            return points;
        },
        parsePointInt: function(points) {
            points.forEach(function(point) {
                point.x = parseInt(point.x);
                point.y = parseInt(point.y);
            });
            return points;
        },
    }
});