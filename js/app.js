Parse.initialize("afbV5ko6z5E8bh91esQlpe9o3ADw3Kit4pVWxJfT", "NFyUzhMO9kTDExBvpElmNrCJJTbpknOsf52dBe3g");

MIN_DELAY = 1; // Minimum hours between now and apointment time
MIN_HOUR = 8; // First time for appointments
MAX_HOUR = 22; // This is in 24 hour, so this would be 10pm

function App() {
    var self = this, i;

    // Settings
    // The first hour to show
    self.appointment_times = ko.computed(function () {
        var a = ['Appointment Time'];

        var now = new Date;

        // Find the first hour at least MIN_DELAY hours from now
        // or if it's very early, the first time
        var start_hour = Math.max(now.getHours() + (now.getMinutes() / 60) + MIN_DELAY, MIN_HOUR);

        // Round it to get an even hour
        start_hour = Math.ceil(start_hour);

        for (i = start_hour; i <= MAX_HOUR; i += 0.5) {
            var min, hour, time_of_day;

            // if we have a fraction, it's a half hour
            if (i != Math.floor(i))
                min = '30';
            else
                min = '00';

            hour = Math.floor(i);

            if (hour !== 0 && hour / 12 >= 1)
                time_of_day = 'pm';
            else
                time_of_day = 'am';

            // Turn hour into 0-12
            hour = hour % 12;

            if (hour === 0) hour = 12;
            a.push(hour + ':' + min + time_of_day);

            return a;
        }

    });

    self.expirations = ['Expiration'];
    for (i = 2013; i < 2033; i++) self.expirations.push(i.toString());
    self.gender_preferences = ['No Gender Preference', 'Male', 'Female'];

    // Input fields
    self.first_name = ko.observable('');
    self.last_name = ko.observable('');
    self.phone = ko.observable().extend({phone: 0});
    self.password = ko.observable('');
    self.card = ko.observable('');
    self.cvv = ko.observable('');
    self.expiration = ko.observable('2016');
    self.appointment_time = ko.observable();
    self.gender_preference = ko.observable();
    self.special_instructions = ko.observable('');

    // App state values
    self.slide = ko.observable(0);
    self.back_button_text = ko.observable('BACK');
    self.show_navbar = ko.observable(false);
    self.show_account_button = ko.observable(true);
    self.logged_in = ko.observable(false);


    // Call screens by name
    self.screens = ['landing', 'login', 'register', 'info/basic', 'info/card', ''];
    self.show = function (which) {
        if (which === 'next') {
            if (!self.logged_in())
                which = 'login';
            else if (!self.first_name())
                which = 'info/basic';
            else if (!self.card() && !self.has_card_set())
                which = 'info/card';
            else
                which = 'main';
        }

        for (var i = 0, name = ''; i < self.screens.length; i++) {
            name = self.screens[i];
            if (name === which) {
                // go to the slide of the matching index
                self.slide(i);
                return;
            }
        }
    }

    // Click handlers
    self.login = function () {
        // if on login page, just attempt to log in
        if (self.slide() == 1) {
            // TODO: implement login
            self.logged_in(true);
            self.show('next');
        }
        // otherwise have the screen handler guess where to go
        else
            self.show('next');
    }

    self.fb_login = function () {

    }

    self.what_is_knead = function () {
        alert('not implemented');
    }

    self.register = function () {
        if (self.slide() == 2) {
            // TODO: registration logic
            self.logged_in(true);
            self.show('next');
        }
        else
            self.show('register');
    }

    self.save_basic_info = function(){
        // TODO: save info to Parse
        self.slide('next');
    };

    self.save_card_info = function(){
        // TODO: save info to Parse
        self.slide('next');
    };




    // Special handlers
    ko.bindingHandlers.left = {
        update:function (element, valueAccessor, allBindingsAccessor) {
            // First get the latest data that we're bound to
            var value = valueAccessor(), allBindings = allBindingsAccessor();

            // Next, whether or not the supplied model property is observable, get its current value
            var valueUnwrapped = ko.utils.unwrapObservable(value);

            // Grab some more data from another binding property
            var duration = allBindings.slideSpeed || 1000; // 400ms is default duration unless otherwise specified

            var slideNo = parseInt(valueUnwrapped);

            // Slide into the new screen
            $(element).animate({
                    left:(-100 * slideNo) + "%"
                }, duration
                , function () {
                    // TODO: check if we need to change the background

                    $(element).find('.screen:nth-child(' + (slideNo + 1) + ')').find('input, select').first().focus();
                }); // Make the element visible


            $('html, body').scrollTop(0);
        }
    };

    // Helper functions
    self.noop = function () {
        return self.noop;
    };
}

var app = new App();
ko.applyBindings(app);

var TestObject = Parse.Object.extend("TestObject");
var testObject = new TestObject();
testObject.save({foo:"bar"}, {
    success:function (object) {
        $(".success").show();
    },
    error:function (model, error) {
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
        'background-size':(background_scale * 100) + "%"
    });
}).resize();


