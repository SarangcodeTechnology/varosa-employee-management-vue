import Vue from 'vue'

const printControlBus = new Vue() ;

printControlBus.$on("isPrinting", (value) => {
    console.log("Print value received on main file: " + value) ;
})

export default printControlBus ;