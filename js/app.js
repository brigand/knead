Parse.initialize("afbV5ko6z5E8bh91esQlpe9o3ADw3Kit4pVWxJfT", "NFyUzhMO9kTDExBvpElmNrCJJTbpknOsf52dBe3g");

function App() {
    var self = this;

    // Input fields
    self.first_name = ko.observable('');
    self.last_name = ko.observable('');
    self.phone = ko.observable('');
    self.password = ko.observable('');
    self.card = ko.observable('');
    self.cvv = ko.observable('');
    self.expiration = ko.observable('2016');
    self.appointment_time = ko.observable();

    // App state values
    self.slide = ko.observable(0);
    self.back_button_text = ko.observable('BACK');
    self.show_navbar = ko.observable(false);
    self.show_account_button = ko.observable(true);

    // Call screens by name
    self.screens = ['', 'login', 'info/basic', 'info/card', ''];
    self.show = function(which) {

    }

    // Click handlers
    self.login = function() {
        // Not on login page; so go there
        // unless we're logged in; then jump to the main screen
        if (self.slide() != 1 && !self.logged_in() == false)
            self.slide(1);
    }

    self.fb_login = function() {

    }

    self.what_is_knead = function() {
        alert('not implemented');
    }

    self.register = function() {
        self.slide(2);
    }


    // Special handlers
    ko.bindingHandlers.left = {
        update: function(element, valueAccessor, allBindingsAccessor) {
            // First get the latest data that we're bound to
            var value = valueAccessor(), allBindings = allBindingsAccessor();

            // Next, whether or not the supplied model property is observable, get its current value
            var valueUnwrapped = ko.utils.unwrapObservable(value);

            // Grab some more data from another binding property
            var duration = allBindings.slideSpeed || 1000; // 400ms is default duration unless otherwise specified

            var slideNo = parseInt(valueUnwrapped);

            // Slide into the new screen
            $(element).animate({
                left: (-100 * slideNo) + "%"
            }, duration
            , function(){
                // TODO: check if we need to change the background

                $(element).find('.screen:nth-child(' + (slideNo + 1) + ')').find('input, select').first().focus();
            }); // Make the element visible



            $('html, body').scrollTop(0);
        }
    };

    // Settings
    self.appointment_times = [];
    self.expirations = [];
    for(var i=2013; i<2033; i++) self.expirations.push(i.toString());

    // Helper functions
    self.noop = function(){ return self.noop; };
}

var app = new App();
ko.applyBindings(app);

var TestObject = Parse.Object.extend("TestObject");
var testObject = new TestObject();
testObject.save({foo: "bar"}, {
    success: function(object) {
        $(".success").show();
    },
    error: function(model, error) {
        $(".error").show();
    }
});

$(window).resize(function () {
    var $this = $(this);
    var $body = $('body');

    // Client size
    var width = $this.width();
    var height = $this.height();

    // Image size
    var iw = 1920;
    var ih = 1080;

    // Note: Assumes image width larger than height (i.e. landscape)

    // Scale in percent, e.g., 1 is a computer with the same res as the image in full screen
    var background_scale;

    // Screen in landscape
    if (width / height > iw / ih) {
        background_scale = 1;
    }
    // Portrait
    else {
        background_scale = height / width * 2;
    }

    $body.css({
        'background-size': (background_scale * 100) + "%"
    });
}).resize();


