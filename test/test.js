var assert = require('assert');
var Utils = require("../public/Utils");


describe('Utils', function() {
  describe('getPositionByIndex', function() {
    it('should return valid position', function() {
    	const pos=Utils.getPositionByIndex(1, 4);
		assert.equal(pos.x, 1);
		assert.equal(pos.y, 0);
    });
  });

  describe('getIndexByPosition', function() {
    it('should return valid position', function() {
    	const pos=Utils.getIndexByPosition({x:1, y:0}, 4);
		assert.equal(pos, 1);
    });
  });

  describe('isSolved', function() {
    it('should return true', function() {
    	const value=Utils.isSolved([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0]);
		assert.equal(value, true);
    });
    it('should return false', function() {
    	const value=Utils.isSolved([1,2,3,4,5,6,7,8,9,0,11,12,13,14,15,10]);
		assert.equal(value, false);
    });
  });


  describe('getAdjacents', function() {
    it('should return 2 Adjacents', function() {
    	const value=Utils.getAdjacents(0, 4);
		assert.equal(value.length, 2);
    });
  });
});