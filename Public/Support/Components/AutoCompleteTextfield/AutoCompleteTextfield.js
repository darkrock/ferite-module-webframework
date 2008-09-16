Autocompleter.MCAM = Class.create(Autocompleter.Base, {
	initialize: function(webframework_component, element, update, options) {
		this.baseInitialize(element, update, options);
		this.options.asynchronous  = true;
		this.webframework_component = webframework_component;
	},
	getUpdatedChoices: function() {
		var self = this;
		_(this.webframework_component).fireCallbackRequest( 'doAutoComplete', function( value ) {
			alert('got value');
			self.updateChoices(value);
		}, { complete_term: _(this.webframework_component).getState('text-value') });
	}
});

function ComponentAutoCompleteTextfield( id ) {
	var self = ComponentTextfield(id);
	return self;
}