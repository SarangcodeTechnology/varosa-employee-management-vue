import NepaliDate from "nepali-date-converter";

const state = () => ({});

const mutations = {};

const actions = {};

const getters = {
  getHoursPerDate: (state) => ({roster, date, useNepaliCalendar}) => {
    for (const eachRoster of roster) {
      if (date === (useNepaliCalendar ? eachRoster.nepaliDay : eachRoster.englishDay)) {
        return eachRoster.workedHours ? eachRoster.workedHours : 0;
      }
    }
    return 0;
  },
  isWeekend: (state) => ({useNepaliCalendar, selectedYear, selectedMonth, selectedDate, clientWeekendList}) => {
      const day = useNepaliCalendar ? new NepaliDate(selectedYear, selectedMonth - 1, selectedDate).getDay() :
        new Date(selectedYear, selectedMonth - 1, selectedDate).getDay();
      // console.log(clientWeekendList);
      const weekendList = !!clientWeekendList ? clientWeekendList.split('') : [];
      if (weekendList.includes(day.toString())) {
        return true;
      }
      return false;
  },
  isHoliday: (state) => ({holidays, selectedMonth, useNepaliCalendar, date}) => {
    for (const holiday of holidays) {
      if (useNepaliCalendar) {
        if (holiday.nepaliMonth === selectedMonth && holiday.nepaliDay === date) {
          return true;
        }
      } else {
        if (holiday.englishMonth === selectedMonth && holiday.englishDay === date) {
          return true;
        }
      }
    }
    return false;
  },
  checkIsLeave: (state) => ({roster, date, useNepaliCalendar}) => {
    for (const eachRoster of roster) {
      if (date === (useNepaliCalendar ? eachRoster.nepaliDay : eachRoster.englishDay)) {
        return eachRoster.isLeave ? eachRoster.isLeave : false;
      }
    }
    return false;
  },
  checkIsSick: (state) => ({roster, date, useNepaliCalendar}) => {
    for (const eachRoster of roster) {
      if (date === (useNepaliCalendar ? eachRoster.nepaliDay : eachRoster.englishDay)) {
        return eachRoster.isSick ? eachRoster.isSick : false;
      }
    }
    return false;
  },
  checkIsAbsent: (state) => ({roster, date, useNepaliCalendar}) => {
    for (const eachRoster of roster) {
      if (date === (useNepaliCalendar ? eachRoster.nepaliDay : eachRoster.englishDay)) {
        return eachRoster.isAbsent ? eachRoster.isAbsent : false;
      }
    }
    return false;
  },
  checkIsOvertime: (state) => ({roster, date, useNepaliCalendar}) => {
    for (const eachRoster of roster) {
      if (date === (useNepaliCalendar ? eachRoster.nepaliDay : eachRoster.englishDay)) {
        return eachRoster.isOvertime ? eachRoster.isOvertime : false;
      }
    }
    return false;
  },
  checkIsReliever: (state) => ({roster, date, useNepaliCalendar}) => {
    for (const eachRoster of roster) {
      if (date === (useNepaliCalendar ? eachRoster.nepaliDay : eachRoster.englishDay)) {
        return eachRoster.isReliever ? eachRoster.isReliever : false;
      }
    }
    return false;
  },
  getRelievedEmployeeId: (state) => ({roster, date, useNepaliCalendar}) => {
    for (const eachRoster of roster) {
      if (date === (useNepaliCalendar ? eachRoster.nepaliDay : eachRoster.englishDay)) {
        return eachRoster.relievedEmployeeId;
      }
    }
    return null;
  },
  getHolidayBasicHoursPerDate: (state) => ({roster, date, useNepaliCalendar}) => {
    for (const eachRoster of roster) {
      if (date === (useNepaliCalendar ? eachRoster.nepaliDay : eachRoster.englishDay)) {
        return eachRoster.holidayBasicHours ? eachRoster.holidayBasicHours : 0;
      }
    }
    return 0;
  }

};

export default {
  state, mutations, actions, getters,
};

