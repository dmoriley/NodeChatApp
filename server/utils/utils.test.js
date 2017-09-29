const expect = require('expect');
const {isRealString} = require('./utils');

describe('isRealString', () => {
    it('should reject non-string values', () => {
        expect(isRealString(123)).toBeFalsy();
    });

    it('should reject a string with only spaces', () => {
        expect(isRealString('   ')).toBeFalsy();
    });

    it('should allow string with non space characters', () => {
        expect(isRealString('  david oriley  ')).toBeTruthy();
    });
});