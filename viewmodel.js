function ViewModel () {
	const self = this;
	self.selectedDate = ko.observable('');
	self.selectedDateNew = ko.observable('2082-01-20');
	console.log('asdfasd');
};

document.addEventListener('DOMContentLoaded', () => {
	ko.applyBindings(new ViewModel());
});
