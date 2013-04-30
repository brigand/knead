//This rules checks the credit card details
//The card number (inferred) as well as the card type (via the card type field) are required
//This checks the length and starting digits of the card per the type
//It also checks the checksum (see http://en.wikipedia.org/wiki/Luhn_algorithm)
//The card type field must return 'vc' for visa, 'mc' for mastercard, 'ae' for amex
//This is based on code from here: http://www.rahulsingla.com/blog/2011/08/javascript-implementing-mod-10-validation-(luhn-formula)-for-credit-card-numbers
//Example:
//
//self.cardNumber.extend({ creditCard: self.cardType });
validation.rules['creditCard'] = {
    getValue: function (o) {
        return (typeof o === 'function' ? o() : o);
    },
    validator: function (val, cardTypeField) {
        var self = this;

        var cctype = self.getValue(cardTypeField);
        if (!cctype) return false;
        cctype = cctype.toLowerCase();

        if (val.length < 15) {
            return (false);
        }
        var match = cctype.match(/[a-zA-Z]{2}/);
        if (!match) {
            return (false);
        }

        var number = val;
        match = number.match(/[^0-9]/);
        if (match) {
            return (false);
        }

        var fnMod10 = function (number) {
            var doubled = [];
            for (var i = number.length - 2; i >= 0; i = i - 2) {
                doubled.push(2 * number[i]);
            }
            var total = 0;
            for (var i = ((number.length % 2) == 0 ? 1 : 0) ; i < number.length; i = i + 2) {
                total += parseInt(number[i]);
            }
            for (var i = 0; i < doubled.length; i++) {
                var num = doubled[i];
                var digit;
                while (num != 0) {
                    digit = num % 10;
                    num = parseInt(num / 10);
                    total += digit;
                }
            }

            if (total % 10 == 0) {
                return (true);
            } else {
                return (false);
            }
        }

        switch (cctype) {
            case 'vc':
            case 'mc':
            case 'ae':
                //Mod 10 check
                if (!fnMod10(number)) {
                    return false;
                }
                break;
        }
        switch (cctype) {
            case 'vc':
                if (number[0] != '4' || (number.length != 13 && number.length != 16)) {
                    return false;
                }
                break;
            case 'mc':
                if (number[0] != '5' || (number.length != 16)) {
                    return false;
                }
                break;

            case 'ae':
                if (number[0] != '3' || (number.length != 15)) {
                    return false;
                }
                break;

            default:
                return false;
        }

        return (true);
    },
    message: 'Card number not valid.'
};


ko.validation.rules['phone'] = {
    validator: function (val, otherVal) {
        return val === otherVal;
    },
    message: 'The field must equal {0}'
};
ko.validation.registerExtenders();