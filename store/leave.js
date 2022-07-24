import NepaliDate from "nepali-date-converter";

const state = () => ({
  leaveDetails: {
    allLeaves: [],
    allLeavesPreviousFiscalYear: [],
  },
});

const mutations = {};

const actions = {
  getEmployeeLeaveDetails({state,dispatch},payload) {
    let currentNepaliDate = new NepaliDate();
    let selectedNepaliYear = currentNepaliDate.getYear();
    let selectedNepaliMonth = currentNepaliDate.getMonth() + 1;

    let requestBodyForThisFiscalYear = {
      employeeId: payload.id,
      nepaliYear: selectedNepaliYear
    };
    let requestBodyForPreviousFiscalYear = {
      employeeId: payload.id,
      nepaliYear: selectedNepaliYear - 1
    };

    if (selectedNepaliMonth <= 3) {
      requestBodyForThisFiscalYear.nepaliYear = requestBodyForThisFiscalYear.nepaliYear - 1;
      requestBodyForPreviousFiscalYear.nepaliYear = requestBodyForThisFiscalYear.nepaliYear - 1;
    }


    // Leave Details for current fiscal year
    dispatch("api/makePostRequest",
      {
        route: "employeeLeaves/get/nepaliFiscalYear",
        data: {
          ...requestBodyForThisFiscalYear
        }
      },{root:true}
    ).then(response => {
      if (response.data.status === "OK") {
        state.leaveDetails.allLeaves = response.data.data;
      }
    }).catch((error) => {
    });

    // Leave Details for previous fiscal year
    dispatch("api/makePostRequest",
      {
        route: "employeeLeaves/get/nepaliFiscalYear",
        data: {
          ...requestBodyForPreviousFiscalYear
        }
      },{root:true}
    ).then(response => {
      if (response.data.status === "OK") {
        state.leaveDetails.allLeavesPreviousFiscalYear = response.data.data;
      }
    }).catch((error) => {
    });

  },
};

const getters = {
  allLeaves(state){
    return state.leaveDetails.allLeaves;
  },
  allLeavesPreviousFiscalYear(state){
    return state.leaveDetails.allLeavesPreviousFiscalYear;
  },
  annualLeaves(state) {
    return state.leaveDetails.allLeaves.filter(item => item.leaveType === 'ANNUAL')
  },
  sickLeaves(state) {
    return state.leaveDetails.allLeaves.filter(item => item.leaveType === 'SICK')
  },
  annualLeavesPreviousFiscalYear(state) {
    return state.leaveDetails.allLeavesPreviousFiscalYear.filter(item => item.leaveType === 'ANNUAL');
  },
  sickLeavesPreviousFiscalYear(state) {
    return state.leaveDetails.allLeavesPreviousFiscalYear.filter(item => item.leaveType === 'SICK');
  },
  paidLeavesPreviousFiscalYear(state) {
    return state.leaveDetails.allLeavesPreviousFiscalYear.filter(item => item.leaveType === 'PAID');
  },
};

export default {
  state, mutations, actions, getters,
};

