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

        distance: function(pointA, pointB){},
        // 根据对角线上点，计算矩形的四个点，按照顺时针顺序返回点集
        getRectPoints: function(pointA, pointB){
            var minX = Math.min(pointA.x, pointB.x),
                minY = Math.min(pointA.y, pointB.y),
                maxX = Math.max(pointA.x, pointB.x),
                maxY = Math.max(pointA.y, pointB.y);
            return [
                {x: minX, y: minY},
                {x: maxX, y: minY},
                {x: maxX, y: maxY},
                {x: minX, y: maxY}
            ];
        },
        rectCoordCompare: function(rectA, rectB){
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
        getPointDirection: function(pointA, pointB){
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
        getScaleOffset: function(index, lastPos, currPos){
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
    }
});