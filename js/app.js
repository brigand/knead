Parse.initialize("afbV5ko6z5E8bh91esQlpe9o3ADw3Kit4pVWxJfT", "NFyUzhMO9kTDExBvpElmNrCJJTbpknOsf52dBe3g");


function App() {

}

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

