
(function () {
    var valueHandler = ko.bindingHandlers.value;
    var getInjectValueUpdate = function (allBindingsAccessor) {
        var AFTERKEYDOWN = 'afterkeydown';
        return function () {
            var allBindings = ko.utils.extend({}, allBindingsAccessor()),
                valueUpdate = allBindings.valueUpdate;

            if (valueUpdate === undefined) {
                return ko.utils.extend(allBindings, { valueUpdate: AFTERKEYDOWN });
            } else if (typeof valueUpdate === 'string' && valueUpdate !== AFTERKEYDOWN) {
                return ko.utils.extend(allBindings, { valueUpdate: [valueUpdate, AFTERKEYDOWN] });
            } else if (typeof valueUpdate === 'array' && ko.utils.arrayIndexOf(valueUpdate, AFTERKEYDOWN) === -1) {
                valueUpdate = ko.utils.arrayPushAll([AFTERKEYDOWN], valueUpdate);
                return ko.utils.extend(allBindings, {valueUpdate: valueUpdate});
            }
            return allBindings;
        };
    };
    ko.bindingHandlers.value = {
        'init': function (element, valueAccessor, allBindingsAccessor) {
            allBindingsAccessor = getInjectValueUpdate(allBindingsAccessor);
            return valueHandler.init(element, valueAccessor, allBindingsAccessor);
        },
        'update': valueHandler.update
    };
} ());
