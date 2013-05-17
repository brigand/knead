MIN_DELAY = 1; // Minimum hours between now and apointment time
MIN_HOUR = 12; // First time for appointments
MAX_HOUR = 20; // This is in 24 hour, so this would be 10pm
RATE = '45.00'; // USD per hour

function App() {
    var self = this, i;

    // Settings
    // The first hour to show
    self.appointment_times = ko.computed(function () {
        var a = ['Appointment Time'];

        var now = new Date;

        // Find the first hour at least MIN_DELAY hours from now
        // or if it's very early, the first time
        var next_hour = now.getHours() + (now.getMinutes() / 60) + MIN_DELAY;
        if (Math.ceil(next_hour) > MAX_HOUR)
            next_hour = MIN_HOUR;

            next_hour = Math.ceil(next_hour);



        var start_hour = Math.max(next_hour, MIN_HOUR);
        console.log(start_hour);

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
        }

        return a;

    });

    self.expirations = ['Expiration'];
    for (i = 2013; i < 2033; i++) self.expirations.push(i.toString());
    self.gender_preferences = ['No Gender Preference', 'Male', 'Female'];

    // Input fields
    self.first_name = ko.observable('');
    self.last_name = ko.observable('');
    self.phone = ko.observable().extend({phone: 0});
    self.password = ko.observable('');
    self.address = ko.observable('');
    self.zip = ko.observable('');
    self.card = ko.observable('');
    self.cvv = ko.observable('');
    self.expiration = ko.observable('2016');
    self.appointment_time = ko.observable();
    self.gender_preference = ko.observable();
    self.special_instructions = ko.observable('');

    // App state values
    self.slide = ko.observable(0);
    self.back_button_text = ko.computed(function(){
        var slide = self.slide();
        if (slide > 1)
            return 'LOG OUT';
        else
            return 'BACK';
    });
    self.show_navbar = ko.computed(function(){ return self.slide() > 0; });
    self.show_account_button = ko.observable(true);
    self.logged_in = ko.observable(false);
    self.has_card_set = ko.observable(false);


    // Call screens by name
    self.screens = ['landing', 'login', 'register', 'info/basic', 'info/address', 'info/card', 'main', 'confirm'];
    self.show = function (which) {

        // On load we may be logged in already
        if (Parse.User.current() && !self.logged_in()) {
            self.login();
            return;
        }

        if (which === 'next') {
            if (!self.logged_in())
                which = 'login';
            else if (!self.first_name())
                which = 'info/basic';
            else if (!self.address() || !self.zip())
                which = 'info/address';
            else if (!self.card() && !self.has_card_set())
                which = 'info/card';
            else if (!self.appointment_time() || self.gender_preference() === self.gender_preferences[0])
                which = 'main';
            else
                which = 'confirm';
        }
        if (which === 'prev') {
            self.slide(self.slide() - 1);
            return;
        }

        for (var i = 0, name = ''; i < self.screens.length; i++) {
            name = self.screens[i];
            if (name === which) {
                // go to the slide of the matching index
                self.slide(i);
                return;
            }
        }
        console.error("I can't find slide", which);
    }

    self.back = function(){
        if (self.back_button_text() === 'LOG OUT') {
            self.notify.title("log out");
            self.notify.text("Are you sure you would like to log out?");
            self.notify.options([
                {text: "Yes", handle: function(){
                    Parse.User.logOut();
                    self.logged_in(false);
                    self.password('');
                    self.slide(0);
                    self.notify.show(false);
                }},
                {text: "Cancel", handle: self.notify.cancel}
            ]);
            self.notify.show(true);
        }
        else {
            self.show('prev');
        }
    }

    // Click handlers
    self.login = function () {
        var user = Parse.User.current();

        var load = function(from, to){
            var tmp = user.get(from);
            if (typeof self[to] === "function") self[to](tmp || '');
            else console.warn('View Model has no observable', to, '-- it is a', typeof self[to]);
        }

        if (user) {
            load("first", "first_name");
            load("last", "last_name");
            load("phone", "phone");
            load("address", "address");
            load("zip", "zip");

            self.logged_in(true);
            self.show('next');
        }

        // if on login page, just attempt to log in
        else if (self.slide() == 1 || self.slide() == 2) {
            Parse.User.logIn(self.phone(), self.password(), {
                success: function(user) {
                    self.first_name(user.get("first"));
                    self.last_name(user.get("last"));

                    self.logged_in(true);
                    self.show('next');
                },
                error: function(user, error) {
                    console.error(error);
                }
            });
        }
        // otherwise have the screen handler guess where to go
        else
            self.show('next');
    }

    self.fb_login = function () {

    }

    self.register = function () {
        if (self.slide() == 2) {
            Parse.User.signUp(self.phone(), self.password(), {
                ACL: new Parse.ACL(),
                first: self.first_name(),
                last: self.last_name()
            }, {
                success: function(user) {
                    self.login();
                },
                error: function(user, error) {
                    // TODO: fix this
                    alert("can't log in");
                }
            });
            self.logged_in(true);
            self.show('next');
        }
        else
            self.show('register');
    }

    self.save_basic_info = function(){
        var user = Parse.User.current();
        user.set("first", self.first_name());
        user.set("last", self.last_name());
        user.save();
        self.show('next');
    }

    self.save_address_info = function () {
        var user = Parse.User.current();
        user.set("address", self.address());
        user.set("zip", self.zip());
        user.save();
        self.show('next');
    }

    self.notify = {
        show: ko.observable(false),
        title: ko.observable("title"),
        text: ko.observable("text"),
        options: ko.observableArray(),
        cancel: function(){
            console.log("cancel");

            // Do this first so the option's handle may reshow a notification
            self.notify.show(false);

            _.any(self.notify.options, function(o){
                var text = o.text.toLowerCase();
                if (_.indexOf(['no', 'cancel', 'deny'], text)) {
                    if (typeof o.handle === 'function' && o.handle !== self.notify.cancel) o.handle();
                    return true;
                }
                return false;
            });

        }
    };

    self.notify.options([
        {text: "Okay", handle: function(){}},
        {text: "Cancel", handle: self.notify.cancel}
    ]);

    self.save_card_info = function(){
        var stripeResponseHandler = function(status, response) {
            var $form = $($('form')[self.slide()]);

            if (response.error) {
                $form.find('button').prop('disabled', false);
            }
            else {
                var token = response.id;

                Parse.Cloud.run('card_info', {}, {
                     success: function(result) {
                        alert('saved');
                     },
                     error: function(error) {
                        console.error(error);
                        alert('error, check console');
                     }
                 });

            }
        };
        self.show('next');
    };

    self.get_massage = function() {
        self.show('confirm')
    }


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

                    if(isNaN(slideNo))
                        console.error('Bad slide number', self.slide());
                    else
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

// Parse is loaded remotely, so this prevents offline crashed durring development
if (typeof Parse !== "undefined") {
    Parse.initialize("afbV5ko6z5E8bh91esQlpe9o3ADw3Kit4pVWxJfT", "NFyUzhMO9kTDExBvpElmNrCJJTbpknOsf52dBe3g");
/*
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
    */
}


var app = new App();
ko.applyBindings(app);

// Check for a session user
if (Parse.User.current()) {
    app.show('next');
}

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


