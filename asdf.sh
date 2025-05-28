 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/datepicker.css b/datepicker.css
index 76ec0b67a176c383fbc09d8b24a521537734fc67..09cee9edc6979cae96375db5350221afd6f0991b 100644
--- a/datepicker.css
+++ b/datepicker.css
@@ -4,32 +4,44 @@
   gap: 4px;
 }
 .np-day-label, .np-day-cell {
   text-align: center;
   padding: 6px;
 }
 .np-day-cell.np-empty {
   background-color: #f2f2f2;
 }
 .np-day-cell.np-clickable {
   cursor: pointer;
   background-color: white;
 }
 .np-day-cell.np-clickable:hover {
   background-color: #eee;
 }
 .np-day-cell.np-selected {
   background-color: #007bff;
   color: white;
 }
 .np-header {
   display: flex;
   justify-content: space-between;
   margin-bottom: 10px;
 }
+.np-datepicker-container {
+  position: relative;
+  display: inline-block;
+}
+
 .np-datepicker {
-	width: 20em;
+  position: absolute;
+  top: 100%;
+  left: 0;
+  width: 20em;
+  background: white;
+  border: 1px solid #ccc;
+  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
+  z-index: 1000;
 }
 
 .form {
 	display: flex;
 }
diff --git a/nepali-datepicker.js b/nepali-datepicker.js
index 991f540c74707ebd2db0b1e4a823225fad1addd1..2e3e1f54357fe43cf1d6665dd4ae201620974c48 100644
--- a/nepali-datepicker.js
+++ b/nepali-datepicker.js
@@ -1,92 +1,110 @@
 ko.components.register('nepali-datepicker', {
 	viewModel: function(params) {
 		const self = this;
 		self.bsData = bsCalendarData;
 		self.locale = params.locale || DatePickerConfig.locale;
 		self.format = params.format || DatePickerConfig.dateFormat;
 		self.value = params.value;
 
 		const todayBS = adToBs(new Date(), self.bsData);
 		self.currentYear = ko.observable(todayBS.bsYear);
 		self.currentMonth = ko.observable(todayBS.bsMonth);
 		self.selectedDay = ko.observable(todayBS.bsDay);
 
 		self.inputRef = ko.observable(null);
-		self.pickerRef = ko.observable(null);
 
 		self.monthNames = [
 			{ id: 1, eng: 'Baisakh', nep: 'बैशाख' },
 			{ id: 2, eng: 'Jestha', nep: 'जेठ' },
 			{ id: 3, eng: 'Ashadh', nep: 'असार' },
 			{ id: 4, eng: 'Shrawan', nep: 'श्रावण' },
 			{ id: 5, eng: 'Bhadra', nep: 'भदौ' },
 			{ id: 6, eng: 'Ashwin', nep: 'आश्विन' },
 			{ id: 7, eng: 'Kartik', nep: 'कार्तिक' },
 			{ id: 8, eng: 'Mangsir', nep: 'मंसिर' },
 			{ id: 9, eng: 'Poush', nep: 'पुष' },
 			{ id: 10, eng: 'Magh', nep: 'माघ' },
 			{ id: 11, eng: 'Falgun', nep: 'फाल्गुण' },
 			{ id: 12, eng: 'Chaitra', nep: 'चैत्र' }
 		];
 
 		self.getMonthStartAD = function(bsYear, bsMonthIndex) {
 			const yearData = self.bsData.find(y => y.bsYear === bsYear);
 			const baseDate = new Date(yearData.startDate);
 			const offset = yearData.months.slice(0, bsMonthIndex).reduce((a,b) => a + b, 0);
 			return new Date(baseDate.getTime() + offset * 86400000);
 		};
 
 		self.getMonthMeta = function(bsYear, bsMonthIndex) {
 			const startAD = self.getMonthStartAD(bsYear, bsMonthIndex);
 			const dayOfWeek = startAD.getDay();
 			const totalDays = self.bsData.find(y => y.bsYear === bsYear).months[bsMonthIndex];
 			return { dayOfWeek, totalDays };
 		};
 
 		self.calendarDays = ko.computed(() => {
 			const { dayOfWeek, totalDays } = self.getMonthMeta(self.currentYear(), self.currentMonth() - 1);
 			const days = [];
 			for (let i = 0; i < dayOfWeek; i++) days.push(null);
 			for (let d = 1; d <= totalDays; d++) days.push(d);
 			return days;
 		});
 
-		self.isPickerVisible = ko.observable(false);
+                self.isPickerVisible = ko.observable(false);
 
-		self.handleFocus = function () {
-			self.isPickerVisible(true);
-		};
+                self.positionPicker = function() {
+                        const input = self.inputRef();
+                        if (!input) return;
+                        const picker = input.nextElementSibling;
+                        if (!picker) return;
 
-		self.handleBlur = function (_, e) {
-			// Delay to allow clicks within the calendar to register before hiding
-			setTimeout(() => {
-				if (!e.target.contains(document.activeElement)) {
-					self.isPickerVisible(false);
-				}
-			}, 250);
-		};
+                        const inputRect = input.getBoundingClientRect();
+                        const pickerWidth = picker.offsetWidth;
+                        const viewportWidth = document.documentElement.clientWidth;
+
+                        let left = 0;
+                        if (inputRect.left + pickerWidth > viewportWidth) {
+                                left = input.offsetWidth - pickerWidth;
+                        }
+
+                        picker.style.left = left + 'px';
+                };
+
+                self.handleInputFocus = function (_, e) {
+                        self.inputRef(e.target);
+                        self.isPickerVisible(true);
+                        setTimeout(self.positionPicker, 0);
+                };
+
+                self.handleInputBlur = function (_, e) {
+                        const container = e.target.parentElement;
+                        if (e.relatedTarget && container.contains(e.relatedTarget)) {
+                                return;
+                        }
+                        self.isPickerVisible(false);
+                };
 
 		self.selectDate = function(day) {
 			self.selectedDay(day);
 			const formatted = formatBSDate(self.currentYear(), self.currentMonth() + 1, day, self.format, self.locale);
 			self.value(formatted);
 			setTimeout(() => {
 				const input = self.inputRef();
 				if (input) input.focus();
 			}, 0);
 		};
 
 		self.clearDate = function() {
 			self.value('');               // Clear the bound value
 			self.selectedDay(null);       // Clear the selected day
 			self.isPickerVisible(false);  // Optionally hide the calendar
 			setTimeout(() => {
 				const input = self.inputRef();
 				if (input) input.focus();   // Re-focus input to allow further typing
 			}, 0);
 		};
 
 		self.goToToday = function() {
 			const today = adToBs(new Date(), self.bsData);
 			self.currentYear(today.bsYear);
 			self.currentMonth(today.bsMonth - 1);
@@ -125,56 +143,56 @@ ko.components.register('nepali-datepicker', {
 
 		self.inputValue = ko.computed({
 			read: () => self.value(),
 			write: val => {
 				self.value(val);
 				const parts = val.split('-');
 				if (parts.length === 3) {
 					const [year, month, day] = parts.map(Number);
 					self.currentYear(year);
 					self.currentMonth(month - 1);
 					self.selectedDay(day);
 				}
 			}
 		});
 
 		self.isDisabled = function(day) {
 			if (!day) return true;
 			const adDate = bsToAd(self.currentYear(), self.currentMonth(), day, self.bsData);
 			if (self.minDate && adDate < new Date(self.minDate)) return true;
 			if (self.maxDate && adDate > new Date(self.maxDate)) return true;
 			return false;
 		};
 	},
 
 	template: `
-	<div class="np-datepicker-container" data-bind="event: { focusin: handleFocus, focusout: handleBlur }">
-	  <input type="text" class="np-input" data-bind="
-		  value: inputValue,
-		  valueUpdate: 'afterkeydown',
+        <div class="np-datepicker-container">
+          <input type="text" class="np-input" data-bind="
+                  value: inputValue,
+                  valueUpdate: 'afterkeydown',
           attr: { autocomplete: 'off' },
-          event: { focus: () => inputRef($element) }" />
+          event: { focus: handleInputFocus, blur: handleInputBlur }" />
 	  <div class="np-datepicker" data-bind="visible: isPickerVisible">
 
 		<!-- Toolbar Buttons -->
 		<div class="np-toolbar">
 		  <button tabindex="-1" data-bind="click: prevMonth">&#8592;</button>
 		  <button tabindex="-1" data-bind="click: goToToday">Today</button>
 		  <button tabindex="-1" data-bind="click: clearDate">Clear</button>
 		  <button tabindex="-1" data-bind="click: nextMonth">&#8594;</button>
 		</div>
 
 		<!-- Header -->
 		<div class="np-header">
 		  <select tabindex="-1" class="np-scroll-select" data-bind="options: bsData.map(x => x.bsYear), value: currentYear, optionsText: locale === 'ne' ? (y => toDevanagari(y)) : undefined"></select>
 		  <select tabindex="-1" class="np-scroll-select" data-bind="
 			options: monthNames,
 			optionsText: locale === 'ne' ? (m => m.nep) : (m => m.eng),
 			optionsValue: 'id',
 			value: ko.computed({
 			  read: () => currentMonth() + 1,
 			  write: v => currentMonth(v - 1)
 			})
 		  "></select>
 		</div>
 
 		<!-- Days Grid -->
 
EOF
)
