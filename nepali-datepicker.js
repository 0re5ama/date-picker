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

        self.isPickerVisible = ko.observable(false);

        self.positionPicker = function() {
            const input = self.inputRef();
            if (!input) return;
            const picker = input.nextElementSibling;
            if (!picker) return;

            const inputRect = input.getBoundingClientRect();
            const pickerWidth = picker.offsetWidth;
            const viewportWidth = document.documentElement.clientWidth;

            let left = 0;
            if (inputRect.left + pickerWidth > viewportWidth) {
                left = input.offsetWidth - pickerWidth;
            }

            picker.style.left = left + 'px';
        };

        self.handleInputFocus = function (_, e) {
            self.inputRef(e.target);
            self.isPickerVisible(true);
            setTimeout(self.positionPicker, 0);
        };

        self.handleInputBlur = function (_, e) {
            const container = e.target.parentElement;
            if (e.relatedTarget && container.contains(e.relatedTarget)) {
                return;
            }
            self.isPickerVisible(false);
        };

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
            self.selectedDay(today.bsDay);
            self.value(formatBSDate(today.bsYear, today.bsMonth, today.bsDay, self.format, self.locale));

            // Ensure input remains focused after selection
            setTimeout(() => {
                const input = self.inputRef();
                if (input) input.focus();
            }, 0);
        };

        self.prevMonth = function() {
            if (self.currentMonth() === 0) {
                self.currentMonth(11);
                self.currentYear(self.currentYear() - 1);
            } else {
                self.currentMonth(self.currentMonth() - 1);
            }
        };

        self.nextMonth = function() {
            if (self.currentMonth() === 11) {
                self.currentMonth(0);
                self.currentYear(self.currentYear() + 1);
            } else {
                self.currentMonth(self.currentMonth() + 1);
            }
        };

        self.toDevanagari = toDevanagari;

        self.minDate = params.minDate || null;
        self.maxDate = params.maxDate || null;

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
        <div class="np-datepicker-container">
          <input type="text" class="np-input" data-bind="
              value: inputValue,
              valueUpdate: 'afterkeydown',
          attr: { autocomplete: 'off' },
          event: { focus: handleInputFocus, blur: handleInputBlur }" />
      <div class="np-datepicker" data-bind="visible: true">

        <!-- Toolbar Buttons -->
        <div class="np-toolbar">
          <button tabindex="-1" data-bind="click: prevMonth"><i class="fa-solid fa-chevron-left"></i></button>
          <button tabindex="-1" data-bind="click: goToToday"><i class="fa-solid fa-house-chimney"></i></button>
          <button tabindex="-1" data-bind="click: clearDate"><i class="fa-solid fa-ban"></i></button>

          <select tabindex="-1" class="np-scroll-select" data-bind="
              options: bsData.map(x => x.bsYear),
              value: currentYear,
              optionsText: locale === 'ne' ? (y => toDevanagari(y)) : undefined
          "></select>
          <select tabindex="-1" class="np-scroll-select" data-bind="
            options: monthNames,
            optionsText: locale === 'ne' ? (m => m.nep) : (m => m.eng),
            optionsValue: 'id',
            value: ko.computed({
              read: () => currentMonth() + 1,
              write: v => currentMonth(v - 1)
            })
          "></select>
          <button tabindex="-1" data-bind="click: nextMonth"><i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <!-- Days Grid -->
        <div class="np-grid">
          <div class="np-day-label" data-bind="text: $parent.locale === 'ne' ? 'आइत' : 'Sun'"></div>
          <div class="np-day-label" data-bind="text: $parent.locale === 'ne' ? 'सोम' : 'Mon'"></div>
          <div class="np-day-label" data-bind="text: $parent.locale === 'ne' ? 'मंगल' : 'Tue'"></div>
          <div class="np-day-label" data-bind="text: $parent.locale === 'ne' ? 'बुध' : 'Wed'"></div>
          <div class="np-day-label" data-bind="text: $parent.locale === 'ne' ? 'बिही' : 'Thu'"></div>
          <div class="np-day-label" data-bind="text: $parent.locale === 'ne' ? 'शुक्र' : 'Fri'"></div>
          <div class="np-day-label" data-bind="text: $parent.locale === 'ne' ? 'शनि' : 'Sat'"></div>
          <!-- ko foreach: calendarDays -->
            <div class="np-day-cell" data-bind="
              text: $data ? ($parent.locale === 'ne' ? $parent.toDevanagari($data) : $data) : '',
              click: $data && !$parent.isDisabled($data) ? () => $parent.selectDate($data) : null,
              css: {
                'np-empty': !$data,
                'np-clickable': $data && !$parent.isDisabled($data),
                'np-disabled': $data && $parent.isDisabled($data),
                'np-selected': $data === $parent.selectedDay()
              }
            "></div>
          <!-- /ko -->
        </div>
      </div>
    </div>
  `
});
